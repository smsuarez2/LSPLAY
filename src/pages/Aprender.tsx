import { useState } from 'react';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const signDescriptions: Record<string, string> = {
  A:'Cierra el puño con el pulgar al lado.',
  B:'Dedos juntos y extendidos hacia arriba, pulgar doblado.',
  C:'Curva los dedos formando una C.',
  D:'Dedo índice arriba, los demás forman un círculo con el pulgar.',
  E:'Dobla los dedos hacia abajo sobre el pulgar.',
  F:'Une el pulgar con el índice, los demás extendidos.',
  G:'Índice y pulgar apuntan hacia el lado.',
  H:'Índice y medio extendidos juntos hacia el lado.',
  I:'Solo el meñique extendido hacia arriba.',
  J:'Meñique extendido y traza una J en el aire.',
  K:'Índice arriba, medio diagonal, pulgar entre ellos.',
  L:'Índice arriba y pulgar hacia el lado (forma L).',
  M:'Tres dedos doblados sobre el pulgar.',
  N:'Dos dedos doblados sobre el pulgar.',
  O:'Todos los dedos forman un círculo (forma O).',
  P:'Como la K pero apuntando hacia abajo.',
  Q:'Como la G pero apuntando hacia abajo.',
  R:'Índice y medio cruzados, extendidos.',
  S:'Puño cerrado con el pulgar sobre los dedos.',
  T:'Pulgar entre índice y medio.',
  U:'Índice y medio extendidos y juntos hacia arriba.',
  V:'Índice y medio extendidos en forma de V.',
  W:'Índice, medio y anular extendidos.',
  X:'Índice doblado en gancho.',
  Y:'Pulgar y meñique extendidos (los demás cerrados).',
  Z:'Traza una Z en el aire con el índice.',
};

export default function Aprender() {
  const [selected, setSelected] = useState<string | null>(null);
  const [learned, setLearned]   = useState<Set<string>>(new Set());
  const [filter, setFilter]     = useState('Todas');

  const groups: Record<string, string[]> = {
    'Todas': alphabet,
    'A – F':  alphabet.slice(0, 6),
    'G – L':  alphabet.slice(6, 12),
    'M – R':  alphabet.slice(12, 18),
    'S – Z':  alphabet.slice(18),
  };
  const visible = groups[filter];

  function markLearned(letter: string) {
    setLearned(prev => new Set([...prev, letter]));
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
        <span style={s.progLabel}>{learned.size} / {alphabet.length} señas aprendidas</span>
        <div className="prog-bar-outer" style={{ flex: 1, maxWidth: 400 }}>
          <div className="prog-bar-inner"
            style={{ width: `${(learned.size / alphabet.length) * 100}%` }} />
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div style={s.grid}>
        {visible.map(letter => {
          const isLearned = learned.has(letter);
          return (
            <div key={letter} onClick={() => setSelected(letter)}
              style={{
                ...s.signBox,
                ...(isLearned ? s.signBoxLearned : {}),
                ...(selected === letter ? s.signBoxSelected : {}),
              }}>

              {/* Imagen real de la seña */}
              <img
                src={`/signs/${letter.toLowerCase()}.png`}
                alt={`Seña ${letter}`}
                style={s.signImg}
              />

              <span style={{
                fontFamily: "'Fredoka One',cursive",
                fontSize: 28,
                color: isLearned ? '#267a50' : '#7c3aed',
                marginTop: 6,
                display: 'block',
              }}>
                {letter}
              </span>

              <span style={isLearned ? s.checkBadge : s.viewBadge}>
                {isLearned ? '✓ Aprendida' : 'Ver seña'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>

            {/* Imagen grande */}
            <img
              src={`/signs/${selected.toLowerCase()}.png`}
              alt={`Seña ${selected}`}
              style={s.modalImg}
            />

            <h2 style={s.modalLetter}>{selected}</h2>
            <p style={s.modalDesc}>{signDescriptions[selected]}</p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={s.btnLearn}
                onClick={() => { markLearned(selected); setSelected(null); }}>
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
