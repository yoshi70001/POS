const db = require('../database/db');

class Inventory {
    static addMovement(productId, type, quantity, reason, userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO inventory_movements (product_id, type, quantity, reason, user_id) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [productId, type, quantity, reason, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, productId, type, quantity });
                }
            });
        });
    }

    static getMovements(productId = null, limit = 100) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT im.*, p.name, u.username 
                FROM inventory_movements im
                JOIN products p ON im.product_id = p.id
                JOIN users u ON im.user_id = u.id
            `;
            const params = [];

            if (productId) {
                sql += ' WHERE im.product_id = ?';
                params.push(productId);
            }

            sql += ' ORDER BY im.created_at DESC LIMIT ?';
            params.push(limit);
            
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getLowStockProducts() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM products 
                WHERE stock <= min_stock 
                ORDER BY stock ASC
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static adjustStock(productId, newStock, userId, reason) {
        return new Promise((resolve, reject) => {
            // Primero obtener el stock actual
            const getSql = 'SELECT stock FROM products WHERE id = ?';
            
            db.get(getSql, [productId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Producto no encontrado'));
                } else {
                    const currentStock = row.stock;
                    const difference = newStock - currentStock;
                    const type = difference > 0 ? 'entrada' : 'salida';

                    // Actualizar stock
                    const updateSql = `
                        UPDATE products 
                        SET stock = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    
                    db.run(updateSql, [newStock, productId], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            // Registrar movimiento
                            Inventory.addMovement(productId, type, Math.abs(difference), reason, userId)
                                .then(() => resolve({ productId, newStock }))
                                .catch(err => reject(err));
                        }
                    });
                }
            });
        });
    }

    static getSummary() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_products,
                    SUM(stock) as total_items,
                    SUM(CASE WHEN stock <= min_stock THEN 1 ELSE 0 END) as low_stock_count,
                    SUM(stock * price) as total_value
                FROM products
            `;
            
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}

module.exports = Inventory;