const express = require("express");
const router = express.Router();
const Sale = require("../models/sale");
const Product = require("../models/product");
const CashRegister = require("../models/cashRegister");
const { requireAuth } = require("./auth");

// Página principal del POS
router.get("/", requireAuth, async (req, res) => {
  try {
    // Verificar si hay una caja abierta
    const activeRegister = await CashRegister.getActiveByUser(
      req.session.userId,
    );

    if (!activeRegister) {
      return res.redirect("/cash-register/open");
    }

    const products = await Product.getAll();
    res.render("sales/index", {
      products,
      cashRegister: activeRegister,
    });
  } catch (error) {
    console.error("Error al cargar POS:", error);
    res.status(500).render("error", { error: "Error al cargar el POS" });
  }
});

// Procesar venta
router.post("/process", requireAuth, async (req, res) => {
  const { items, paymentMethod, receivedAmount } = req.body;

  try {
    // Verificar caja abierta
    const activeRegister = await CashRegister.getActiveByUser(
      req.session.userId,
    );

    if (!activeRegister) {
      return res.status(400).json({ error: "No hay caja abierta" });
    }

    // Procesar items
    const saleItems = items.map((item) => ({
      productId: item.productId,
      price: item.price,
      quantity: parseInt(item.quantity),
    }));

    const result = await Sale.create(
      activeRegister.id,
      req.session.userId,
      saleItems,
      paymentMethod || "efectivo",
      receivedAmount || 0,
    );

    res.json({
      success: true,
      saleId: result.id,
      total: result.total,
      change: result.changeAmount,
    });
  } catch (error) {
    console.error("Error al procesar venta:", error);
    res.status(500).json({ error: "Error al procesar la venta" });
  }
});

// Historial de ventas
router.get("/history", requireAuth, async (req, res) => {
  try {
    const sales = await Sale.getAll(50);
    res.render("sales/history", { sales });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).render("error", { error: "Error al cargar ventas" });
  }
});

// Detalles de venta
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    const items = await Sale.getItems(req.params.id);
    res.render("sales/show", { sale, items });
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).render("error", { error: "Error al cargar venta" });
  }
});

// API: Obtener producto por ID
router.get("/api/product/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al cargar producto" });
  }
});

module.exports = router;
