const db = require('../database/db');

class CashRegister {
    static open(userId, openingAmount) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO cash_registers (user_id, opening_amount, opening_time, status) 
                VALUES (?, ?, datetime('now', 'localtime'), 'abierta')
            `;
            
            db.run(sql, [userId, openingAmount], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, userId, openingAmount });
                }
            });
        });
    }

    static close(registerId, closingAmount, notes = '') {
        return new Promise((resolve, reject) => {
            // Primero obtener información del turno
            const getSql = `
                SELECT cr.*, 
                       (SELECT COALESCE(SUM(total), 0) FROM sales WHERE cash_register_id = cr.id) as total_sales
                FROM cash_registers cr
                WHERE cr.id = ?
            `;
            
            db.get(getSql, [registerId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Turno de caja no encontrado'));
                } else {
                    const expectedAmount = parseFloat(row.opening_amount) + parseFloat(row.total_sales);
                    const difference = parseFloat(closingAmount) - expectedAmount;
                    
                    const updateSql = `
                        UPDATE cash_registers 
                        SET closing_time = datetime('now', 'localtime'),
                            closing_amount = ?,
                            expected_amount = ?,
                            difference = ?,
                            notes = ?,
                            status = 'cerrada'
                        WHERE id = ?
                    `;
                    
                    db.run(updateSql, [closingAmount, expectedAmount, difference, notes, registerId], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                id: registerId,
                                closingAmount,
                                expectedAmount,
                                difference,
                                totalSales: row.total_sales
                            });
                        }
                    });
                }
            });
        });
    }

    static getActive() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT cr.*, u.username 
                FROM cash_registers cr
                JOIN users u ON cr.user_id = u.id
                WHERE cr.status = 'abierta'
                ORDER BY cr.opening_time DESC
                LIMIT 1
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

    static getActiveByUser(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM cash_registers 
                WHERE user_id = ? AND status = 'abierta'
                ORDER BY opening_time DESC
                LIMIT 1
            `;
            
            db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT cr.*, u.username 
                FROM cash_registers cr
                JOIN users u ON cr.user_id = u.id
                WHERE cr.id = ?
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

    static getSales(registerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT s.*, u.username 
                FROM sales s
                JOIN users u ON s.user_id = u.id
                WHERE s.cash_register_id = ?
                ORDER BY s.created_at DESC
            `;
            
            db.all(sql, [registerId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getTotalSales(registerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT COALESCE(SUM(total), 0) as total
                FROM sales
                WHERE cash_register_id = ?
            `;
            
            db.get(sql, [registerId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.total : 0);
                }
            });
        });
    }

    static getAll(limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT cr.*, u.username 
                FROM cash_registers cr
                JOIN users u ON cr.user_id = u.id
                ORDER BY cr.opening_time DESC
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

    static checkIfUserHasOpenRegister(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM cash_registers 
                WHERE user_id = ? AND status = 'abierta'
            `;
            
            db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }
}

module.exports = CashRegister;