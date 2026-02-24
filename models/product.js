const db = require('../database/db');

class Product {
    static create(name, description, price, stock, minStock = 5) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO products (name, description, price, stock, min_stock) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [name, description, price, stock, minStock], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, name, description, price, stock, minStock });
                }
            });
        });
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM products ORDER BY name ASC';
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getLowStock() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM products WHERE stock <= min_stock ORDER BY name ASC';
            
            db.all(sql, [], (err, rows) => {
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
            const sql = 'SELECT * FROM products WHERE id = ?';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static search(keyword) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC';
            const searchTerm = `%${keyword}%`;
            
            db.all(sql, [searchTerm], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static update(id, name, description, price, stock, minStock) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE products 
                SET name = ?, description = ?, price = ?, stock = ?, min_stock = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(sql, [name, description, price, stock, minStock, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, name, description, price, stock, minStock });
                }
            });
        });
    }

    static updateStock(id, newStock) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            
            db.run(sql, [newStock, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, stock: newStock });
                }
            });
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM products WHERE id = ?';
            
            db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deletedId: id });
                }
            });
        });
    }
}

module.exports = Product;