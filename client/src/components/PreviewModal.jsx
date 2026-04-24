import { useEffect } from 'react';

export default function PreviewModal({ url, onDownload, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Vista previa del presupuesto</span>
          <button className="modal-close" onClick={onClose} title="Cerrar">✕</button>
        </div>
        <iframe className="modal-iframe" src={url} title="Presupuesto PDF" />
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn-generate" onClick={onDownload}>Descargar PDF</button>
        </div>
      </div>
    </div>
  );
}
