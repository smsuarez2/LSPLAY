import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar  from './components/Navbar';
import Home    from './pages/Home';
import Aprender from './pages/Aprender';
import Jugar   from './pages/Jugar';
import Camara  from './pages/Camara';
import Perfil  from './pages/Perfil';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/aprender" element={<Aprender />} />
        <Route path="/jugar"    element={<Jugar />} />
        <Route path="/camara"   element={<Camara />} />
        <Route path="/perfil"   element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  );
}
