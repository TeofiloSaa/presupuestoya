export default function ClientSection({ client, onChange }) {
  const handle = (e) => onChange({ ...client, [e.target.name]: e.target.value });

  return (
    <section className="form-section">
      <h2>Datos del cliente</h2>
      <div className="field-grid">
        <div className="field">
          <label>Nombre / Empresa *</label>
          <input name="name" value={client.name} onChange={handle} placeholder="Ej: María García" />
        </div>
        <div className="field">
          <label>Dirección</label>
          <input name="address" value={client.address} onChange={handle} placeholder="Ej: Av. Corrientes 1234, CABA" />
        </div>
      </div>
    </section>
  );
}
