const ACCEPTED = ['image/jpeg', 'image/png'];
const MAX_SIZE_MB = 2;

export default function WorkerSection({ worker, onChange }) {
  const handle = (e) => onChange({ ...worker, [e.target.name]: e.target.value });

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      alert('Solo se aceptan imágenes JPG o PNG.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`La imagen no puede superar ${MAX_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange({ ...worker, logo: reader.result });
    reader.readAsDataURL(file);
  };

  const removeLogo = () => onChange({ ...worker, logo: null });

  return (
    <section className="form-section">
      <h2><span className="section-icon">👤</span>Tus datos</h2>
      <div className="field-grid">
        <div className="field">
          <label>Nombre completo *</label>
          <input name="name" value={worker.name} onChange={handle} placeholder="Ej: Juan Pérez" />
        </div>
        <div className="field">
          <label>Oficio / Rubro *</label>
          <input name="trade" value={worker.trade} onChange={handle} placeholder="Ej: Electricista" />
        </div>
        <div className="field">
          <label>Teléfono *</label>
          <input name="phone" value={worker.phone} onChange={handle} placeholder="Ej: 11 1234-5678" />
        </div>
        <div className="field">
          <label>Logo <span className="optional">(JPG o PNG, máx. 2 MB)</span></label>
          {worker.logo ? (
            <div className="logo-preview">
              <img src={worker.logo} alt="Logo" />
              <button type="button" className="btn-remove-logo" onClick={removeLogo}>
                Quitar logo
              </button>
            </div>
          ) : (
            <input type="file" accept="image/jpeg,image/png" onChange={handleLogo} />
          )}
        </div>
      </div>
    </section>
  );
}
