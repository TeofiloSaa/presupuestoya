const PDFDocument = require('pdfkit');

const COLORS = {
  dark: '#1a1a2e',
  accent: '#6366f1',
  light: '#f8fafc',
  border: '#e2e8f0',
  muted: '#64748b',
  white: '#ffffff',
};

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

const quoteNumber = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatDate = () =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const { worker, client, items, notes, total } = data;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100;

    // ── Header ──────────────────────────────────────────────
    doc.rect(50, 50, W, 70).fill(COLORS.dark);

    // Logo (si existe) — esquina derecha del header
    if (worker.logo) {
      try {
        const base64Data = worker.logo.replace(/^data:image\/\w+;base64,/, '');
        const logoBuffer = Buffer.from(base64Data, 'base64');
        doc.image(logoBuffer, 50 + W - 66, 55, { width: 56, height: 56, fit: [56, 56] });
      } catch {
        // imagen inválida: se ignora silenciosamente
      }
    }

    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('PRESUPUESTO', 68, 65);

    doc
      .fillColor('#a5b4fc')
      .font('Helvetica')
      .fontSize(9)
      .text(`N° ${quoteNumber()}`, 68, 93)
      .text(`Fecha: ${formatDate()}`, 68, 106);

    // ── Info Trabajador / Cliente ───────────────────────────
    const infoTop = 140;
    const colW = W / 2 - 10;

    // Bloque trabajador
    doc.rect(50, infoTop, colW, 90).fill(COLORS.light);
    doc
      .fillColor(COLORS.accent)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('ELABORADO POR', 62, infoTop + 12);

    doc
      .fillColor(COLORS.dark)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(worker.name, 62, infoTop + 26);

    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(10)
      .text(worker.trade, 62, infoTop + 42)
      .text(`Tel: ${worker.phone}`, 62, infoTop + 57);

    // Bloque cliente
    const col2X = 50 + colW + 20;
    doc.rect(col2X, infoTop, colW, 90).fill(COLORS.light);
    doc
      .fillColor(COLORS.accent)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('PRESUPUESTO PARA', col2X + 12, infoTop + 12);

    doc
      .fillColor(COLORS.dark)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(client.name, col2X + 12, infoTop + 26);

    if (client.address) {
      doc
        .fillColor(COLORS.muted)
        .font('Helvetica')
        .fontSize(10)
        .text(client.address, col2X + 12, infoTop + 42, { width: colW - 24 });
    }

    // ── Tabla de ítems ──────────────────────────────────────
    const tableTop = infoTop + 110;

    // Anchos de columna como % de W (el último absorbe el resto para no desbordarse)
    const descW     = Math.floor(W * 0.45);
    const qtyW      = Math.floor(W * 0.10);
    const unitW     = Math.floor(W * 0.20);
    const subtotalW = W - descW - qtyW - unitW;

    const colX = {
      desc:     50,
      qty:      50 + descW,
      unit:     50 + descW + qtyW,
      subtotal: 50 + descW + qtyW + unitW,
    };

    // Cabecera de tabla
    doc.rect(50, tableTop, W, 24).fill(COLORS.dark);
    doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(9);
    doc.text('DESCRIPCIÓN', colX.desc + 10,    tableTop + 8, { width: descW - 10 });
    doc.text('CANT.',        colX.qty,          tableTop + 8, { width: qtyW,      align: 'right' });
    doc.text('P. UNIT.',     colX.unit,         tableTop + 8, { width: unitW,     align: 'right' });
    doc.text('SUBTOTAL',     colX.subtotal,     tableTop + 8, { width: subtotalW, align: 'right' });

    // Filas
    let rowY = tableTop + 24;
    items.forEach((item, i) => {
      const subtotal = Number(item.qty) * Number(item.unitPrice || 0);
      const rowH = 26;

      if (i % 2 === 0) doc.rect(50, rowY, W, rowH).fill('#f8fafc');

      doc.fillColor(COLORS.dark).font('Helvetica').fontSize(10);
      doc.text(item.description || '', colX.desc + 10, rowY + 8, { width: descW - 10, ellipsis: true });

      doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10);
      doc.text(String(item.qty),                       colX.qty,      rowY + 8, { width: qtyW,      align: 'right' });
      doc.text(formatARS(Number(item.unitPrice || 0)), colX.unit,     rowY + 8, { width: unitW,     align: 'right' });

      doc.fillColor(COLORS.dark).font('Helvetica').fontSize(10);
      doc.text(formatARS(subtotal),                    colX.subtotal, rowY + 8, { width: subtotalW, align: 'right' });

      // Línea separadora
      doc.moveTo(50, rowY + rowH).lineTo(50 + W, rowY + rowH).strokeColor(COLORS.border).lineWidth(0.5).stroke();

      rowY += rowH;
    });

    // ── Total ───────────────────────────────────────────────
    rowY += 8;
    doc.rect(50 + W - 200, rowY, 200, 36).fill(COLORS.accent);
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('TOTAL', 50 + W - 195, rowY + 12);
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(formatARS(total), 50 + W - 195, rowY + 12, { width: 185, align: 'right' });

    // ── Notas ───────────────────────────────────────────────
    if (notes && notes.trim()) {
      rowY += 60;
      doc.rect(50, rowY, W, 1).fill(COLORS.border);
      doc
        .fillColor(COLORS.accent)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('NOTAS', 50, rowY + 10);
      doc
        .fillColor(COLORS.muted)
        .font('Helvetica')
        .fontSize(10)
        .text(notes.trim(), 50, rowY + 24, { width: W });
    }

    // ── Footer ──────────────────────────────────────────────
    const pageH = doc.page.height;
    doc
      .fillColor(COLORS.border)
      .rect(50, pageH - 50, W, 0.5)
      .fill();
    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(8)
      .text('Generado con PresupuestoYa', 50, pageH - 38, { width: W, align: 'center' });

    doc.end();
  });
}

module.exports = { generatePDF };
