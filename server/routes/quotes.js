const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { generatePDF } = require('../services/pdfGenerator');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ── GET /api/quotes ───────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientName: true,
        total: true,
        createdAt: true,
      },
    });
    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

// ── GET /api/quotes/:id/pdf ───────────────────────────────────
router.get('/:id/pdf', verifyToken, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
    });

    if (!quote || quote.userId !== req.user.id) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    const pdfBuffer = await generatePDF(quote.quoteData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${quote.id.slice(0, 8)}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al regenerar el PDF' });
  }
});

// ── DELETE /api/quotes/:id ────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
    });

    if (!quote || quote.userId !== req.user.id) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    await prisma.quote.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el presupuesto' });
  }
});

module.exports = router;
