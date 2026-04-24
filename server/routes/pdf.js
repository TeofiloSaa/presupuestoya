const express = require('express');
const router = express.Router();
const { generatePDF } = require('../services/pdfGenerator');

router.post('/generate-pdf', async (req, res) => {
  try {
    const data = req.body;
    const pdfBuffer = await generatePDF(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=presupuesto.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generando el PDF' });
  }
});

module.exports = router;
