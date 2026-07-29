import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const API_AUTH = 'https://lsplay-backend-production.up.railway.app';

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  xp: number;
  nivel: number;
};

type Logro = { key: string; emoji: string; title: string; desc: string; earned: boolean };
type Actividad = { text: string; xp: number; fecha: string; icon: string; color: string; textColor: string };

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [checking, setChecking] = useState(true);
  const [badges, setBadges] = useState<Logro[]>([]);
  const [history, setHistory] = useState<Actividad[]>([]);
  const [statTotals, setStatTotals] = useState({ letras: 0, practicas: 0, juegos: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!token || !usuarioGuardado) {
      navigate('/login');
      return;
    }

    try {
      setUsuario(JSON.parse(usuarioGuardado));
    } catch {
      navigate('/login');
      return;
    }
    setChecking(false);
  }, [navigate]);

  useEffect(() => {
    async function cargarProgreso() {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');
      if (!token || !usuarioGuardado) return;
      const u = JSON.parse(usuarioGuardado);
      try {
        const res = await fetch(`${API_AUTH}/api/progreso/${u.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBadges(data.logros || []);
        setHistory(data.actividad || []);
        setStatTotals({
          letras: data.totalLetras ?? 0,
          practicas: data.totalPracticas ?? 0,
          juegos: data.totalJuegos ?? 0,
        });
      } catch {
        // si falla, se queda vacío en vez de mostrar datos falsos
      }
    }
    cargarProgreso();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  // Mientras se verifica la sesión, no mostramos nada (evita el parpadeo de datos falsos)
  if (checking || !usuario) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7ff' }}>
        <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#9e8ec0' }}>Cargando...</p>
      </div>
    );
  }

  // --- FIX progreso de nivel ---
  // Antes: nextXP estaba fijo en 500 y la barra usaba el XP TOTAL acumulado (960),
  // por eso se veía llena/desbordada y no coincidía con el nivel real.
  // Regla real del backend: nivel = FLOOR(xp / 100) + 1  →  cada nivel cuesta 100 XP.
  const XP_POR_NIVEL = 100; // debe coincidir siempre con la regla del backend
  const totalXP      = usuario.xp ?? 0;
  const nivelActual  = usuario.nivel ?? (Math.floor(totalXP / XP_POR_NIVEL) + 1);
  const xpEnNivel     = totalXP % XP_POR_NIVEL; // XP ganado dentro del nivel actual (ej: 960 % 100 = 60)
  const nextXP        = XP_POR_NIVEL;            // XP necesario para subir de nivel (100, no 500)
  const pct           = Math.round((xpEnNivel / nextXP) * 100);
  const earnedCount   = badges.filter(b => b.earned).length;
  const inicial       = usuario.nombre?.charAt(0).toUpperCase() || '?';

  return (
    <div style={{ minHeight: '100vh', background: '#faf7ff', padding: '40px 32px' }}>
      <div style={s.topBar}>
        <h1 style={s.title}>Mi Perfil</h1>
        <button style={s.logoutBtn} onClick={handleLogout}>
          <Icon icon="fluent-emoji-flat:door" width={18} style={{verticalAlign:'middle'}} />
          Cerrar sesión
        </button>
      </div>
      <p style={s.sub}>Tu progreso y logros ganados</p>

      <div style={s.inner}>
        {/* Header perfil */}
        <div style={s.header}>
          <div style={s.avatar}>{inicial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: '#3d2c6e' }}>¡Hola, {usuario.nombre}!</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginTop: 2 }}>{usuario.correo}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#9e8ec0', marginTop: 4 }}>Nivel {nivelActual} · {totalXP} XP · ¡Sigue jugando para subir de nivel!</div>
            <div style={{ marginTop: 10, maxWidth: 280 }}>
              <div className="prog-bar-outer">
                <div className="prog-bar-inner" style={{ width: `${pct}%` }} />
              </div>
              <p style={{ fontSize: 12, color: '#9e8ec0', fontWeight: 700, marginTop: 4 }}>{xpEnNivel} / {nextXP} XP para el siguiente nivel</p>
            </div>
          </div>
          <div style={s.statBox}>
            <div style={s.statItem}><span style={s.statN}>{earnedCount}</span><span style={s.statL}>Logros</span></div>
            <div style={s.statItem}><span style={s.statN}>{statTotals.letras}</span><span style={s.statL}>Señas</span></div>
            <div style={s.statItem}><span style={s.statN}>{statTotals.juegos}</span><span style={s.statL}>Juegos</span></div>
          </div>
        </div>

        {/* Logros */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}><><Icon icon="fluent-emoji-flat:sports-medal" width={24} style={{verticalAlign:'middle',marginRight:6}} />Mis Logros</> <span style={s.countBadge}>{earnedCount} / {badges.length}</span></h2>
          <div style={s.badgesGrid}>
            {badges.map(b => (
              <div key={b.key} style={{ ...s.badge, ...(b.earned ? s.badgeEarned : s.badgeLocked) }}>
                <Icon icon={b.earned ? b.emoji : 'fluent-emoji-flat:locked'} width={38} style={{ display: 'block', margin: '0 auto 8px' }} />
                <h4 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: b.earned ? '#3d2c6e' : '#9e8ec0', marginBottom: 4 }}>{b.title}</h4>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9e8ec0', lineHeight: 1.4 }}>{b.desc}</p>
                {b.earned && <span style={s.earnedTag}>Ganado</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Historial */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}><><Icon icon="fluent-emoji-flat:clipboard" width={24} style={{verticalAlign:'middle',marginRight:6}} />Actividad reciente</></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 14, padding: '12px 16px', border: '2px solid #e8e0f5' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2c6e' }}><><Icon icon={h.icon} width={18} style={{verticalAlign:'middle',marginRight:6}} />{h.text}</></span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, padding: '4px 12px', borderRadius: 20, background: h.color, color: h.textColor }}>+{h.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  topBar:    { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 8 },
  title:     { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(28px,4vw,42px)', color: '#3d2c6e', textAlign: 'center' },
  logoutBtn: { position: 'absolute', right: 0, fontFamily: "'Fredoka One',cursive", fontSize: 15, background: '#fff', color: '#7c3aed', border: '2px solid #c4b5fd', borderRadius: 50, padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 3px 0 #e8e0f5', transition: 'all .15s' },
  sub:       { fontSize: 16, fontWeight: 600, color: '#9e8ec0', textAlign: 'center', marginBottom: 32 },
  inner:     { maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 },
  header:    { display: 'flex', alignItems: 'center', gap: 20, background: 'linear-gradient(135deg,#f3edfc,#fce7f3)', borderRadius: 20, padding: '24px 28px', border: '2px solid #e8e0f5', flexWrap: 'wrap' },
  avatar:    { width: 72, height: 72, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One',cursive", fontSize: 28, color: '#fff', boxShadow: '0 4px 0 #4c1d95', flexShrink: 0 },
  statBox:   { display: 'flex', gap: 16 },
  statItem:  { textAlign: 'center', background: '#fff', borderRadius: 12, padding: '10px 14px', border: '2px solid #e8e0f5' },
  statN:     { fontFamily: "'Fredoka One',cursive", fontSize: 24, color: '#7c3aed', display: 'block' },
  statL:     { fontSize: 11, fontWeight: 800, color: '#9e8ec0' },
  section:   { background: '#fff', borderRadius: 20, padding: '24px', border: '2px solid #e8e0f5' },
  sectionTitle: { fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#3d2c6e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 },
  countBadge:   { fontSize: 14, background: '#ede9fb', color: '#5b21b6', padding: '3px 10px', borderRadius: 20 },
  badgesGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14 },
  badge:     { borderRadius: 16, padding: '16px 12px', textAlign: 'center', border: '2px solid', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  badgeEarned:  { background: '#faf7ff', borderColor: '#c4b5fd' },
  badgeLocked:  { background: '#f9f9f9', borderColor: '#e8e0f5', opacity: 0.5 },
  earnedTag:    { display: 'inline-block', marginTop: 'auto', paddingTop: 6, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12, background: '#dcfce7', color: '#14532d' },
};
