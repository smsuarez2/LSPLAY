import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LOGO from '../assets/logo.png';
import { Icon } from '@iconify/react';

const activities = [
  { to: '/aprender', emoji: 'fluent-emoji-flat:open-book',          title: 'Aprender',    desc: 'Conoce cada seña del abecedario con imágenes y guías visuales.',    tag: '¡Nuevo!',  tagBg: '#ede9fb', tagColor: '#5b21b6', topColor: '#c4b5fd' },
  { to: '/jugar',    emoji: 'fluent-emoji-flat:joker',              title: 'Memoria',     desc: 'Empareja la imagen de la seña con su letra correcta.',               tag: 'Popular',  tagBg: '#dcfce7', tagColor: '#14532d', topColor: '#86efac' },
  { to: '/jugar',    emoji: 'fluent-emoji-flat:red-question-mark',  title: '¿Cuál seña?', desc: 'Ve la imagen y elige la respuesta correcta entre 4 opciones.',       tag: 'Divertido',tagBg: '#fef3c7', tagColor: '#78350f', topColor: '#fcd34d' },
  { to: '/perfil',   emoji: 'fluent-emoji-flat:trophy',             title: 'Logros',      desc: 'Mira todas tus medallas y estrellas ganadas. ¡Colecciónalas!',      tag: 'Premios',  tagBg: '#cffafe', tagColor: '#164e63', topColor: '#a5f3fc' },
];

const steps = [
  { num: '1', title: 'Aprende la seña',     desc: 'Mira la imagen y guía de cada seña nueva.',                              bg: '#c4b5fd', color: '#4c1d95', shadow: '#7c3aed' },
  { num: '2', title: 'Practica con la IA',  desc: 'Activa la cámara e imita la seña. La IA te dice si lo hiciste bien.',    bg: '#86efac', color: '#14532d', shadow: '#16a34a' },
  { num: '3', title: '¡Gana estrellas!',    desc: 'Completa niveles y desbloquea logros especiales.',                       bg: '#fcd34d', color: '#78350f', shadow: '#d97706' },
];

// Datos reales del proyecto (nada de cifras de uso inventadas)
const highlights = [
  { icon: 'fluent-emoji-flat:abc',                 label: '30 Letras del abecedario' },
  { icon: 'fluent-emoji-flat:robot',                label: 'Detección con IA en tiempo real' },
  { icon: 'fluent-emoji-flat:camera-with-flash',    label: 'Funciona con tu cámara' },
  { icon: 'fluent-emoji-flat:money-bag',            label: '100% gratuito' },
];

export default function Home() {
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = 26;
    const el = counterRef.current;
    if (!el) return;
    let n = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = String(n);
      if (n >= target) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroText}>
            <h1 style={s.title}>
              <span style={{ color: '#6d28d9' }}>¡Aprende</span>{' '}
              <span style={{ color: '#db2777' }}>Lenguaje de</span>{' '}
              <span style={{ color: '#0369a1' }}>Señas jugando!</span>
            </h1>
            <p style={s.sub}>
              Practica el abecedario con imágenes, juega y gana estrellas. Tu cámara detecta las señas con IA.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/aprender" style={s.btnMain}>¡Empezar ahora!</Link>
              <Link to="/camara"   style={s.btnSec}><><Icon icon="fluent-emoji-flat:camera" width={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Probar cámara</></Link>
            </div>
          </div>
          <img src={LOGO} alt="LS Play" style={s.heroLogo} />
        </div>
      </section>

      {/* HIGHLIGHTS (datos reales del proyecto, no estadisticas de uso) */}
      <div style={s.stats}>
        <div style={s.stat}>
          <span style={s.statN} ref={counterRef}>0</span>
          <span style={s.statL}>Letras del abecedario</span>
        </div>
        {highlights.slice(1).map(h => (
          <div key={h.label} style={s.statBadge}>
            <Icon icon={h.icon} width={26} />
            <span style={s.statBadgeL}>{h.label}</span>
          </div>
        ))}
      </div>

      {/* PROGRESO */}
      <div style={s.progSection}>
        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#5b21b6' }}>Tu progreso </span>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }}>
          <div className="prog-bar-outer">
            <div className="prog-bar-inner" style={{ width: '12%' }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#9e8ec0', marginTop: 5 }}>60 / 500 XP — Nivel 1 · ¡Sigue así! </p>
        </div>
      </div>

      {/* ACTIVIDADES */}
      <section style={{ padding: '56px 32px', background: '#faf7ff' }} id="actividades">
        <h2 style={s.secTitle}>¿Qué quieres aprender hoy? </h2>
        <p style={s.secSub}>Elige tu actividad y empieza a jugar</p>
        <div style={s.grid}>
          {activities.map(a => (
            <Link key={a.title} to={a.to} style={{ textDecoration: 'none', display: 'flex' }}>
              <div style={{ ...s.actCard, borderTop: `5px solid ${a.topColor}` }}
                   onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-8px)')}
                   onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <Icon icon={a.emoji} width={52} style={{ display: 'block', margin: '0 auto 14px' }} />
                <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 24, marginBottom: 8, color: '#3d2c6e' }}>{a.title}</h3>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#9e8ec0', lineHeight: 1.5 }}>{a.desc}</p>
                <span style={{ display: 'block', width: '100%', marginTop: 'auto', paddingTop: 14, fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 20, background: a.tagBg, color: a.tagColor, textAlign: 'center' }}>{a.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{ padding: '56px 32px', background: '#fff', borderTop: '2px solid #e8e0f5' }}>
        <h2 style={s.secTitle}>¿Cómo jugar?</h2>
        <p style={s.secSub}>Solo 3 pasos para aprender a comunicarte con señas</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 28, maxWidth: 800, margin: '0 auto' }}>
          {steps.map(st => (
            <div key={st.num} style={{ flex: 1, minWidth: 160, maxWidth: 200, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One',cursive", fontSize: 24, color: st.color, margin: '0 auto 14px', boxShadow: `0 4px 0 ${st.shadow}` }}>{st.num}</div>
              <h4 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, marginBottom: 6, color: '#3d2c6e' }}>{st.title}</h4>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#9e8ec0', lineHeight: 1.5 }}>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  hero:      { minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 32px', background: 'linear-gradient(160deg,#f3edfc 0%,#fce7f3 50%,#e0f2fe 100%)', position: 'relative' },
  heroInner: { maxWidth: 1000, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', animation: 'popIn 0.5s ease' },
  heroText:  { flex: 1, minWidth: 280 },
  badge:     { display: 'inline-block', background: '#ede9fb', color: '#5b21b6', fontWeight: 800, fontSize: 13, padding: '6px 16px', borderRadius: 20, marginBottom: 18 },
  title:     { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(36px,5vw,62px)', lineHeight: 1.15, marginBottom: 16 },
  sub:       { fontSize: 17, fontWeight: 600, color: '#6b5a9e', marginBottom: 28, lineHeight: 1.6 },
  btnMain:   { fontFamily: "'Fredoka One',cursive", background: '#7c3aed', color: '#fff', borderRadius: 50, padding: '14px 32px', fontSize: 20, boxShadow: '0 5px 0 #4c1d95', textDecoration: 'none', display: 'inline-block', border: 'none', cursor: 'pointer' },
  btnSec:    { fontFamily: "'Fredoka One',cursive", background: '#fff', color: '#7c3aed', border: '2px solid #c4b5fd', borderRadius: 50, padding: '12px 28px', fontSize: 20, boxShadow: '0 5px 0 #e8e0f5', textDecoration: 'none', display: 'inline-block', cursor: 'pointer' },
  heroLogo:  { width: 'min(280px,40vw)', height: 'auto', filter: 'drop-shadow(0 12px 32px rgba(109,40,217,0.2))', animation: 'float 3s ease-in-out infinite' },
  stats:     { background: '#7c3aed', padding: '20px 32px', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', alignItems: 'center' },
  stat:      { textAlign: 'center', color: '#fff' },
  statN:     { fontFamily: "'Fredoka One',cursive", fontSize: 34, color: '#fcd34d', display: 'block' },
  statL:     { fontSize: 12, fontWeight: 800, opacity: 0.85 },
  statBadge:  { display: 'flex', alignItems: 'center', gap: 8, color: '#fff' },
  statBadgeL: { fontSize: 12, fontWeight: 800, opacity: 0.9, maxWidth: 110, textAlign: 'left', lineHeight: 1.3 },
  progSection: { background: '#fff', padding: '28px 32px', borderBottom: '2px solid #e8e0f5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' },
  secTitle:  { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(26px,4vw,38px)', textAlign: 'center', marginBottom: 8, color: '#3d2c6e' },
  secSub:    { textAlign: 'center', fontSize: 16, fontWeight: 600, color: '#9e8ec0', marginBottom: 40 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, maxWidth: 940, margin: '0 auto', alignItems: 'stretch' },
  actCard:   { background: '#fff', borderRadius: 20, padding: '28px 20px', textAlign: 'center', border: '2px solid #e8e0f5', boxShadow: '0 4px 0 rgba(139,92,246,0.1)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', height: '100%' },
};
