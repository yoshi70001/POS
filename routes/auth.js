const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware para verificar si el usuario está autenticado
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Middleware para verificar si es admin
const requireAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado' });
    }
};

// Mostrar formulario de login
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

// Procesar login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findByUsername(username);
        
        if (!user) {
            return res.render('auth/login', { error: 'Usuario o contraseña incorrectos' });
        }
        
        const isValid = User.verifyPassword(password, user.password);
        
        if (!isValid) {
            return res.render('auth/login', { error: 'Usuario o contraseña incorrectos' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        
        res.redirect('/');
    } catch (error) {
        console.error('Error en login:', error);
        res.render('auth/login', { error: 'Error al iniciar sesión' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = { router, requireAuth, requireAdmin };