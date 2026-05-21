import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatARS } from '../utils';
import './HistoryPage.css';

function formatDate(iso) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/quotes', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setQuotes(data))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id, clientName) => {
    const res = await fetch(`/api/quotes/${id}/pdf`, { credentials: 'include' });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuesto-${clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este presupuesto del historial?')) return;
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>Historial de presupuestos</h1>
          <p>{user?.name || user?.email}</p>
        </div>
        <Link to="/" className="btn-new">+ Nuevo presupuesto</Link>
      </div>

      {loading && <p className="history-status">Cargando...</p>}
      {error && <p className="history-status history-error">{error}</p>}

      {!loading && !error && quotes.length === 0 && (
        <div className="history-empty">
          <p>Todavía no generaste ningún presupuesto.</p>
          <Link to="/" className="btn-new">Crear el primero</Link>
        </div>
      )}

      {!loading && quotes.length > 0 && (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="col-total">Total</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td className="col-date">{formatDate(q.createdAt)}</td>
                  <td>{q.clientName}</td>
                  <td className="col-total">{formatARS(q.total)}</td>
                  <td className="col-actions">
                    <button
                      className="btn-action btn-download"
                      onClick={() => handleDownload(q.id, q.clientName)}
                      title="Descargar PDF"
                    >
                      ⬇ Descargar
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(q.id)}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
