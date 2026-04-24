export async function fetchPDFUrl(formData) {
  const res = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error('Error al generar el PDF');

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function downloadFromUrl(url, filename = 'presupuesto.pdf') {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
