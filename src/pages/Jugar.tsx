import { useState, useEffect, useMemo } from 'react';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function SignImg({ letter, size = 60 }: { letter: string; size?: number }) {
  return (
    <img
      src={`/hands/${letter.toLowerCase()}.png`}
      alt={`Seña ${letter}`}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', margin: '0 auto' }}
    />
  );
}

type Card = { id: number; value: string; type: 'letter' | 'hand'; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildCards(): Card[] {
  const letters = shuffle(alphabet).slice(0, 6);
  const pairs: Card[] = [];
  letters.forEach((l, i) => {
    pairs.push({ id: i * 2,     value: l, type: 'letter', flipped: false, matched: false });
    pairs.push({ id: i * 2 + 1, value: l, type: 'hand',   flipped: false, matched: false });
  });
  return shuffle(pairs);
}

export default function Jugar() {
  const [mode, setMode] = useState<'menu' | 'memory' | 'quiz'>('menu');

  return (
    <div style={{ minHeight: '100vh', background: '#faf7ff', padding: '40px 32px' }}>
      <h1 style={s.title}>🎮 Minijuegos</h1>
      <p style={s.sub}>Elige un juego y demuestra lo que aprendiste</p>

      {mode === 'menu' && (
        <div style={s.menuGrid}>
          <div style={s.gameCard} onClick={() => setMode('memory')}>
            <span style={s.gameEmoji}>🃏</span>
            <h3 style={s.gameTitle}>Juego de Memoria</h3>
            <p style={s.gameDesc}>Empareja la imagen de la seña con su letra. ¡Encuentra todos los pares!</p>
            <span style={{ ...s.gameTag, background: '#ede9fb', color: '#5b21b6' }}>6 pares</span>
          </div>
          <div style={s.gameCard} onClick={() => setMode('quiz')}>
            <span style={s.gameEmoji}>❓</span>
            <h3 style={s.gameTitle}>¿Cuál seña es?</h3>
            <p style={s.gameDesc}>Ve la seña y elige la letra correcta entre 4 opciones.</p>
            <span style={{ ...s.gameTag, background: '#fef3c7', color: '#78350f' }}>10 preguntas</span>
          </div>
        </div>
      )}

      {mode === 'memory' && <MemoryGame onBack={() => setMode('menu')} />}
      {mode === 'quiz'   && <QuizGame   onBack={() => setMode('menu')} />}
    </div>
  );
}

/* ── MEMORY GAME ── */
function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards]     = useState<Card[]>(buildCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves]     = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon]         = useState(false);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [won]);

  useEffect(() => {
    if (cards.every(c => c.matched)) setWon(true);
  }, [cards]);

  function flip(id: number) {
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched || flipped.length === 2) return;
    const newFlipped = [...flipped, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!);
      if (a.value === b.value) {
        setCards(prev => prev.map(c => c.value === a.value ? { ...c, matched: true } : c));
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 900);
      }
    } else {
      setFlipped(newFlipped);
    }
  }

  const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={s.gameHeader}>
        <button style={s.backBtn} onClick={onBack}>← Volver</button>
        <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#3d2c6e' }}>🃏 Juego de Memoria</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={s.statPill}>⏱ {fmt(seconds)}</span>
          <span style={s.statPill}>🔄 {moves}</span>
        </div>
      </div>

      {won ? (
        <div style={s.winBox}>
          <div style={{ fontSize: 64 }}>🏆</div>
          <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 32, color: '#3d2c6e', margin: '12px 0 8px' }}>¡Ganaste!</h2>
          <p style={{ fontSize: 16, color: '#6b5a9e', fontWeight: 600 }}>{fmt(seconds)} · {moves} movimientos</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
            <button style={s.btnPlay} onClick={() => { setCards(buildCards()); setFlipped([]); setMoves(0); setSeconds(0); setWon(false); }}>🔄 Jugar de nuevo</button>
            <button style={{ ...s.btnPlay, background: '#ede9fb', color: '#5b21b6', boxShadow: '0 4px 0 #7c3aed' }} onClick={onBack}>← Menú</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {cards.map(card => (
            <div key={card.id} onClick={() => flip(card.id)}
              style={{
                ...s.memCard,
                ...(card.flipped || card.matched ? s.memFace : s.memBack),
                ...(card.matched ? s.memMatched : {}),
              }}>
              {(card.flipped || card.matched) && (
                card.type === 'letter'
                  ? <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 40, color: card.matched ? '#14532d' : '#7c3aed' }}>{card.value}</span>
                  : <SignImg letter={card.value} size={64} />
              )}
              {!card.flipped && !card.matched && (
                <span style={{ fontSize: 32, color: '#fff', opacity: 0.7 }}>?</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── QUIZ GAME ── */
function QuizGame({ onBack }: { onBack: () => void }) {
  // Generamos todas las preguntas UNA SOLA VEZ al inicio
  const [questions] = useState<string[]>(() => shuffle(alphabet).slice(0, 10));

  // Las opciones de cada pregunta también se generan UNA SOLA VEZ
  // y se guardan en un array fijo
  const allOptions = useMemo(() => {
    return questions.map(correct => {
      const wrong = shuffle(alphabet.filter(l => l !== correct)).slice(0, 3);
      return shuffle([correct, ...wrong]);
    });
  }, [questions]);

  const [current, setCurrent]   = useState(0);
  const [score, setScore]       = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone]         = useState(false);
  const [seconds, setSeconds]   = useState(0);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const correct = questions[current];
  // Las opciones de esta pregunta son FIJAS, no se recalculan
  const opts = allOptions[current];

  const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  function answer(opt: string) {
    if (selected) return; // ya respondió, no hacer nada
    setSelected(opt);
    if (opt === correct) setScore(sc => sc + 1);
    // Esperar 1.2 segundos para que el niño vea si acertó o no
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 1200);
  }

  function restart() {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setDone(false);
    setSeconds(0);
  }

  if (done) return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={s.winBox}>
        <div style={{ fontSize: 64 }}>{score >= 8 ? '🏆' : score >= 5 ? '🌟' : '💪'}</div>
        <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 32, color: '#3d2c6e', margin: '12px 0 8px' }}>
          {score >= 8 ? '¡Excelente!' : score >= 5 ? '¡Muy bien!' : '¡Sigue practicando!'}
        </h2>
        <p style={{ fontSize: 18, color: '#6b5a9e', fontWeight: 700 }}>
          {score} / {questions.length} correctas · {fmt(seconds)}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
          <button style={s.btnPlay} onClick={restart}>🔄 Jugar de nuevo</button>
          <button style={{ ...s.btnPlay, background: '#ede9fb', color: '#5b21b6', boxShadow: '0 4px 0 #7c3aed' }} onClick={onBack}>← Menú</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={s.gameHeader}>
        <button style={s.backBtn} onClick={onBack}>← Volver</button>
        <span style={s.statPill}>❓ {current + 1} / {questions.length}</span>
        <span style={s.statPill}>⭐ {score} pts · ⏱ {fmt(seconds)}</span>
      </div>

      {/* Imagen de la seña — FIJA para esta pregunta */}
      <div style={{ ...s.winBox, marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#9e8ec0', marginBottom: 16 }}>
          ¿Qué letra representa esta seña?
        </p>
        <SignImg letter={correct} size={160} />
      </div>

      {/* 4 opciones FIJAS — no cambian solas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {opts.map(opt => {
          let bg = '#fff', border = '#e8e0f5', color = '#3d2c6e';
          if (selected) {
            if (opt === correct)                     { bg = '#f0fdf4'; border = '#86efac'; color = '#14532d'; }
            if (opt === selected && opt !== correct)  { bg = '#fef2f2'; border = '#fca5a5'; color = '#7f1d1d'; }
          }
          return (
            <button key={opt} onClick={() => answer(opt)}
              style={{
                fontFamily: "'Fredoka One',cursive",
                fontSize: 36,
                padding: '20px 10px',
                borderRadius: 16,
                border: `2px solid ${border}`,
                background: bg,
                color,
                cursor: selected ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title:     { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(28px,4vw,42px)', color: '#3d2c6e', textAlign: 'center', marginBottom: 8 },
  sub:       { fontSize: 16, fontWeight: 600, color: '#9e8ec0', textAlign: 'center', marginBottom: 40 },
  menuGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24, maxWidth: 680, margin: '0 auto' },
  gameCard:  { background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center', border: '2px solid #e8e0f5', boxShadow: '0 4px 0 rgba(139,92,246,0.1)', cursor: 'pointer', transition: 'all 0.2s' },
  gameEmoji: { fontSize: 56, display: 'block', marginBottom: 14 },
  gameTitle: { fontFamily: "'Fredoka One',cursive", fontSize: 26, color: '#3d2c6e', marginBottom: 8 },
  gameDesc:  { fontSize: 14, fontWeight: 600, color: '#9e8ec0', lineHeight: 1.5, marginBottom: 12 },
  gameTag:   { display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 },
  gameHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 20, background: '#f3edfc', borderRadius: 14, padding: '12px 16px' },
  backBtn:   { fontFamily: "'Fredoka One',cursive", fontSize: 15, background: '#c4b5fd', color: '#4c1d95', border: 'none', borderRadius: 20, padding: '7px 16px', cursor: 'pointer' },
  statPill:  { fontSize: 13, fontWeight: 800, color: '#5b21b6', background: '#ede9fb', padding: '5px 12px', borderRadius: 20 },
  memCard:   { aspectRatio: '1', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '2px solid' },
  memBack:   { background: '#7c3aed', borderColor: '#4c1d95' },
  memFace:   { background: '#fff', borderColor: '#c4b5fd' },
  memMatched:{ background: '#f0fdf4', borderColor: '#86efac' },
  winBox:    { background: '#fff', borderRadius: 20, padding: '36px 24px', textAlign: 'center', border: '2px solid #e8e0f5', boxShadow: '0 4px 0 rgba(139,92,246,0.1)', marginBottom: 20 },
  btnPlay:   { fontFamily: "'Fredoka One',cursive", fontSize: 18, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 50, padding: '12px 24px', cursor: 'pointer', boxShadow: '0 4px 0 #4c1d95' },
};
