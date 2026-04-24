import { useMemo, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import WorkerSection from './components/WorkerSection';
import ClientSection from './components/ClientSection';
import ItemsTable from './components/ItemsTable';
import NotesSection from './components/NotesSection';
import PreviewModal from './components/PreviewModal';
import { fetchPDFUrl, downloadFromUrl } from './api';
import { formatARS } from './utils';
import './App.css';

const initialWorker = { name: '', trade: '', phone: '' };
const initialClient = { name: '', address: '' };
const initialItems = [{ id: crypto.randomUUID(), description: '', qty: 1, unitPrice: '' }];

export default function App() {
  // Persiste solo name/trade/phone — el logo (base64) se excluye para no saturar localStorage
  const [savedWorker, setSavedWorker] = useLocalStorage('presupuestoya_worker', initialWorker);
  const [worker, setWorker] = useState({ ...savedWorker, logo: null });

  const handleWorkerChange = (updated) => {
    setWorker(updated);
    const { logo: _, ...toSave } = updated;
    setSavedWorker(toSave);
  };
  const [client, setClient] = useState(initialClient);
  const [items, setItems] = useState(initialItems);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.qty) * Number(item.unitPrice || 0), 0),
    [items]
  );

  const validate = () => {
    const errs = [];
    if (!worker.name.trim()) errs.push('Nombre del trabajador');
    if (!worker.trade.trim()) errs.push('Oficio / Rubro');
    if (!worker.phone.trim()) errs.push('Teléfono');
    if (!client.name.trim()) errs.push('Nombre del cliente');
    if (items.every((i) => !i.description.trim())) errs.push('Al menos un ítem con descripción');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setLoading(true);
    try {
      const url = await fetchPDFUrl({ worker, client, items, notes, total });
      setPreviewUrl(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    downloadFromUrl(previewUrl);
  };

  const handleCloseModal = () => {
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PresupuestoYa</h1>
        <p>Generá tu presupuesto profesional en segundos</p>
      </header>

      <form className="form-container" onSubmit={handleSubmit} noValidate>
        <WorkerSection worker={worker} onChange={handleWorkerChange} />
        <ClientSection client={client} onChange={setClient} />
        <ItemsTable items={items} onChange={setItems} />
        <NotesSection notes={notes} onChange={setNotes} />

        <div className="total-bar">
          <span>Total</span>
          <span className="total-amount">{formatARS(total)}</span>
        </div>

        {errors.length > 0 && (
          <div className="error-box">
            <strong>Completá los campos obligatorios:</strong>
            <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}

        <button type="submit" className="btn-generate" disabled={loading}>
          {loading ? 'Generando PDF...' : 'Ver vista previa'}
        </button>
      </form>

      {previewUrl && (
        <PreviewModal
          url={previewUrl}
          onDownload={handleDownload}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
