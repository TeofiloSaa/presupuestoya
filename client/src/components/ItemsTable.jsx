import { formatARS } from '../utils';

const emptyItem = () => ({ id: crypto.randomUUID(), description: '', qty: 1, unitPrice: '' });

export default function ItemsTable({ items, onChange }) {
  const updateItem = (id, field, value) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => onChange([...items, emptyItem()]);

  const removeItem = (id) => {
    if (items.length === 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <section className="form-section">
      <h2><span className="section-icon">📋</span>Ítems del trabajo</h2>
      <div className="items-table">
        <div className="items-header">
          <span>Descripción *</span>
          <span>Cant.</span>
          <span>Precio unit.</span>
          <span>Subtotal</span>
          <span></span>
        </div>

        {items.map((item) => {
          const subtotal = Number(item.qty) * Number(item.unitPrice) || 0;
          return (
            <div className="item-row" key={item.id}>
              <input
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Ej: Instalación eléctrica"
              />
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
              />
              <input
                type="number"
                min="0"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                placeholder="0"
              />
              <span className="subtotal">{formatARS(subtotal)}</span>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                title="Eliminar ítem"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn-add-item" onClick={addItem}>
        + Agregar ítem
      </button>
    </section>
  );
}
