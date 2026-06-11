import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LOGO from '../assets/logo.png';

export default function Navbar() {
  const links = [
    { to: '/',         label: 'Inicio',   icon: 'fluent-emoji-flat:house',      cls: 'btn-inicio'   },
    { to: '/aprender', label: 'Aprender', icon: 'fluent-emoji-flat:open-book',  cls: 'btn-aprender' },
    { to: '/jugar',    label: 'Jugar',    icon: 'fluent-emoji-flat:video-game', cls: 'btn-jugar'    },
    { to: '/camara',   label: 'Cámara',   icon: 'fluent-emoji-flat:camera',     cls: 'btn-camara'   },
    { to: '/perfil',   label: 'Perfil',   icon: 'fluent-emoji-flat:star',       cls: 'btn-perfil'   },
  ];

  return (
    <nav style={styles.nav}>
      <NavLink to="/" style={styles.logoLink}>
        <img src={LOGO} alt="LS Play" style={styles.logo} />
      </NavLink>
      <div style={styles.links}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            style={({ isActive }) => ({
              ...styles.btn,
              ...btnColors[l.cls],
              opacity: isActive ? 1 : 0.85,
              transform: isActive ? 'translateY(2px)' : 'translateY(0)',
            })}
          >
            <Icon icon={l.icon} width={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: '#fff',
    borderBottom: '2px solid #e8e0f5',
    padding: '0px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 2px 12px rgba(139,92,246,0.08)',
  },
  logoLink: { display: 'flex', alignItems: 'center' },
  logo: { height: 80, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(139,92,246,0.18))' },
  links: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  btn: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: 15, borderRadius: 22, padding: '9px 20px',
    cursor: 'pointer', transition: 'all 0.15s',
    textDecoration: 'none', display: 'inline-block', border: 'none',
  },
};

const btnColors: Record<string, React.CSSProperties> = {
  'btn-inicio':   { background: '#c4b5fd', color: '#4c1d95', boxShadow: '0 3px 0 #7c3aed' },
  'btn-aprender': { background: '#86efac', color: '#14532d', boxShadow: '0 3px 0 #16a34a' },
  'btn-jugar':    { background: '#fcd34d', color: '#78350f', boxShadow: '0 3px 0 #d97706' },
  'btn-camara':   { background: '#fca5a5', color: '#7f1d1d', boxShadow: '0 3px 0 #dc2626' },
  'btn-perfil':   { background: '#a5f3fc', color: '#164e63', boxShadow: '0 3px 0 #0891b2' },
};
