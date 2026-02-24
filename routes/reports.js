const express = require('express');
const router = express.Router();
const Sale = require('../models/sale');
const Inventory = require('../models/inventory');
const CashRegister = require('../models/cashRegister');
const { requireAuth, requireAdmin } = require('./auth');

// Dashboard principal
router.get('/', requireAuth, async (req, res) => {
    try {
        // Ventas de hoy
        const todaySales = await Sale.getTodaySales();
        
        // Productos más vendidos hoy
        const topProducts = await Sale.getTopProducts(5);
        
        // Resumen de inventario
        const inventorySummary = await Inventory.getSummary();
        
        // Productos con stock bajo
        const lowStockProducts = await Inventory.getLowStockProducts();
        
        // Caja activa
        const activeRegister = await CashRegister.getActive();

        res.render('reports/index', {
            todaySales,
            topProducts,
            inventorySummary,
            lowStockProducts,
            activeRegister
        });
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        res.status(500).render('error', { error: 'Error al cargar reportes' });
    }
});

// Reportes de ventas por fecha
router.get('/sales', requireAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let salesByDate = [];
        if (startDate && endDate) {
            salesByDate = await Sale.getSalesByDateRange(startDate, endDate);
        }

        res.render('reports/sales', { salesByDate, startDate, endDate });
    } catch (error) {
        console.error('Error al cargar reporte de ventas:', error);
        res.status(500).render('error', { error: 'Error al cargar reporte de ventas' });
    }
});

// Reportes de inventario
router.get('/inventory', requireAuth, async (req, res) => {
    try {
        const movements = await Inventory.getMovements(null, 100);
        const lowStockProducts = await Inventory.getLowStockProducts();
        const summary = await Inventory.getSummary();

        res.render('reports/inventory', { movements, lowStockProducts, summary });
    } catch (error) {
        console.error('Error al cargar reporte de inventario:', error);
        res.status(500).render('error', { error: 'Error al cargar reporte de inventario' });
    }
});

// Reportes de cajas
router.get('/cash-registers', requireAuth, requireAdmin, async (req, res) => {
    try {
        const registers = await CashRegister.getAll(50);
        res.render('reports/cash-registers', { registers });
    } catch (error) {
        console.error('Error al cargar reporte de cajas:', error);
        res.status(500).render('error', { error: 'Error al cargar reporte de cajas' });
    }
});

module.exports = router;