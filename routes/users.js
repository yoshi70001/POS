const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { requireAuth, requireAdmin } = require('./auth');

// Listar todos los usuarios (solo admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.getAll();
        res.render('users/index', { users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).render('error', { error: 'Error al cargar usuarios' });
    }
});

// Formulario para crear usuario
router.get('/new', requireAuth, requireAdmin, (req, res) => {
    res.render('users/create', { error: null, values: {} });
});

// Crear nuevo usuario
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        // Validaciones básicas
        if (!username || !password) {
            return res.render('users/create', {
                error: 'El nombre de usuario y contraseña son obligatorios',
                values: req.body
            });
        }

        if (password.length < 6) {
            return res.render('users/create', {
                error: 'La contraseña debe tener al menos 6 caracteres',
                values: req.body
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.render('users/create', {
                error: 'El nombre de usuario ya existe',
                values: req.body
            });
        }

        await User.create(username, password, role || 'vendedor');
        res.redirect('/users');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).render('users/create', { 
            error: 'Error al crear usuario',
            values: req.body 
        });
    }
});

// Ver detalles de usuario
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).render('error', { error: 'Usuario no encontrado' });
        }
        res.render('users/show', { user });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).render('error', { error: 'Error al cargar usuario' });
    }
});

// Formulario para editar usuario
router.get('/:id/edit', requireAuth, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).render('error', { error: 'Usuario no encontrado' });
        }
        res.render('users/edit', { user, error: null });
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        res.status(500).render('error', { error: 'Error al cargar usuario' });
    }
});

// Actualizar usuario
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    const { username, role } = req.body;
    
    try {
        if (!username) {
            const user = await User.findById(req.params.id);
            return res.render('users/edit', {
                user,
                error: 'El nombre de usuario es obligatorio'
            });
        }

        await User.update(req.params.id, username, role || 'vendedor');
        res.redirect(`/users/${req.params.id}`);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        const user = await User.findById(req.params.id);
        res.status(500).render('users/edit', { 
            user,
            error: 'Error al actualizar usuario'
        });
    }
});

// Formulario para cambiar contraseña
router.get('/:id/change-password', requireAuth, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).render('error', { error: 'Usuario no encontrado' });
        }
        res.render('users/change-password', { user, error: null });
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        res.status(500).render('error', { error: 'Error al cargar usuario' });
    }
});

// Cambiar contraseña
router.post('/:id/change-password', requireAuth, requireAdmin, async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    
    try {
        if (!newPassword || !confirmPassword) {
            const user = await User.findById(req.params.id);
            return res.render('users/change-password', {
                user,
                error: 'Todos los campos son obligatorios'
            });
        }

        if (newPassword.length < 6) {
            const user = await User.findById(req.params.id);
            return res.render('users/change-password', {
                user,
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        if (newPassword !== confirmPassword) {
            const user = await User.findById(req.params.id);
            return res.render('users/change-password', {
                user,
                error: 'Las contraseñas no coinciden'
            });
        }

        await User.updatePassword(req.params.id, newPassword);
        res.redirect(`/users/${req.params.id}`);
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        const user = await User.findById(req.params.id);
        res.status(500).render('users/change-password', {
            user,
            error: 'Error al cambiar contraseña'
        });
    }
});

// Eliminar usuario
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Prevenir eliminar el propio usuario
        if (parseInt(req.params.id) === req.session.userId) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        await User.delete(req.params.id);
        res.redirect('/users');
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;