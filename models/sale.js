const db = require('../database/db');

class Sale {
    static create(cashRegisterId, userId, items, paymentMethod, receivedAmount) {
        return new Promise(async (resolve, reject) => {
            // Calcular total
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const changeAmount = parseFloat(receivedAmount) - total;

            // Insertar venta
            const saleSql = `
                INSERT INTO sales (cash_register_id, user_id, total, payment_method, received_amount, change_amount) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(saleSql, [cashRegisterId, userId, total, paymentMethod, receivedAmount, changeAmount], function(err) {
                if (err) {
                    reject(err);
                } else {
                    const saleId = this.lastID;

                    // Insertar items de la venta y actualizar stock
                    const itemPromises = items.map(item => {
                        return new Promise((resolveItem, rejectItem) => {
                            const itemSql = `
                                INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) 
                                VALUES (?, ?, ?, ?, ?)
                            `;
                            const subtotal = item.price * item.quantity;

                            db.run(itemSql, [saleId, item.productId, item.quantity, item.price, subtotal], function(err) {
                                if (err) {
                                    rejectItem(err);
                                } else {
                                    // Actualizar stock del producto
                                    const updateStockSql = `
                                        UPDATE products 
                                        SET stock = stock - ?,
                                            updated_at = CURRENT_TIMESTAMP
                                        WHERE id = ?
                                    `;
                                    db.run(updateStockSql, [item.quantity, item.productId], (err) => {
                                        if (err) {
                                            rejectItem(err);
                                        } else {
                                            resolveItem();
                                        }
                                    });
                                }
                            });
                        });
                    });

                    Promise.all(itemPromises)
                        .then(() => resolve({ id: saleId, total, changeAmount }))
                        .catch(err => reject(err));
                }
            });
        });
    }

    static getAll(limit = 100) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT s.*, u.username, cr.id as cash_register_id
                FROM sales s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN cash_registers cr ON s.cash_register_id = cr.id
                ORDER BY s.created_at DESC
                LIMIT ?
            `;
            
            db.all(sql, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT s.*, u.username 
                FROM sales s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static getItems(saleId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT si.*, p.name 
                FROM sale_items si
                JOIN products p ON si.product_id = p.id
                WHERE si.sale_id = ?
            `;
            
            db.all(sql, [saleId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getTodaySales(cashRegisterId = null) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT COALESCE(SUM(total), 0) as total
                FROM sales
                WHERE DATE(created_at) = DATE('now', 'localtime')
            `;
            const params = [];

            if (cashRegisterId) {
                sql += ' AND cash_register_id = ?';
                params.push(cashRegisterId);
            }
            
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.total : 0);
                }
            });
        });
    }

    static getTopProducts(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.name, SUM(si.quantity) as total_quantity, SUM(si.subtotal) as total_sales
                FROM sale_items si
                JOIN products p ON si.product_id = p.id
                JOIN sales s ON si.sale_id = s.id
                WHERE DATE(s.created_at) = DATE('now', 'localtime')
                GROUP BY p.id, p.name
                ORDER BY total_quantity DESC
                LIMIT ?
            `;
            
            db.all(sql, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getSalesByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT DATE(created_at) as date, COUNT(*) as total_sales, SUM(total) as total_amount
                FROM sales
                WHERE DATE(created_at) BETWEEN ? AND ?
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `;
            
            db.all(sql, [startDate, endDate], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Sale;