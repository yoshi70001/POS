const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { requireAuth, requireAdmin } = require('./auth');

// Lista de productos
router.get('/', requireAuth, async (req, res) => {
    try {
        const products = await Product.getAll();
        const lowStock = await Product.getLowStock();
        res.render('products/index', { products, lowStock });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', { error: 'Error al cargar productos' });
    }
});

// Buscar productos (API)
router.get('/search', requireAuth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }
        const products = await Product.search(q);
        res.json(products);
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({ error: 'Error al buscar productos' });
    }
});

// Formulario crear producto
router.get('/create', requireAuth, requireAdmin, (req, res) => {
    res.render('products/create');
});

// Crear producto
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    const { name, description, price, stock, minStock } = req.body;
    
    try {
        await Product.create(name, description, price, stock, minStock || 5);
        res.redirect('/products');
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).render('products/create', { 
            error: 'Error al crear producto',
            values: req.body 
        });
    }
});

// Ver producto
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { error: 'Producto no encontrado' });
        }
        res.render('products/show', { product });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).render('error', { error: 'Error al cargar producto' });
    }
});

// Formulario editar producto
router.get('/:id/edit', requireAuth, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { error: 'Producto no encontrado' });
        }
        res.render('products/edit', { product });
    } catch (error) {
        console.error('Error al cargar producto:', error);
        res.status(500).render('error', { error: 'Error al cargar producto' });
    }
});

// Actualizar producto
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    const { name, description, price, stock, minStock } = req.body;
    
    try {
        await Product.update(req.params.id, name, description, price, stock, minStock);
        res.redirect(`/products/${req.params.id}`);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).render('products/edit', { 
            error: 'Error al actualizar producto',
            product: { ...req.body, id: req.params.id }
        });
    }
});

// Eliminar producto
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await Product.delete(req.params.id);
        res.redirect('/products');
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;