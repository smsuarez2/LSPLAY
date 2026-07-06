import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LOGO from '../assets/logo.png';

const API = 'https://lsplay-backend-production.up.railway.app';

const floaters = [
  { icon: 'fluent-emoji-flat:waving-hand',              left: '6%',  top: '12%', size: 52, delay: '0s',    dur: '5s'  },
  { icon: 'fluent-emoji-flat:victory-hand',             left: '85%', top: '8%',  size: 44, delay: '0.7s',  dur: '4.5s'},
  { icon: 'fluent-emoji-flat:love-you-gesture',         left: '4%',  top: '62%', size: 56, delay: '1.2s',  dur: '6s'  },
  { icon: 'fluent-emoji-flat:thumbs-up',                left: '88%', top: '58%', size: 46, delay: '0.3s',  dur: '5.5s'},
  { icon: 'fluent-emoji-flat:ok-hand',                  left: '78%', top: '30%', size: 38, delay: '1.8s',  dur: '4.8s'},
  { icon: 'fluent-emoji-flat:raised-fist',              left: '18%', top: '80%', size: 40, delay: '0.9s',  dur: '5.2s'},
];

export default function Register() {
  const navigate = useNavigate();
  const [nombre,    setNombre]    = useState('');
  const [correo,    setCorreo]    = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No se pudo completar el registro.');
        setLoading(false);
        return;
      }

      setSuccess('¡Cuenta creada! Redirigiendo a inicio de sesión...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0)    rotate(0deg);  }
          40%      { transform: translateY(-14px) rotate(6deg);  }
          70%      { transform: translateY(-7px)  rotate(-3deg); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        .rg-input {
          width:100%; padding:13px 16px; font-size:15px;
          font-family:'Nunito',sans-serif; font-weight:700; color:#3d2c6e;
          background:#faf7ff; border:2.5px solid #e8e0f5; border-radius:14px;
          outline:none; box-sizing:border-box;
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .rg-input:focus {
          border-color:#7c3aed;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.12);
          background:#fff;
        }
        .rg-input::placeholder { color:#c4b5fd; font-weight:600; }
        .rg-btn {
          font-family:'Fredoka One',cursive; font-size:21px;
          background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);
          color:#fff; border:none; border-radius:50px; padding:16px 32px;
          cursor:pointer; box-shadow:0 6px 0 #4c1d95; width:100%;
          transition:transform .13s, box-shadow .13s;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .rg-btn:hover:not(:disabled)  { transform:translateY(-3px); box-shadow:0 9px 0 #4c1d95; }
        .rg-btn:active:not(:disabled) { transform:translateY(2px);  box-shadow:0 3px 0 #4c1d95; }
        .rg-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .rg-eye { background:none; border:none; cursor:pointer; padding:4px;
                  display:flex; align-items:center; transition:opacity .15s; }
        .rg-eye:hover { opacity:.7; }
        .rg-login:hover { text-decoration:underline; }
      `}</style>

      <div style={s.page}>
        {floaters.map((f, i) => (
          <span key={i} style={{
            position:'absolute', left:f.left, top:f.top, zIndex:0, opacity:.14,
            animation:`float ${f.dur} ease-in-out infinite`, animationDelay:f.delay,
            pointerEvents:'none', display:'block',
          }}>
            <Icon icon={f.icon} width={f.size} />
          </span>
        ))}

        <div style={s.card}>
          <img src={LOGO} alt="LS Play" style={s.logo} />

          <div style={s.chip}>
            <Icon icon="fluent-emoji-flat:party-popper" width={16} />
            ¡Únete gratis!
          </div>

          <h1 style={s.title}>Crea tu cuenta</h1>
          <p style={s.sub}>Empieza a aprender lengua de señas hoy</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:bust-in-silhouette" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Nombre
              </label>
              <input
                className="rg-input"
                type="text"
                value={nombre}
                onChange={e => { setNombre(e.target.value); setError(''); }}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:e-mail" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Correo electrónico
              </label>
              <input
                className="rg-input"
                type="email"
                value={correo}
                onChange={e => { setCorreo(e.target.value); setError(''); }}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:locked" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Contraseña
              </label>
              <div style={{ position:'relative' }}>
                <input
                  className="rg-input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Mínimo 6 caracteres"
                  style={{ paddingRight:48 }}
                  required
                />
                <button className="rg-eye" type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
                  <Icon icon={showPass ? 'fluent-emoji-flat:eyes' : 'fluent-emoji-flat:locked-with-key'} width={20} />
                </button>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:locked" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Confirmar contraseña
              </label>
              <input
                className="rg-input"
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            {error && (
              <div style={s.errorBox}>
                <Icon icon="fluent-emoji-flat:warning" width={16} style={{verticalAlign:'middle',marginRight:6}} />
                {error}
              </div>
            )}
            {success && (
              <div style={s.successBox}>
                <Icon icon="fluent-emoji-flat:check-mark-button" width={16} style={{verticalAlign:'middle',marginRight:6}} />
                {success}
              </div>
            )}

            <button type="submit" className="rg-btn" disabled={loading}>
              {loading ? 'Creando cuenta...' : '¡Registrarme!'}
            </button>
          </form>

          <p style={s.loginText}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="rg-login" style={s.loginLink}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:     {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #ede9fb 0%, #fce7f3 55%, #dbeafe 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', position: 'relative', overflow: 'hidden',
  },
  card:     {
    background: '#fff',
    borderRadius: 28,
    border: '2px solid #ede9fb',
    boxShadow: '0 24px 64px rgba(124,58,237,0.13), 0 4px 16px rgba(124,58,237,0.07)',
    padding: '40px 40px 36px',
    width: '100%', maxWidth: 420,
    position: 'relative', zIndex: 1, textAlign: 'center',
    animation: 'cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
    overflow: 'hidden',
  },
  logo:     {
    height: 72, width: 'auto', objectFit: 'contain',
    display: 'block', margin: '0 auto 14px',
    filter: 'drop-shadow(0 4px 14px rgba(124,58,237,0.22))',
  },
  chip:     {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'linear-gradient(135deg,#ede9fb,#fce7f3)',
    color: '#5b21b6', fontWeight: 800, fontSize: 13,
    padding: '6px 16px', borderRadius: 20, marginBottom: 14,
    border: '1.5px solid #c4b5fd',
  },
  title:    { fontFamily:"'Fredoka One',cursive", fontSize:'clamp(28px,5vw,36px)', color:'#3d2c6e', marginBottom:6, lineHeight:1.1 },
  sub:      { fontSize:14, fontWeight:600, color:'#9e8ec0', marginBottom:22 },
  form:     { display:'flex', flexDirection:'column', gap:12, textAlign:'left' },
  field:    { display:'flex', flexDirection:'column', gap:6 },
  label:    { fontSize:13, fontWeight:800, color:'#5b21b6' },
  loginText:{ fontSize:13, fontWeight:700, color:'#9e8ec0', marginTop:20 },
  loginLink:{ color:'#7c3aed', fontWeight:800, textDecoration:'none' },
  errorBox: { background:'rgba(252,165,165,0.15)', border:'2px solid #fca5a5', borderRadius:12, padding:'10px 14px', color:'#7f1d1d', fontWeight:700, fontSize:13 },
  successBox: { background:'rgba(134,239,172,0.15)', border:'2px solid #86efac', borderRadius:12, padding:'10px 14px', color:'#14532d', fontWeight:700, fontSize:13 },
};
