const express = require("express");
const router = express.Router();
const CashRegister = require("../models/cashRegister");
const Sale = require("../models/sale");
const { requireAuth } = require("./auth");

// Formulario para abrir caja
router.get("/open", requireAuth, (req, res) => {
  res.render("cash-register/open", { error: null, values: {} });
});

// Abrir caja
router.post("/open", requireAuth, async (req, res) => {
  const { openingAmount } = req.body;

  try {
    // Verificar si ya tiene una caja abierta
    const hasOpen = await CashRegister.checkIfUserHasOpenRegister(
      req.session.userId,
    );

    if (hasOpen) {
      return res.render("cash-register/open", {
        error: "Ya tienes una caja abierta",
      });
    }

    const result = await CashRegister.open(
      req.session.userId,
      parseFloat(openingAmount) || 0,
    );

    res.redirect("/");
  } catch (error) {
    console.error("Error al abrir caja:", error);
    res.render("cash-register/open", {
      error: "Error al abrir caja",
      values: req.body,
    });
  }
});

// Formulario para cerrar caja
router.get("/close", requireAuth, async (req, res) => {
  try {
    const activeRegister = await CashRegister.getActiveByUser(
      req.session.userId,
    );

    if (!activeRegister) {
      return res.redirect("/cash-register/open");
    }

    const totalSales = await CashRegister.getTotalSales(activeRegister.id);
    const expectedAmount =
      parseFloat(activeRegister.opening_amount) + parseFloat(totalSales);

    res.render("cash-register/close", {
      cashRegister: activeRegister,
      totalSales,
      expectedAmount,
    });
  } catch (error) {
    console.error("Error al cargar cierre de caja:", error);
    res
      .status(500)
      .render("error", { error: "Error al cargar cierre de caja" });
  }
});

// Procesar cierre de caja
router.post("/close/:id", requireAuth, async (req, res) => {
  const { closingAmount, notes } = req.body;

  try {
    const result = await CashRegister.close(
      req.params.id,
      parseFloat(closingAmount),
      notes,
    );

    res.render("cash-register/close-summary", {
      result,
      cashRegisterId: req.params.id,
    });
  } catch (error) {
    console.error("Error al cerrar caja:", error);
    res.status(500).render("error", { error: "Error al cerrar caja" });
  }
});

// Ver detalles de un turno de caja
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const cashRegister = await CashRegister.findById(req.params.id);
    const sales = await CashRegister.getSales(req.params.id);

    if (!cashRegister) {
      return res.status(404).render("error", { error: "Turno no encontrado" });
    }

    res.render("cash-register/show", { cashRegister, sales });
  } catch (error) {
    console.error("Error al obtener turno:", error);
    res.status(500).render("error", { error: "Error al cargar turno" });
  }
});

// Historial de turnos de caja
router.get("/history/all", requireAuth, async (req, res) => {
  try {
    const registers = await CashRegister.getAll(50);
    res.render("cash-register/history", { registers });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).render("error", { error: "Error al cargar historial" });
  }
});

module.exports = router;
