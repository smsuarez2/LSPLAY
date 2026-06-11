import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LOGO from '../assets/logo.png';

const floaters = [
  { icon: 'fluent-emoji-flat:star-struck',      left: '7%',  top: '10%', size: 48, delay: '0s',   dur: '5s'   },
  { icon: 'fluent-emoji-flat:sparkles',         left: '84%', top: '7%',  size: 42, delay: '0.6s', dur: '4.5s' },
  { icon: 'fluent-emoji-flat:rainbow',          left: '5%',  top: '65%', size: 54, delay: '1.1s', dur: '6s'   },
  { icon: 'fluent-emoji-flat:glowing-star',     left: '87%', top: '60%', size: 44, delay: '0.4s', dur: '5.5s' },
  { icon: 'fluent-emoji-flat:trophy',           left: '77%', top: '28%', size: 38, delay: '1.7s', dur: '4.8s' },
  { icon: 'fluent-emoji-flat:open-book',        left: '17%', top: '78%', size: 40, delay: '0.8s', dur: '5.2s' },
  { icon: 'fluent-emoji-flat:video-game',       left: '68%', top: '80%', size: 36, delay: '1.4s', dur: '4.2s' },
  { icon: 'fluent-emoji-flat:love-you-gesture', left: '44%', top: '3%',  size: 34, delay: '0.4s', dur: '5.8s' },
];

export default function Register() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [user,     setUser]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [step,     setStep]     = useState<'form' | 'success'>('form');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setStep('success');
  }

  if (step === 'success') return (
    <>
      <style>{successStyles}</style>
      <div style={s.page}>
        {floaters.map((f, i) => (
          <span key={i} style={{ position:'absolute', left:f.left, top:f.top, zIndex:0, opacity:.14,
            animation:`float ${f.dur} ease-in-out infinite`, animationDelay:f.delay, pointerEvents:'none', display:'block' }}>
            <Icon icon={f.icon} width={f.size} />
          </span>
        ))}
        <div style={{ ...s.card, animation:'cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <Icon icon="fluent-emoji-flat:party-popper" width={80} style={{ display:'block', margin:'0 auto 16px' }} />
          <h1 style={s.title}>¡Cuenta creada!</h1>
          <p style={{ ...s.sub, marginBottom:28 }}>
            Hola <strong style={{ color:'#7c3aed' }}>{name || user}</strong>, ya puedes iniciar sesión y empezar a aprender señas.
          </p>
          <button className="lp-btn" onClick={() => navigate('/login')} style={s.btnLogin}>
            <Icon icon="fluent-emoji-flat:rocket" width={20} style={{verticalAlign:'middle'}} />
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{baseStyles}</style>
      <div style={s.page}>
        {floaters.map((f, i) => (
          <span key={i} style={{ position:'absolute', left:f.left, top:f.top, zIndex:0, opacity:.14,
            animation:`float ${f.dur} ease-in-out infinite`, animationDelay:f.delay, pointerEvents:'none', display:'block' }}>
            <Icon icon={f.icon} width={f.size} />
          </span>
        ))}

        <div style={s.card}>
          <img src={LOGO} alt="LS Play" style={s.logo} />

          <div style={s.chip}>
            <Icon icon="fluent-emoji-flat:sparkles" width={16} />
            ¡Únete gratis!
          </div>

          <h1 style={s.title}>Crear cuenta</h1>
          <p style={s.sub}>Empieza a aprender lengua de señas hoy</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:waving-hand" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Nombre
              </label>
              <input className="lp-input" type="text" value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Tu nombre" required />
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:bust-in-silhouette" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Usuario
              </label>
              <input className="lp-input" type="text" value={user}
                onChange={e => { setUser(e.target.value); setError(''); }}
                placeholder="nombre_de_usuario" required />
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:locked" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Contraseña
              </label>
              <div style={{ position:'relative' }}>
                <input className="lp-input" type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••" style={{ paddingRight:48 }} required />
                <button className="lp-eye" type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
                  <Icon icon={showPass ? 'fluent-emoji-flat:eyes' : 'fluent-emoji-flat:locked-with-key'} width={20} />
                </button>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <Icon icon="fluent-emoji-flat:check-mark-button" width={14} style={{verticalAlign:'middle',marginRight:5}} />
                Confirmar contraseña
              </label>
              <input className="lp-input" type={showPass ? 'text' : 'password'} value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                placeholder="••••••••" required />
            </div>

            {error && (
              <div style={s.errorBox}>
                <Icon icon="fluent-emoji-flat:warning" width={16} style={{verticalAlign:'middle',marginRight:6}} />
                {error}
              </div>
            )}

            <button type="submit" className="lp-btn" style={s.btnLogin}>
              ¡Crear cuenta!
            </button>
          </form>

          <p style={s.regText}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="lp-reg" style={s.regLink}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
}

const baseStyles = `
  @keyframes float {
    0%,100% { transform: translateY(0)    rotate(0deg);  }
    40%      { transform: translateY(-14px) rotate(6deg);  }
    70%      { transform: translateY(-7px)  rotate(-3deg); }
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(28px) scale(0.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  .lp-input {
    width:100%; padding:13px 16px; font-size:15px;
    font-family:'Nunito',sans-serif; font-weight:700; color:#3d2c6e;
    background:#faf7ff; border:2.5px solid #e8e0f5; border-radius:14px;
    outline:none; box-sizing:border-box;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .lp-input:focus { border-color:#7c3aed; box-shadow:0 0 0 4px rgba(124,58,237,0.12); background:#fff; }
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
  .lp-eye { background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; transition:opacity .15s; }
  .lp-eye:hover { opacity:.7; }
  .lp-reg:hover { text-decoration:underline; }
`;

const successStyles = baseStyles;

const s: Record<string, React.CSSProperties> = {
  page:     { minHeight:'100vh', background:'linear-gradient(145deg,#ede9fb 0%,#fce7f3 55%,#dbeafe 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', overflow:'hidden' },
  card:     { background:'#fff', borderRadius:28, border:'2px solid #ede9fb', boxShadow:'0 24px 64px rgba(124,58,237,0.13)', padding:'40px 40px 36px', width:'100%', maxWidth:420, position:'relative', zIndex:1, textAlign:'center', animation:'cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both' },
  logo:     { height:80, width:'auto', objectFit:'contain', display:'block', margin:'0 auto 16px', filter:'drop-shadow(0 4px 14px rgba(124,58,237,0.22))' },
  chip:     { display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#ede9fb,#fce7f3)', color:'#5b21b6', fontWeight:800, fontSize:13, padding:'6px 16px', borderRadius:20, marginBottom:14, border:'1.5px solid #c4b5fd' },
  title:    { fontFamily:"'Fredoka One',cursive", fontSize:'clamp(28px,5vw,38px)', color:'#3d2c6e', marginBottom:6, lineHeight:1.1 },
  sub:      { fontSize:14, fontWeight:600, color:'#9e8ec0', marginBottom:24 },
  form:     { display:'flex', flexDirection:'column', gap:14, textAlign:'left' },
  field:    { display:'flex', flexDirection:'column', gap:7 },
  label:    { fontSize:13, fontWeight:800, color:'#5b21b6' },
  btnLogin: { marginTop:6 },
  regText:  { fontSize:13, fontWeight:700, color:'#9e8ec0', marginTop:22 },
  regLink:  { color:'#7c3aed', fontWeight:800, textDecoration:'none' },
  errorBox: { background:'rgba(252,165,165,0.15)', border:'2px solid #fca5a5', borderRadius:12, padding:'10px 14px', color:'#7f1d1d', fontWeight:700, fontSize:13 },
};
