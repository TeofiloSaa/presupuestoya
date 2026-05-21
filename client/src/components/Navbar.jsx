import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">PresupuestoYa</Link>
        <div className="navbar-actions">
          <Link to="/historial" className="navbar-link">Historial</Link>
          <span className="navbar-email">{user.name || user.email}</span>
          <button className="navbar-logout" onClick={handleLogout}>Salir</button>
        </div>
      </div>
    </nav>
  );
}
