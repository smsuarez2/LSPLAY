import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar   from './components/Navbar';
import Home     from './pages/Home';
import Aprender from './pages/Aprender';
import Jugar    from './pages/Jugar';
import Camara   from './pages/Camara';
import Perfil   from './pages/Perfil';
import Login    from './pages/Login';
import Register from './pages/Register';

function Layout() {
  const { pathname } = useLocation();
  const hideNav = pathname === '/login' || pathname === '/register';
  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/aprender"  element={<Aprender />} />
        <Route path="/jugar"     element={<Jugar />} />
        <Route path="/camara"    element={<Camara />} />
        <Route path="/perfil"    element={<Perfil />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
