import { useState, useEffect } from 'react';

const API_AUTH = 'https://lsplay-backend-production.up.railway.app';

function getAuth() {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('usuario');
  return { token, usuario: raw ? JSON.parse(raw) : null };
}

// Abecedario dactilológico completo de LSE: 30 elementos (26 letras + CH, LL, RR, Ñ)
const ALPHABET: { id: string; label: string }[] = [
  { id: 'a',    label: 'A' },
  { id: 'b',    label: 'B' },
  { id: 'c',    label: 'C' },
  { id: 'ch',   label: 'CH' },
  { id: 'd',    label: 'D' },
  { id: 'e',    label: 'E' },
  { id: 'f',    label: 'F' },
  { id: 'g',    label: 'G' },
  { id: 'h',    label: 'H' },
  { id: 'i',    label: 'I' },
  { id: 'j',    label: 'J' },
  { id: 'k',    label: 'K' },
  { id: 'l',    label: 'L' },
  { id: 'll',   label: 'LL' },
  { id: 'm',    label: 'M' },
  { id: 'n',    label: 'N' },
  { id: 'enye', label: 'Ñ' },
  { id: 'o',    label: 'O' },
  { id: 'p',    label: 'P' },
  { id: 'q',    label: 'Q' },
  { id: 'r',    label: 'R' },
  { id: 'rr',   label: 'RR' },
  { id: 's',    label: 'S' },
  { id: 't',    label: 'T' },
  { id: 'u',    label: 'U' },
  { id: 'v',    label: 'V' },
  { id: 'w',    label: 'W' },
  { id: 'x',    label: 'X' },
  { id: 'y',    label: 'Y' },
  { id: 'z',    label: 'Z' },
];

const signDescriptions: Record<string, string> = {
  a:'Cierra el puño con el pulgar al lado.',
  b:'Dedos juntos y extendidos hacia arriba, pulgar doblado.',
  c:'Curva los dedos formando una C.',
  ch:'Como la C, con un pequeño movimiento repetido.',
  d:'Dedo índice arriba, los demás forman un círculo con el pulgar.',
  e:'Dobla los dedos hacia abajo sobre el pulgar.',
  f:'Une el pulgar con el índice, los demás extendidos.',
  g:'Índice y pulgar apuntan hacia el lado.',
  h:'Índice y medio extendidos juntos hacia el lado.',
  i:'Solo el meñique extendido hacia arriba.',
  j:'Meñique extendido y traza una J en el aire.',
  k:'Índice arriba, medio diagonal, pulgar entre ellos.',
  l:'Índice arriba y pulgar hacia el lado (forma L).',
  ll:'Como la L, con un pequeño movimiento hacia el lado.',
  m:'Tres dedos doblados sobre el pulgar.',
  n:'Dos dedos doblados sobre el pulgar.',
  enye:'Como la N, con un pequeño movimiento ondulado (representa la virgulilla).',
  o:'Todos los dedos forman un círculo (forma O).',
  p:'Como la K pero apuntando hacia abajo.',
  q:'Como la G pero apuntando hacia abajo.',
  r:'Índice y medio cruzados, extendidos.',
  rr:'Como la R, con un pequeño movimiento repetido.',
  s:'Puño cerrado con el pulgar sobre los dedos.',
  t:'Pulgar entre índice y medio.',
  u:'Índice y medio extendidos y juntos hacia arriba.',
  v:'Índice y medio extendidos en forma de V.',
  w:'Índice, medio y anular extendidos.',
  x:'Índice doblado en gancho.',
  y:'Pulgar y meñique extendidos (los demás cerrados).',
  z:'Traza una Z en el aire con el índice.',
};

export default function Aprender() {
  const [selected, setSelected] = useState<string | null>(null);
  const [learned, setLearned]   = useState<Set<string>>(new Set());
  const [filter, setFilter]     = useState('Todas');

  useEffect(() => {
    async function cargar() {
      const { token, usuario } = getAuth();
      if (!token || !usuario) return;
      try {
        const res = await fetch(`${API_AUTH}/api/letter-progress/${usuario.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLearned(new Set(data.letras || []));
      } catch {
        // si falla, simplemente arranca sin nada marcado
      }
    }
    cargar();
  }, []);

  const groups: Record<string, typeof ALPHABET> = {
    'Todas':  ALPHABET,
    'A – E':  ALPHABET.slice(0, 6),
    'F – L':  ALPHABET.slice(6, 13),
    'LL – Q': ALPHABET.slice(13, 19),
    'R – Z':  ALPHABET.slice(19),
  };
  const visible = groups[filter];
  const selectedItem = ALPHABET.find(l => l.id === selected);

  function markLearned(id: string) {
    if (learned.has(id)) return; // ya estaba aprendida, no volver a sumar XP
    setLearned(prev => new Set([...prev, id]));

    const { token, usuario } = getAuth();
    if (!token || !usuario) return;

    fetch(`${API_AUTH}/api/letter-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ usuario_id: usuario.id, letter_id: id }),
    }).catch(() => {});

    fetch(`${API_AUTH}/api/usuarios/${usuario.id}/sumar-xp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ xp: 30 }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.usuario) localStorage.setItem('usuario', JSON.stringify(data.usuario));
      })
      .catch(() => {});
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7ff', padding: '40px 32px' }}>
      <h1 style={s.title}>📖 Módulos de Aprendizaje</h1>
      <p style={s.sub}>Aprende cada seña del abecedario — haz clic en una letra para verla</p>

      {/* Filtros */}
      <div style={s.filters}>
        {Object.keys(groups).map(g => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ ...s.filterBtn, ...(filter === g ? s.filterActive : {}) }}>
            {g}
          </button>
        ))}
      </div>

      {/* Barra de progreso */}
      <div style={s.progWrap}>
        <span style={s.progLabel}>{learned.size} / {ALPHABET.length} señas aprendidas</span>
        <div className="prog-bar-outer" style={{ flex: 1, maxWidth: 400 }}>
          <div className="prog-bar-inner"
            style={{ width: `${(learned.size / ALPHABET.length) * 100}%` }} />
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div style={s.grid}>
        {visible.map(letter => {
          const isLearned = learned.has(letter.id);
          return (
            <div key={letter.id} onClick={() => setSelected(letter.id)}
              style={{
                ...s.signBox,
                ...(isLearned ? s.signBoxLearned : {}),
                ...(selected === letter.id ? s.signBoxSelected : {}),
              }}>

              <img
                src={`/hands/${letter.id}.png`}
                alt={`Seña ${letter.label}`}
                style={s.signImg}
              />

              <span style={{
                fontFamily: "'Fredoka One',cursive",
                fontSize: letter.label.length > 1 ? 20 : 28,
                color: isLearned ? '#267a50' : '#7c3aed',
                marginTop: 6,
                display: 'block',
              }}>
                {letter.label}
              </span>

              <span style={isLearned ? s.checkBadge : s.viewBadge}>
                {isLearned ? '✓ Aprendida' : 'Ver seña'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>

            <img
              src={`/hands/${selectedItem.id}.png`}
              alt={`Seña ${selectedItem.label}`}
              style={s.modalImg}
            />

            <h2 style={s.modalLetter}>{selectedItem.label}</h2>
            <p style={s.modalDesc}>{signDescriptions[selectedItem.id]}</p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={s.btnLearn}
                onClick={() => { markLearned(selectedItem.id); setSelected(null); }}>
                ✅ ¡Ya la aprendí! +30 XP
              </button>
              <button style={s.btnClose} onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title:    { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(28px,4vw,42px)', color: '#3d2c6e', textAlign: 'center', marginBottom: 8 },
  sub:      { fontSize: 16, fontWeight: 600, color: '#9e8ec0', textAlign: 'center', marginBottom: 28 },
  filters:  { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 },
  filterBtn:    { fontFamily: "'Fredoka One',cursive", fontSize: 15, padding: '7px 18px', borderRadius: 20, border: '2px solid #c4b5fd', background: '#fff', color: '#7c3aed', cursor: 'pointer', transition: 'all 0.15s' },
  filterActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  progWrap: { display: 'flex', alignItems: 'center', gap: 16, maxWidth: 700, margin: '0 auto 32px', flexWrap: 'wrap' },
  progLabel:{ fontSize: 14, fontWeight: 700, color: '#7c3aed', whiteSpace: 'nowrap' },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 14, maxWidth: 960, margin: '0 auto' },
  signBox:  { background: '#fff', borderRadius: 16, border: '2px solid #e8e0f5', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 3px 0 rgba(139,92,246,0.08)' },
  signBoxLearned:  { background: '#f0fdf4', borderColor: '#86efac' },
  signBoxSelected: { borderColor: '#7c3aed', transform: 'scale(1.05)', boxShadow: '0 6px 0 rgba(124,58,237,0.2)' },
  signImg:  { width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto' },
  checkBadge: { display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12, background: '#dcfce7', color: '#14532d' },
  viewBadge:  { display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12, background: '#ede9fb', color: '#5b21b6' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  modal:    { background: '#fff', borderRadius: 24, padding: '40px 36px', maxWidth: 380, width: '100%', position: 'relative', border: '3px solid #c4b5fd', boxShadow: '0 20px 40px rgba(124,58,237,0.2)', textAlign: 'center' },
  closeBtn: { position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9e8ec0' },
  modalImg: { width: 150, height: 150, objectFit: 'contain', margin: '0 auto 12px', display: 'block' },
  modalLetter: { fontFamily: "'Fredoka One',cursive", fontSize: 52, color: '#7c3aed', marginBottom: 8 },
  modalDesc:   { fontSize: 15, fontWeight: 600, color: '#6b5a9e', lineHeight: 1.6, marginBottom: 24 },
  btnLearn: { fontFamily: "'Fredoka One',cursive", fontSize: 17, background: '#86efac', color: '#14532d', border: 'none', borderRadius: 50, padding: '12px 22px', cursor: 'pointer', boxShadow: '0 4px 0 #16a34a' },
  btnClose: { fontFamily: "'Fredoka One',cursive", fontSize: 17, background: '#ede9fb', color: '#5b21b6', border: 'none', borderRadius: 50, padding: '12px 22px', cursor: 'pointer', boxShadow: '0 4px 0 #c4b5fd' },
};
