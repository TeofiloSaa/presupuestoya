export default function NotesSection({ notes, onChange }) {
  return (
    <section className="form-section">
      <h2><span className="section-icon">📝</span>Notas adicionales <span className="optional">(opcional)</span></h2>
      <div className="field">
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Validez del presupuesto: 15 días. Incluye materiales."
          rows={3}
        />
      </div>
    </section>
  );
}
