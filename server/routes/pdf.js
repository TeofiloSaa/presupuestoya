const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { generatePDF } = require('../services/pdfGenerator');
const { optionalAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.post('/generate-pdf', optionalAuth, async (req, res) => {
  try {
    const data = req.body;
    const pdfBuffer = await generatePDF(data);

    // Si el usuario está logueado, guardar en historial
    if (req.user) {
      await prisma.quote.create({
        data: {
          userId: req.user.id,
          clientName: data.client?.name || '',
          total: Number(data.total) || 0,
          quoteData: data,
        },
      }).catch((err) => console.error('Error guardando presupuesto:', err));
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=presupuesto.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generando el PDF' });
  }
});

module.exports = router;
