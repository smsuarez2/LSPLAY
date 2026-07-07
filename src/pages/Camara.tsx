import { useRef, useState, useEffect } from 'react';

// 26 letras del abecedario (A-Z). Todas son posturas estáticas.
// J y Z incluyen una flecha dibujada en la propia imagen como referencia visual del movimiento real,
// pero la cámara las detecta igual que cualquier otra letra (postura fija).
const SIGNS = [
  { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' },
  { id: 'd', label: 'D' }, { id: 'e', label: 'E' }, { id: 'f', label: 'F' },
  { id: 'g', label: 'G' }, { id: 'h', label: 'H' }, { id: 'i', label: 'I' },
  { id: 'j', label: 'J' }, { id: 'k', label: 'K' }, { id: 'l', label: 'L' },
  { id: 'm', label: 'M' }, { id: 'n', label: 'N' }, { id: 'o', label: 'O' },
  { id: 'p', label: 'P' }, { id: 'q', label: 'Q' }, { id: 'r', label: 'R' },
  { id: 's', label: 'S' }, { id: 't', label: 'T' }, { id: 'u', label: 'U' },
  { id: 'v', label: 'V' }, { id: 'w', label: 'W' }, { id: 'x', label: 'X' },
  { id: 'y', label: 'Y' }, { id: 'z', label: 'Z' },
] as const;

const API = 'https://lsplay-python-backend-production.up.railway.app';
const FRAME_INTERVAL_MS = 150;
const TARGET_SAMPLES = 12;

type Mode = 'menu' | 'train' | 'practice';
type SignResult = 'none' | 'correct' | 'incorrect';

export default function Camara() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
  const [mode, setMode] = useState<Mode>(isAdmin ? 'menu' : 'practice');
  const [active, setActive]   = useState(false);
  const [current, setCurrent] = useState(0);
  const [result, setResult]   = useState<SignResult>('none');
  const [score, setScore]     = useState(0);
  const [checked, setChecked] = useState(false);
  const [handVisible, setHandVisible] = useState(false);
  const [detected, setDetected] = useState<{ label: string; conf: number } | null>(null);
  const [trainCount, setTrainCount] = useState<Record<string, number>>({});
  const [trainedSigns, setTrainedSigns] = useState<string[]>([]);
  const [status, setStatus]   = useState('');
  const [serverOnline, setServerOnline] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [completedLetters, setCompletedLetters] = useState<Set<string>>(new Set());

  const sign = SIGNS[current];

  useEffect(() => { setImgError(false); }, [current]);

  useEffect(() => {
    fetch(`${API}/`).then(r => r.ok ? setServerOnline(true) : setServerOnline(false))
      .catch(() => setServerOnline(false));

    fetch(`${API}/api/status`)
      .then(r => r.json())
      .then(data => {
        setTrainCount(data.train_count || {});
        setTrainedSigns(data.trained_signs || []);
      })
      .catch(() => {});
  }, []);

  function countFor(letterId: string) {
    return trainCount[letterId] || 0;
  }
  function isCompleted(letterId: string) {
    return countFor(letterId) >= TARGET_SAMPLES;
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
      startFrameLoop();
    } catch (err) {
      setStatus('❌ No se pudo acceder a la cámara del navegador.');
    }
  }

  async function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (mode === 'train') await fetch(`${API}/api/train/stop`, { method: 'POST' }).catch(() => {});
    setActive(false);
    setHandVisible(false);
    setDetected(null);
    stopFrameLoop();
  }

  function startFrameLoop() {
    stopFrameLoop();
    frameLoopRef.current = setInterval(sendFrame, FRAME_INTERVAL_MS);
  }
  function stopFrameLoop() {
    if (frameLoopRef.current) clearInterval(frameLoopRef.current);
    frameLoopRef.current = null;
  }

  async function sendFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

    try {
      const res = await fetch(`${API}/api/frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!res.ok) return;
      const data = await res.json();

      setServerOnline(true);
      setHandVisible(!!data.hand_visible);
      setTrainCount(data.train_count || {});
      setTrainedSigns(data.trained_signs || []);
      if (mode === 'practice' && data.detected_sign) {
        setDetected({ label: data.detected_sign, conf: data.confidence });
      }
    } catch {
      setServerOnline(false);
    }
  }

  async function startTrainingMode() {
    await fetch(`${API}/api/train/start/${sign.id}`, { method: 'POST' });
    setStatus(`🎯 Entrenando "${sign.label}" — mantén la postura de la mano unos segundos`);
  }

  async function changeSign(i: number) {
    setCurrent(i);
    setResult('none'); setChecked(false); setStatus(''); setDetected(null);
    if (mode === 'train' && active) {
      await fetch(`${API}/api/train/start/${SIGNS[i].id}`, { method: 'POST' });
    }
  }

  function checkSign() {
    setChecked(true);
    if (detected && detected.label === sign.id && detected.conf >= 55) {
      setResult('correct');
      setScore(s => s + 1);
      setCompletedLetters(prev => new Set(prev).add(sign.id));
    } else {
      setResult('incorrect');
    }
  }

  function nextSign() {
    setResult('none'); setChecked(false); setStatus(''); setDetected(null);
    changeSign((current + 1) % SIGNS.length);
  }

  function retrySign() {
    setResult('none'); setChecked(false); setStatus(''); setDetected(null);
  }

  async function changeMode(m: Mode) {
    await stopCamera();
    setMode(m);
    setResult('none'); setChecked(false); setStatus(''); setDetected(null); setCurrent(0);
  }

  async function clearSamples() {
    await fetch(`${API}/api/samples/clear`, { method: 'POST' });
    setTrainCount({});
    setTrainedSigns([]);
    setStatus('🗑️ Muestras borradas');
  }

  useEffect(() => {
    if (mode === 'practice' && result === 'correct') {
      const timer = setTimeout(() => {
        nextSign();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, mode]);

  useEffect(() => {
    if (mode === 'train' && active) startTrainingMode();
  }, [mode, active]);

  useEffect(() => () => { stopCamera(); }, []);

  const totalSamples = Object.values(trainCount).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '32px 24px' }}>
      <h1 style={s.title}>{isAdmin ? '🔤 Abecedario con Inteligencia Artificial' : '🔤 ¡Practica el Abecedario!'}</h1>
      <p style={s.sub}>{isAdmin ? 'Detección del alfabeto dactilológico con Python + MediaPipe' : 'Haz la letra con tu mano frente a la cámara'}</p>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!serverOnline && (
        <div style={s.serverError}>
          {isAdmin ? '⚠️ Servidor Python no disponible. Verifica que esté corriendo en Railway.' : '⚠️ No se pudo conectar. Intenta de nuevo en un momento.'}
        </div>
      )}

      {isAdmin && (
        <div style={s.modeTabs}>
          <button style={{ ...s.modeTab, ...(mode === 'train' ? s.modeActive : {}) }} onClick={() => changeMode('train')}>
            🎯 Entrenar letras
          </button>
          <button style={{ ...s.modeTab, ...(mode === 'practice' ? s.modeActive : {}) }} onClick={() => changeMode('practice')}>
            🏋️ Practicar
          </button>
        </div>
      )}

      {mode === 'menu' && (
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={s.infoBox}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🐍</div>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#c4b5fd', marginBottom: 8 }}>¿Cómo funciona?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              Python con MediaPipe detecta la postura de tu mano para cada letra del abecedario.<br /><br />
              <strong style={{ color: '#c4b5fd' }}>Paso 1 — Entrenar:</strong> Haz la postura de cada letra frente a la cámara.<br />
              <strong style={{ color: '#86efac' }}>Paso 2 — Practicar:</strong> La IA detecta qué letra estás formando en tiempo real.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAdmin && <button style={s.btnMain} onClick={() => changeMode('train')}>🎯 Ir a Entrenar</button>}
            <button style={{ ...s.btnMain, background: '#86efac', color: '#14532d', boxShadow: '0 4px 0 #16a34a' }}
              onClick={() => changeMode('practice')}>🏋️ Ir a Practicar</button>
          </div>
        </div>
      )}

      {(mode === 'train' || mode === 'practice') && (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={s.statsRow}>
            {mode === 'train' && <>
              <span style={s.pill}>📊 {totalSamples} muestras guardadas</span>
              <span style={s.pill}>✅ {trainedSigns.length} / {SIGNS.length} entrenadas</span>
              <button style={s.clearBtn} onClick={clearSamples}>🗑️ Borrar todo</button>
            </>}
            {mode === 'practice' && (
              <span style={s.pill}>⭐ {score} correctas en esta sesión</span>
            )}
          </div>

          {mode === 'train' && (
            <div style={s.signTabs}>
              {SIGNS.map((sg, i) => (
                <button key={sg.id} onClick={() => changeSign(i)}
                  style={{ ...s.letterTab, ...(current === i ? s.signTabActive : {}),
                    ...(trainedSigns.includes(sg.id) ? { borderColor: '#86efac' } : {}) }}>
                  {sg.label}
                  {(trainCount[sg.id] || 0) > 0 && (
                    <span style={{ fontSize: 9, background: '#86efac', color: '#14532d', borderRadius: 10, padding: '1px 4px', marginLeft: 3 }}>
                      {trainCount[sg.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {mode === 'train' && (
            <div style={s.checklistBox}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                📋 Progreso del abecedario ({trainedSigns.filter(id => isCompleted(id)).length} / {SIGNS.length} completadas)
              </div>
              <div style={s.checklistGrid}>
                {SIGNS.map(sg => {
                  const done = isCompleted(sg.id);
                  const started = countFor(sg.id) > 0 && !done;
                  return (
                    <div key={sg.id} style={{
                      ...s.checkItem,
                      background: done ? 'rgba(134,239,172,0.18)' : started ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.05)',
                      borderColor: done ? '#86efac' : started ? '#fcd34d' : 'rgba(255,255,255,0.12)',
                    }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: done ? '#86efac' : started ? '#fcd34d' : 'rgba(255,255,255,0.6)' }}>
                        {done ? '✅' : started ? '🟡' : '⬜'} {sg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode === 'practice' && (
            <div style={s.progressBarBox}>
              <div style={s.progressBarLabel}>
                🏆 Progreso: {completedLetters.size} / {SIGNS.length} letras
              </div>
              <div style={s.progressBarTrack}>
                <div style={{
                  ...s.progressBarFill,
                  width: `${(completedLetters.size / SIGNS.length) * 100}%`,
                }} />
              </div>
            </div>
          )}

          <div style={s.mainPanel}>
            <div style={s.col}>
              <div style={s.colLabel}>{mode === 'train' ? 'Letra a entrenar:' : 'Adivina la letra:'}</div>
              <div style={s.gifBox}>
                {mode === 'practice' && result !== 'correct' ? (
                  <div style={s.letterHintBox}>
                    <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 130, color: '#c4b5fd' }}>{sign.label}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12, textAlign: 'center', padding: '0 16px' }}>
                      Forma esta letra con tu mano frente a la cámara
                    </span>
                  </div>
                ) : imgError ? (
                  <div style={s.letterFallback}>
                    <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 96, color: '#c4b5fd' }}>{sign.label}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                      (imagen pendiente de subir)
                    </span>
                  </div>
                ) : (
                  <img
                    src={`/signs/${sign.id}.png`}
                    alt={sign.label}
                    style={s.gifImg}
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
              <div style={s.signNameBox}>
                <span style={s.signName}>Letra {sign.label}</span>
              </div>
              {mode === 'train' && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
                  Mantén la <strong>postura de la mano</strong> frente a la cámara unos segundos, moviéndola ligeramente de ángulo.
                </p>
              )}
              {mode === 'train' && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                  <button style={s.navBtn} onClick={() => changeSign((current - 1 + SIGNS.length) % SIGNS.length)}>← Anterior</button>
                  <button style={s.navBtn} onClick={() => changeSign((current + 1) % SIGNS.length)}>Siguiente →</button>
                </div>
              )}
            </div>

            <div style={s.col}>
              <div style={s.colLabel}>Tu cámara:</div>
              <div style={s.camBox}>
                <video ref={videoRef} autoPlay playsInline muted style={s.video} />
                {!active && (
                  <div style={s.camPlaceholder}>
                    <span style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>📷</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Activa la cámara</p>
                  </div>
                )}
                {active && (
                  <div style={{ ...s.handBadge, background: handVisible ? 'rgba(134,239,172,0.9)' : 'rgba(252,165,165,0.9)' }}>
                    {handVisible ? '✋ Mano detectada' : '❌ Sin mano'}
                  </div>
                )}
                {mode === 'practice' && active && detected && result === 'none' && (
                  <div style={s.aiBadge}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>
                      IA: {SIGNS.find(sg => sg.id === detected.label)?.label}
                    </span>
                    <span style={{ fontSize: 11, opacity: 0.85, marginLeft: 6 }}>({detected.conf}%)</span>
                  </div>
                )}
                {result !== 'none' && (
                  <div style={{ ...s.resultOverlay, background: result === 'correct' ? 'rgba(22,163,74,0.88)' : 'rgba(220,38,38,0.88)' }}>
                    <div style={{ fontSize: 48 }}>{result === 'correct' ? '✅' : '❌'}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 8 }}>
                      {result === 'correct' ? '¡Correcto! +1 punto' : '¡Inténtalo de nuevo!'}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                {!active
                  ? <button style={s.btnCam} onClick={startCamera}>📷 Activar Cámara</button>
                  : <button style={{ ...s.btnCam, background: '#fca5a5', color: '#7f1d1d', boxShadow: '0 4px 0 #dc2626' }} onClick={stopCamera}>⏹ Detener</button>
                }
                {mode === 'practice' && active && result === 'none' && (
                  <button style={{ ...s.btnCam, background: '#86efac', color: '#14532d', boxShadow: '0 4px 0 #16a34a', opacity: checked ? 0.5 : 1 }}
                    onClick={checkSign} disabled={checked}>
                    🔍 Verificar letra
                  </button>
                )}
              </div>

              {mode === 'practice' && result === 'incorrect' && (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                  <button style={{ ...s.btnCam, background: '#c4b5fd', color: '#4c1d95', boxShadow: '0 4px 0 #7c3aed' }}
                    onClick={retrySign}>
                    🔄 Intentar de nuevo
                  </button>
                  <button style={{ ...s.btnCam, background: '#fcd34d', color: '#78350f', boxShadow: '0 4px 0 #d97706' }}
                    onClick={nextSign}>
                    Saltar letra →
                  </button>
                </div>
              )}
              {mode === 'practice' && result === 'correct' && (
                <button style={{ ...s.btnCam, background: '#fcd34d', color: '#78350f', boxShadow: '0 4px 0 #d97706', display: 'block', margin: '10px auto 0' }}
                  onClick={nextSign}>
                  Siguiente letra →
                </button>
              )}

              {status && (
                <div style={{ ...s.statusBox, background: 'rgba(196,181,253,0.15)', borderColor: '#c4b5fd' }}>
                  {status}
                </div>
              )}

              {mode === 'train' && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
                    Progreso de "{sign.label}": {trainCount[sign.id] || 0}/{TARGET_SAMPLES}
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, ((trainCount[sign.id] || 0) / TARGET_SAMPLES) * 100)}%`, background: '#c4b5fd', borderRadius: 10 }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={s.tip}>
        💡 Recorre el abecedario en orden (A → Z) para entrenar cada letra de forma completa.
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title:         { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(22px,4vw,36px)', color: '#fff', textAlign: 'center', marginBottom: 6 },
  sub:           { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16 },
  serverError:   { maxWidth: 600, margin: '0 auto 16px', background: 'rgba(252,165,165,0.15)', border: '2px solid #fca5a5', borderRadius: 12, padding: '12px 16px', color: '#fca5a5', fontSize: 13, fontWeight: 700, textAlign: 'center' },
  modeTabs:      { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 },
  modeTab:       { fontFamily: "'Fredoka One',cursive", fontSize: 16, padding: '9px 22px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' },
  modeActive:    { background: '#7c3aed', borderColor: '#7c3aed', boxShadow: '0 4px 0 #4c1d95' },
  statsRow:      { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' },
  pill:          { background: 'rgba(196,181,253,0.2)', color: '#c4b5fd', fontWeight: 800, fontSize: 13, padding: '5px 14px', borderRadius: 20 },
  clearBtn:      { background: 'rgba(252,165,165,0.15)', color: '#fca5a5', fontWeight: 800, fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(252,165,165,0.3)', cursor: 'pointer' },
  signTabs:      { display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' },
  letterTab:     { fontFamily: "'Fredoka One',cursive", fontSize: 13, padding: '6px 10px', minWidth: 34, borderRadius: 10, border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', cursor: 'pointer' },
  signTabActive: { background: '#c4b5fd', color: '#4c1d95', borderColor: '#c4b5fd' },
  letterHintBox: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(196,181,253,0.08))' },
  letterFallback: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(196,181,253,0.08)' },
  progressBarBox:   { maxWidth: 500, margin: '0 auto 20px', textAlign: 'center' },
  progressBarLabel: { color: '#fff', fontFamily: "'Fredoka One',cursive", fontSize: 16, marginBottom: 8 },
  progressBarTrack: { width: '100%', height: 22, background: 'rgba(255,255,255,0.12)', borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)' },
  progressBarFill:  { height: '100%', background: 'linear-gradient(90deg, #86efac, #4ade80)', borderRadius: 20, transition: 'width 0.4s ease' },
  checklistBox:  { maxWidth: 900, margin: '0 auto 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px', border: '1.5px solid rgba(255,255,255,0.1)' },
  checklistGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 6 },
  checkItem:     { borderRadius: 10, border: '1.5px solid', padding: '6px 4px', textAlign: 'center' },
  mainPanel:     { display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  col:           { flex: 1, minWidth: 280, maxWidth: 400 },
  colLabel:      { color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: 12, marginBottom: 8, textAlign: 'center' },
  gifBox:        { borderRadius: 18, border: '2px solid #a78bfa', overflow: 'hidden', aspectRatio: '1', background: '#000' },
  gifImg:        { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  signNameBox:   { background: 'rgba(196,181,253,0.15)', borderRadius: 12, padding: '8px', textAlign: 'center', marginTop: 10, border: '1.5px solid rgba(196,181,253,0.3)' },
  signName:      { fontFamily: "'Fredoka One',cursive", fontSize: 20, color: '#c4b5fd' },
  navBtn:        { fontFamily: "'Fredoka One',cursive", fontSize: 13, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer' },
  camBox:        { borderRadius: 18, border: '2px solid #a78bfa', overflow: 'hidden', aspectRatio: '4/3', background: '#0d0d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  video:         { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', position: 'absolute', top: 0, left: 0 },
  camPlaceholder: { textAlign: 'center', padding: 20, zIndex: 2 },
  handBadge:     { position: 'absolute', top: 8, left: 8, borderRadius: 10, padding: '4px 10px', color: '#fff', fontSize: 12, fontWeight: 800, zIndex: 3 },
  aiBadge:       { position: 'absolute', bottom: 8, left: 8, right: 8, background: 'rgba(124,58,237,0.88)', borderRadius: 10, padding: '6px 12px', color: '#fff', textAlign: 'center', zIndex: 3 },
  resultOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', zIndex: 4, backdropFilter: 'blur(3px)' },
  btnCam:        { fontFamily: "'Fredoka One',cursive", fontSize: 15, background: '#c4b5fd', color: '#4c1d95', border: 'none', borderRadius: 50, padding: '10px 20px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed' },
  btnMain:       { fontFamily: "'Fredoka One',cursive", fontSize: 18, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 50, padding: '12px 28px', cursor: 'pointer', boxShadow: '0 4px 0 #4c1d95' },
  statusBox:     { marginTop: 10, padding: '8px 12px', borderRadius: 10, border: '1.5px solid', fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' },
  infoBox:       { background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.1)' },
  tip:           { background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 18px', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textAlign: 'center', maxWidth: 700, margin: '20px auto 0', border: '2px dashed rgba(255,255,255,0.1)' },
};
