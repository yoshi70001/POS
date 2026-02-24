const express = require('express');
const session = require('express-session');
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
    secret: 'pos-secreto-cambiar-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware para hacer disponible la información del usuario en todas las vistas
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId ? {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
    } : null;
    res.locals.moment = moment;
    next();
});

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const cashRegisterRoutes = require('./routes/cashRegister');
const reportRoutes = require('./routes/reports');

// Usar rutas
app.use('/auth', authRoutes.router);
// app.use('/logout', authRoutes.router);
app.use('/products', productRoutes);
app.use('/sales', saleRoutes);
app.use('/cash-register', cashRegisterRoutes);
app.use('/reports', reportRoutes);

// Ruta principal
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/sales');
    } else {
        res.redirect('/auth/login');
    }
});

// Página 404
app.use((req, res) => {
    res.status(404).render('error', { error: 'Página no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Error del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║   Sistema POS - Ventas de Dulces    ║`);
    console.log(`╚══════════════════════════════════════╝`);
    console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`✓ Usuario admin: admin / admin123`);
    console.log(`\nPresione Ctrl+C para detener el servidor\n`);
});

module.exports = app;