const db = require('../database/db');
const bcrypt = require('bcryptjs');

class User {
    static create(username, password, role = 'vendedor') {
        return new Promise((resolve, reject) => {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
            
            db.run(sql, [username, hashedPassword, role], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username, role });
                }
            });
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            
            db.get(sql, [username], (err, row) => {
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
            const sql = 'SELECT id, username, role, created_at FROM users WHERE id = ?';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC';
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static update(id, username, role) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET username = ?, role = ? WHERE id = ?';
            
            db.run(sql, [username, role, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, username, role });
                }
            });
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM users WHERE id = ?';
            
            db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deletedId: id });
                }
            });
        });
    }

    static updatePassword(id, newPassword) {
        return new Promise((resolve, reject) => {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            const sql = 'UPDATE users SET password = ? WHERE id = ?';
            
            db.run(sql, [hashedPassword, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id });
                }
            });
        });
    }

    static verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    }
}

module.exports = User;