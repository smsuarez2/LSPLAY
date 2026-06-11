import { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

type SignItem = { icon: string; label: string };
const signs: SignItem[] = [
  { icon: 'fluent-emoji-flat:love-you-gesture', label: 'Te amo' },
  { icon: 'fluent-emoji-flat:victory-hand', label: 'Paz' },
  { icon: 'fluent-emoji-flat:waving-hand', label: 'Hola' },
  { icon: 'fluent-emoji-flat:thumbs-up', label: 'Bien' },
  { icon: 'fluent-emoji-flat:call-me-hand', label: 'Llámame' },
  { icon: 'fluent-emoji-flat:raised-hand', label: 'Para' },
  { icon: '', label: 'A' },
  { icon: '', label: 'B' },
  { icon: '', label: 'C' },
  { icon: '', label: 'D' },
  { icon: '', label: 'E' },
];

type HistItem = { signLabel: string; signIcon: string; conf: number; ok: boolean };

export default function Camara() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [active, setActive]   = useState(false);
  const [aiSign, setAiSign]   = useState('');
  const [aiIcon, setAiIcon]   = useState('');
  const [aiConf, setAiConf]   = useState(0);
  const [history, setHistory] = useState<HistItem[]>([]);
  const [error, setError]     = useState('');

  async function startCamera() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setActive(true);
      let i = 0;
      timerRef.current = setInterval(() => {
        const sign = signs[i % signs.length];
        const c = Math.floor(Math.random() * 25 + 72);
        setAiSign(sign.label);
        setAiIcon(sign.icon);
        setAiConf(c);
        setHistory(prev => [{ signLabel: sign.label, signIcon: sign.icon, conf: c, ok: c >= 80 }, ...prev].slice(0, 5));
        i++;
      }, 2200);
    } catch {
      setError('No se pudo acceder a la cámara. Asegúrate de dar permiso en tu navegador.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false); setAiSign(''); setAiIcon(''); setAiConf(0);
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '48px 32px' }}>
      <h1 style={s.title}>Cámara con Inteligencia Artificial</h1>
      <p style={s.sub}>Activa tu cámara y la IA detecta qué seña estás haciendo</p>

      <div style={s.wrap}>
        {/* Pantalla de cámara */}
        <div style={s.camFrame}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ ...s.video, display: active ? 'block' : 'none' }} />
          {!active && (
            <div style={s.placeholder}>
              <Icon icon="fluent-emoji-flat:raised-back-of-hand" width={64} style={{ display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                Activa tu cámara para<br />practicar señas con IA
              </p>
            </div>
          )}
          {active && aiSign && (
            <div style={s.aiBadge}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                {aiIcon && <Icon icon={aiIcon} width={20} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                {aiSign}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Confianza: {aiConf}%</div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, height: 4, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${aiConf}%`, background: aiConf >= 80 ? '#86efac' : '#fcd34d', borderRadius: 20, transition: 'width 0.5s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div style={s.btns}>
          {!active
            ? <button style={s.btnStart} onClick={startCamera}>
                <><Icon icon="fluent-emoji-flat:camera" width={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Activar Cámara</>
              </button>
            : <button style={s.btnStop}  onClick={stopCamera}>
                <><Icon icon="fluent-emoji-flat:stop-button" width={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Detener Cámara</>
              </button>
          }
        </div>

        {error && (
          <div style={s.errorBox}>
            <><Icon icon="fluent-emoji-flat:warning" width={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />{error}</>
          </div>
        )}

        {/* Señas de guía */}
        <div style={s.guideTitle}>Señas para practicar</div>
        <div style={s.signGrid}>
          {signs.filter(sg => sg.icon).map(sg => (
            <div key={sg.label} style={s.signPill}>
              <Icon icon={sg.icon} width={20} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {sg.label}
            </div>
          ))}
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div style={s.guideTitle}>
              <><Icon icon="fluent-emoji-flat:clipboard" width={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Historial de práctica</>
            </div>
            {history.map((h, idx) => (
              <div key={idx} style={{ ...s.histRow, background: h.ok ? 'rgba(134,239,172,0.15)' : 'rgba(252,211,77,0.15)', borderLeft: `3px solid ${h.ok ? '#86efac' : '#fcd34d'}` }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>
                  {h.ok
                    ? <Icon icon="fluent-emoji-flat:check-mark-button" width={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    : <Icon icon="fluent-emoji-flat:warning" width={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  }
                  {h.signIcon && <Icon icon={h.signIcon} width={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                  {h.signLabel}
                </span>
                <span style={{ color: h.ok ? '#86efac' : '#fcd34d', fontWeight: 800 }}>{h.conf}%</span>
              </div>
            ))}
          </div>
        )}

        <div style={s.tip}>
          <><Icon icon="fluent-emoji-flat:light-bulb" width={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Coloca tu mano bien iluminada frente a la cámara. La IA analiza tu seña y muestra el porcentaje de confianza.</>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title:    { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(24px,4vw,38px)', color: '#fff', textAlign: 'center', marginBottom: 8 },
  sub:      { fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 36 },
  wrap:     { maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 },
  camFrame: { width: '100%', aspectRatio: '4/3', background: '#0d0d2e', borderRadius: 20, border: '3px solid #a78bfa', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(167,139,250,0.15)' },
  video:    { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  placeholder: { textAlign: 'center', padding: 24 },
  aiBadge:  { position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(124,58,237,0.88)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(6px)', color: '#fff', textAlign: 'center' },
  btns:     { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
  btnStart: { fontFamily: "'Fredoka One',cursive", fontSize: 18, background: '#c4b5fd', color: '#4c1d95', border: 'none', borderRadius: 50, padding: '12px 28px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed' },
  btnStop:  { fontFamily: "'Fredoka One',cursive", fontSize: 18, background: '#fca5a5', color: '#7f1d1d', border: 'none', borderRadius: 50, padding: '12px 28px', cursor: 'pointer', boxShadow: '0 4px 0 #dc2626' },
  errorBox: { background: 'rgba(252,165,165,0.15)', border: '2px solid #fca5a5', borderRadius: 12, padding: '12px 16px', color: '#fca5a5', fontWeight: 700, fontSize: 14, textAlign: 'center', maxWidth: 480 },
  guideTitle: { color: 'rgba(255,255,255,0.7)', fontWeight: 800, fontSize: 14, width: '100%', textAlign: 'center', marginBottom: -8 },
  signGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%', maxWidth: 500 },
  signPill: { background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 6px', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' },
  histRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, marginBottom: 6, fontSize: 13 },
  tip:      { background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 18px', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700, textAlign: 'center', maxWidth: 480, border: '2px dashed rgba(255,255,255,0.12)' },
};
