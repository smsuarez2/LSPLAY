import { useRef, useState, useEffect } from 'react';

const signs = [
  { id: 'gracias',   label: 'Gracias',   emoji: '🙏' },
  { id: 'escucha',   label: 'Escucha',   emoji: '👂' },
  { id: 'explicar',  label: 'Explicar',  emoji: '🗣️' },
  { id: 'invitar',   label: 'Invitar',   emoji: '🤝' },
  { id: 'diferente', label: 'Diferente', emoji: '🔄' },
  { id: 'nunca',     label: 'Nunca',     emoji: '🚫' },
];

type Result = 'none' | 'correct' | 'incorrect';

export default function Camara() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [active, setActive]     = useState(false);
  const [error, setError]       = useState('');
  const [current, setCurrent]   = useState(0);
  const [result, setResult]     = useState<Result>('none');
  const [score, setScore]       = useState(0);
  const [checked, setChecked]   = useState(false);

  const sign = signs[current];

  async function startCamera() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
    } catch {
      setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setResult('none');
    setChecked(false);
  }

  function checkSign() {
    if (!active || checked) return;
    setChecked(true);
    // Simulación IA — aquí irá MediaPipe cuando se integre
    const conf = Math.floor(Math.random() * 40 + 60);
    const isCorrect = conf >= 75;
    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setScore(s => s + 1);
  }

  function changeSign(index: number) {
    setResult('none');
    setChecked(false);
    setCurrent(index);
  }

  function nextSign() {
    changeSign((current + 1) % signs.length);
  }

  function prevSign() {
    changeSign((current - 1 + signs.length) % signs.length);
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '40px 24px' }}>
      <h1 style={s.title}>📷 Practica con la Cámara</h1>
      <p style={s.sub}>Imita la seña del GIF y presiona "Verificar" para saber si lo hiciste bien</p>

      {/* Puntaje */}
      <div style={s.scoreBadge}>⭐ {score} / {signs.length} señas correctas</div>

      {/* Tabs de señas */}
      <div style={s.signTabs}>
        {signs.map((sg, i) => (
          <button key={sg.id} onClick={() => changeSign(i)}
            style={{ ...s.signTab, ...(current === i ? s.signTabActive : {}) }}>
            {sg.emoji} {sg.label}
          </button>
        ))}
      </div>

      {/* Panel principal */}
      <div style={s.mainPanel}>

        {/* IZQUIERDA — GIF */}
        <div style={s.col}>
          <div style={s.colLabel}>Seña a imitar:</div>
          <div style={s.gifBox}>
            <img
              src={`/signs/${sign.id}.gif`}
              alt={`Seña ${sign.label}`}
              style={s.gifImg}
            />
          </div>
          <div style={s.signNameBox}>
            <span style={s.signName}>{sign.emoji} {sign.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
            <button style={s.navBtn} onClick={prevSign}>← Anterior</button>
            <button style={s.navBtn} onClick={nextSign}>Siguiente →</button>
          </div>
        </div>

        {/* DERECHA — Cámara */}
        <div style={s.col}>
          <div style={s.colLabel}>Tu cámara:</div>
          <div style={s.camBox}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ ...s.video, display: active ? 'block' : 'none' }} />

            {!active && (
              <div style={s.camPlaceholder}>
                <span style={{ fontSize: 52, display: 'block', marginBottom: 10 }}>📷</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                  Activa tu cámara<br />para practicar
                </p>
              </div>
            )}

            {/* Resultado encima de la cámara */}
            {result !== 'none' && (
              <div style={{
                ...s.resultOverlay,
                background: result === 'correct'
                  ? 'rgba(22,163,74,0.85)'
                  : 'rgba(220,38,38,0.85)'
              }}>
                <div style={{ fontSize: 52 }}>
                  {result === 'correct' ? '✅' : '❌'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, marginTop: 10, color: '#fff' }}>
                  {result === 'correct' ? '¡Correcto! +1 punto' : '¡Inténtalo de nuevo!'}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
            {!active
              ? <button style={s.btnStart} onClick={startCamera}>📷 Activar Cámara</button>
              : <button style={s.btnStop}  onClick={stopCamera}>⏹ Detener</button>
            }
            {active && (
              <button style={{ ...s.btnCheck, ...(checked ? s.btnCheckDone : {}) }}
                onClick={checkSign} disabled={checked}>
                {checked ? '✓ Verificado' : '🔍 Verificar seña'}
              </button>
            )}
          </div>

          {result !== 'none' && (
            <button style={s.btnNext} onClick={nextSign}>
              Siguiente seña →
            </button>
          )}

          {error && <div style={s.errorBox}>⚠️ {error}</div>}
        </div>
      </div>

      <div style={s.tip}>
        💡 Mira el GIF de la izquierda, imita la seña frente a tu cámara y presiona <strong>"Verificar seña"</strong>.
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title:       { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(24px,4vw,38px)', color: '#fff', textAlign: 'center', marginBottom: 8 },
  sub:         { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16 },
  scoreBadge:  { display: 'block', margin: '0 auto 20px', width: 'fit-content', background: '#fcd34d', color: '#78350f', fontFamily: "'Fredoka One',cursive", fontSize: 18, padding: '8px 24px', borderRadius: 50, boxShadow: '0 3px 0 #d97706' },
  signTabs:    { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 },
  signTab:     { fontFamily: "'Fredoka One',cursive", fontSize: 14, padding: '7px 16px', borderRadius: 20, border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' },
  signTabActive: { background: '#c4b5fd', color: '#4c1d95', borderColor: '#c4b5fd' },
  mainPanel:   { display: 'flex', gap: 24, maxWidth: 900, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' },
  col:         { flex: 1, minWidth: 280, maxWidth: 400 },
  colLabel:    { color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  gifBox:      { borderRadius: 20, border: '3px solid #a78bfa', overflow: 'hidden', aspectRatio: '1', background: '#000' },
  gifImg:      { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  signNameBox: { background: 'rgba(196,181,253,0.15)', borderRadius: 12, padding: '10px', textAlign: 'center', marginTop: 12, border: '1.5px solid rgba(196,181,253,0.3)' },
  signName:    { fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#c4b5fd' },
  navBtn:      { fontFamily: "'Fredoka One',cursive", fontSize: 14, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '7px 16px', cursor: 'pointer' },
  camBox:      { borderRadius: 20, border: '3px solid #a78bfa', overflow: 'hidden', aspectRatio: '1', background: '#0d0d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  video:       { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', position: 'absolute', top: 0, left: 0 },
  camPlaceholder: { textAlign: 'center', padding: 20 },
  resultOverlay:  { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20, backdropFilter: 'blur(4px)', zIndex: 10 },
  btnStart:    { fontFamily: "'Fredoka One',cursive", fontSize: 16, background: '#c4b5fd', color: '#4c1d95', border: 'none', borderRadius: 50, padding: '10px 22px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed' },
  btnStop:     { fontFamily: "'Fredoka One',cursive", fontSize: 16, background: '#fca5a5', color: '#7f1d1d', border: 'none', borderRadius: 50, padding: '10px 22px', cursor: 'pointer', boxShadow: '0 4px 0 #dc2626' },
  btnCheck:    { fontFamily: "'Fredoka One',cursive", fontSize: 16, background: '#86efac', color: '#14532d', border: 'none', borderRadius: 50, padding: '10px 22px', cursor: 'pointer', boxShadow: '0 4px 0 #16a34a' },
  btnCheckDone:{ background: '#d1fae5', color: '#6b7280', boxShadow: 'none', cursor: 'default' },
  btnNext:     { fontFamily: "'Fredoka One',cursive", fontSize: 16, background: '#fcd34d', color: '#78350f', border: 'none', borderRadius: 50, padding: '10px 22px', cursor: 'pointer', boxShadow: '0 4px 0 #d97706', display: 'block', margin: '12px auto 0' },
  errorBox:    { background: 'rgba(252,165,165,0.15)', border: '2px solid #fca5a5', borderRadius: 12, padding: '10px 16px', color: '#fca5a5', fontWeight: 700, fontSize: 13, textAlign: 'center', marginTop: 10 },
  tip:         { background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 18px', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700, textAlign: 'center', maxWidth: 700, margin: '24px auto 0', border: '2px dashed rgba(255,255,255,0.12)' },
};
