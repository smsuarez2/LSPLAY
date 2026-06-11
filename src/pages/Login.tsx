import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LOGO from '../assets/logo.png';

const floaters = [
  { icon: 'fluent-emoji-flat:waving-hand',              left: '6%',  top: '12%', size: 52, delay: '0s',    dur: '5s'  },
  { icon: 'fluent-emoji-flat:victory-hand',             left: '85%', top: '8%',  size: 44, delay: '0.7s',  dur: '4.5s'},
  { icon: 'fluent-emoji-flat:love-you-gesture',         left: '4%',  top: '62%', size: 56, delay: '1.2s',  dur: '6s'  },
  { icon: 'fluent-emoji-flat:thumbs-up',                left: '88%', top: '58%', size: 46, delay: '0.3s',  dur: '5.5s'},
  { icon: 'fluent-emoji-flat:ok-hand',                  left: '78%', top: '30%', size: 38, delay: '1.8s',  dur: '4.8s'},
  { icon: 'fluent-emoji-flat:raised-fist',              left: '18%', top: '80%', size: 40, delay: '0.9s',  dur: '5.2s'},
  { icon: 'fluent-emoji-flat:call-me-hand',             left: '70%', top: '82%', size: 36, delay: '1.5s',  dur: '4.2s'},
  { icon: 'fluent-emoji-flat:crossed-fingers',          left: '45%', top: '4%',  size: 34, delay: '0.5s',  dur: '5.8s'},
];

export default function Login() {
  const navigate = useNavigate();
  const [user,     setUser]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user === 'admin' && password === 'admin') {
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos. Intenta con admin / admin');
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
        @keyframes badgeIn {
          from { opacity:0; transform:scale(0.8); }
          to   { opacity:1; transform:scale(1);   }
        }
        .lp-input {
          width:100%; padding:13px 16px; font-size:15px;
          font-family:'Nunito',sans-serif; font-weight:700; color:#3d2c6e;
          background:#faf7ff; border:2.5px solid #e8e0f5; border-radius:14px;
          outline:none; box-sizing:border-box;
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .lp-input:focus {
          border-color:#7c3aed;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.12);
          background:#fff;
        }
        .lp-input::placeholder { color:#c4b5fd; font-weight:600; }
        .lp-btn {
          font-family:'Fredoka One',cursive; font-size:21px;
          background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);
          color:#fff; border:none; border-radius:50px; padding:16px 32px;
          cursor:pointer; box-shadow:0 6px 0 #4c1d95; width:100%;
          transition:transform .13s, box-shadow .13s;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .lp-btn:hover  { transform:translateY(-3px); box-shadow:0 9px 0 #4c1d95; }
        .lp-btn:active { transform:translateY(2px);  box-shadow:0 3px 0 #4c1d95; }
        .lp-eye { background:none; border:none; cursor:pointer; padding:4px;
                  display:flex; align-items:center; transition:opacity .15s; }
        .lp-eye:hover { opacity:.7; }
        .lp-badge:hover { border-color:#c4b5fd; background:#f3edfc; transform:translateY(-2px); }
        .lp-forgot:hover { text-decoration:underline; }
        .lp-reg:hover { text-decoration:underline; }
      `}</style>

      <div style={s.page}>
        {/* Floating background icons */}
        {floaters.map((f, i) => (
          <span key={i} style={{
            position:'absolute', left:f.left, top:f.top, zIndex:0, opacity:.14,
            animation:`float ${f.dur} ease-in-out infinite`, animationDelay:f.delay,
            pointerEvents:'none', display:'block',
          }}>
            <Icon icon={f.icon} width={f.size} />
          </span>
        ))}

        {/* Card */}
        <div style={s.card}>

          {/* Logo */}
          <img src={LOGO} alt="LS Play" style={s.logo} />

          {/* Badge */}
          <div style={s.chip}>
            <Icon icon="fluent-emoji-flat:sparkles" width={16} />
            ¡Bienvenido de nuevo!
          </div>

          <h1 style={s.title}>Inicia sesión</h1>
          <p style={s.sub}>Continúa aprendiendo lengua de señas</p>

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Usuario */}
            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:bust-in-silhouette" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Usuario
              </label>
              <input
                className="lp-input"
                type="text"
                value={user}
                onChange={e => { setUser(e.target.value); setError(''); }}
                placeholder="admin"
                required
              />
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:locked" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Contraseña
              </label>
              <div style={{ position:'relative' }}>
                <input
                  className="lp-input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  style={{ paddingRight:48 }}
                  required
                />
                <button className="lp-eye" type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
                  <Icon icon={showPass ? 'fluent-emoji-flat:eyes' : 'fluent-emoji-flat:locked-with-key'} width={20} />
                </button>
              </div>
            </div>

            <div style={{ textAlign:'right', marginTop:-4 }}>
              <a href="#" className="lp-forgot" style={s.forgot}>¿Olvidaste tu contraseña?</a>
            </div>

            {error && (
              <div style={s.errorBox}>
                <Icon icon="fluent-emoji-flat:warning" width={16} style={{verticalAlign:'middle',marginRight:6}} />
                {error}
              </div>
            )}

            <button type="submit" className="lp-btn">
              ¡Entrar!
            </button>
          </form>

          {/* Register */}
          <p style={s.regText}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="lp-reg" style={s.regLink}>Regístrate gratis</Link>
          </p>

          {/* Divider */}
          <div style={s.divider}><span style={s.dividerText}>tu progreso te espera</span></div>

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
  topBar:   {
    height: 6,
    background: 'linear-gradient(90deg, #c4b5fd, #f9a8d4, #86efac, #fcd34d, #c4b5fd)',
    backgroundSize: '200% 100%',
    margin: '0 -40px 32px',
    borderRadius: '0 0 0 0',
  },
  logo:     {
    height: 84, width: 'auto', objectFit: 'contain',
    display: 'block', margin: '0 auto 16px',
    filter: 'drop-shadow(0 4px 14px rgba(124,58,237,0.22))',
  },
  chip:     {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'linear-gradient(135deg,#ede9fb,#fce7f3)',
    color: '#5b21b6', fontWeight: 800, fontSize: 13,
    padding: '6px 16px', borderRadius: 20, marginBottom: 14,
    border: '1.5px solid #c4b5fd',
  },
  title:    { fontFamily:"'Fredoka One',cursive", fontSize:'clamp(30px,5vw,40px)', color:'#3d2c6e', marginBottom:6, lineHeight:1.1 },
  sub:      { fontSize:14, fontWeight:600, color:'#9e8ec0', marginBottom:26 },
  form:     { display:'flex', flexDirection:'column', gap:14, textAlign:'left' },
  field:    { display:'flex', flexDirection:'column', gap:7 },
  label:    { fontSize:13, fontWeight:800, color:'#5b21b6' },
  forgot:   { fontSize:12, fontWeight:800, color:'#7c3aed', textDecoration:'none' },
  regText:  { fontSize:13, fontWeight:700, color:'#9e8ec0', marginTop:22, marginBottom:18 },
  regLink:  { color:'#7c3aed', fontWeight:800, textDecoration:'none' },
  divider:  { display:'flex', alignItems:'center', gap:10, margin:'0 0 18px' },
  dividerText: { fontSize:11, fontWeight:800, color:'#c4b5fd', whiteSpace:'nowrap', flex:1, textAlign:'center', position:'relative' as const },
  badges:   { display:'flex', gap:10 },
  badge:    {
    flex:1, background:'#faf7ff', border:'2px solid #e8e0f5',
    borderRadius:16, padding:'12px 8px', textAlign:'center',
    cursor:'default', transition:'all .2s',
    animation:'badgeIn 0.4s ease both',
  },
  badgeVal: { display:'block', fontFamily:"'Fredoka One',cursive", fontSize:20, color:'#7c3aed', lineHeight:1 },
  badgeLbl: { display:'block', fontSize:10, fontWeight:800, color:'#9e8ec0', marginTop:2 },
  errorBox: { background:'rgba(252,165,165,0.15)', border:'2px solid #fca5a5', borderRadius:12, padding:'10px 14px', color:'#7f1d1d', fontWeight:700, fontSize:13 },
};
