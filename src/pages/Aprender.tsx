import { useState } from 'react';
import { Icon } from '@iconify/react';

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

const handEmojis: Record<string, string> = {
  A:'fluent-emoji-flat:raised-fist',B:'fluent-emoji-flat:raised-hand',C:'fluent-emoji-flat:pinching-hand',D:'fluent-emoji-flat:index-pointing-up',E:'fluent-emoji-flat:raised-fist',F:'fluent-emoji-flat:pinched-fingers',
  G:'fluent-emoji-flat:backhand-index-pointing-left',H:'fluent-emoji-flat:victory-hand',I:'fluent-emoji-flat:call-me-hand',J:'fluent-emoji-flat:call-me-hand',K:'fluent-emoji-flat:vulcan-salute',L:'fluent-emoji-flat:love-you-gesture',
  M:'fluent-emoji-flat:raised-fist',N:'fluent-emoji-flat:raised-fist',O:'fluent-emoji-flat:ok-hand',P:'fluent-emoji-flat:vulcan-salute',Q:'fluent-emoji-flat:backhand-index-pointing-down',R:'fluent-emoji-flat:crossed-fingers',
  S:'fluent-emoji-flat:raised-fist',T:'fluent-emoji-flat:raised-fist',U:'fluent-emoji-flat:victory-hand',V:'fluent-emoji-flat:victory-hand',W:'fluent-emoji-flat:vulcan-salute',X:'fluent-emoji-flat:index-pointing-up',
  Y:'fluent-emoji-flat:call-me-hand',Z:'fluent-emoji-flat:index-pointing-up',
};

export default function Aprender() {
  const [selected, setSelected] = useState<string | null>(null);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('todas');

  const groups = { 'todas': alphabet, 'A-F': alphabet.slice(0,6), 'G-L': alphabet.slice(6,12), 'M-R': alphabet.slice(12,18), 'S-Z': alphabet.slice(18) };
  const visible = groups[filter as keyof typeof groups];

  function markLearned(letter: string) {
    setLearned(prev => new Set([...prev, letter]));
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7ff', padding: '40px 32px' }}>
      <h1 style={s.title}>Módulos de Aprendizaje</h1>
      <p style={s.sub}>Aprende cada seña del abecedario</p>

      {/* Filtros */}
      <div style={s.filters}>
        {Object.keys(groups).map(g => (
          <button key={g} onClick={() => setFilter(g)}
            style={{ ...s.filterBtn, ...(filter === g ? s.filterActive : {}) }}>
            {g}
          </button>
        ))}
      </div>

      {/* Progreso */}
      <div style={s.progWrap}>
        <span style={s.progLabel}>{learned.size} / {alphabet.length} señas aprendidas</span>
        <div className="prog-bar-outer" style={{ flex: 1, maxWidth: 400 }}>
          <div className="prog-bar-inner" style={{ width: `${(learned.size / alphabet.length) * 100}%` }} />
        </div>
      </div>

      {/* Grid de letras */}
      <div style={s.grid}>
        {visible.map(letter => {
          const isLearned = learned.has(letter);
          return (
            <div key={letter}
              onClick={() => setSelected(letter)}
              style={{ ...s.signBox, ...(isLearned ? s.signBoxLearned : {}), ...(selected === letter ? s.signBoxSelected : {}) }}>
              <Icon icon={handEmojis[letter]} width={36} style={{ display: 'block', margin: '0 auto 6px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 32, color: isLearned ? '#267a50' : '#7c3aed' }}>{letter}</span>
                {isLearned && <span style={s.checkBadge}>Aprendida</span>}
                {!isLearned && <span style={s.viewBadge}>Ver</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de seña */}
      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <Icon icon={handEmojis[selected]} width={80} style={{ display: 'block', margin: '0 auto 12px' }} />
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 52, color: '#7c3aed', textAlign: 'center', marginBottom: 8 }}>{selected}</h2>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#6b5a9e', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              {signDescriptions[selected]}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={s.btnLearn} onClick={() => { markLearned(selected); setSelected(null); }}>
                <><Icon icon="fluent-emoji-flat:check-mark-button" width={20} style={{verticalAlign:'middle',marginRight:6}} />¡Ya la aprendí!</>
              </button>
              <button style={s.btnPractice} onClick={() => setSelected(null)}>
                <><Icon icon="fluent-emoji-flat:camera" width={20} style={{verticalAlign:'middle',marginRight:6}} />Practicar con cámara</>
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
  filterBtn:    { fontFamily: "'Fredoka One',cursive", fontSize: 15, padding: '7px 18px', borderRadius: 20, border: '2px solid #c4b5fd', background: '#fff', color: '#7c3aed', cursor: 'pointer' },
  filterActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  progWrap: { display: 'flex', alignItems: 'center', gap: 16, maxWidth: 700, margin: '0 auto 32px', flexWrap: 'wrap' },
  progLabel:{ fontSize: 14, fontWeight: 700, color: '#7c3aed', whiteSpace: 'nowrap' },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 12, maxWidth: 900, margin: '0 auto' },
  signBox:  { background: '#fff', borderRadius: 16, border: '2px solid #e8e0f5', padding: '16px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 3px 0 rgba(139,92,246,0.08)' },
  signBoxLearned:  { background: '#f0fdf4', borderColor: '#86efac' },
  signBoxSelected: { borderColor: '#7c3aed', transform: 'scale(1.05)', boxShadow: '0 6px 0 rgba(124,58,237,0.2)' },
  checkBadge: { display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12, background: '#dcfce7', color: '#14532d' },
  viewBadge:  { display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12, background: '#ede9fb', color: '#5b21b6' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
  modal:    { background: '#fff', borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', position: 'relative', border: '3px solid #c4b5fd', boxShadow: '0 20px 40px rgba(124,58,237,0.2)' },
  closeBtn: { position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9e8ec0' },
  btnLearn:    { fontFamily: "'Fredoka One',cursive", fontSize: 18, background: '#86efac', color: '#14532d', border: 'none', borderRadius: 50, padding: '12px 24px', cursor: 'pointer', boxShadow: '0 4px 0 #16a34a' },
  btnPractice: { fontFamily: "'Fredoka One',cursive", fontSize: 18, background: '#c4b5fd', color: '#4c1d95', border: 'none', borderRadius: 50, padding: '12px 24px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed' },
};
