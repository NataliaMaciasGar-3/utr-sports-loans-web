import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
    const { user, isAdmin, logout } = useAuth();

    const linkClass = ({ isActive }) => "navbar__link" + (isActive ? " is-active" : "");

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <div className="navbar__brand">
                    <img src="/logo-sports.png" alt="" />
                    <span>UTR Sports</span>
                </div>

                <nav className="navbar__links">
                    <NavLink to="/inventory" className={linkClass}>Inventario</NavLink>
                    <NavLink to="/loans" className={linkClass}>Mis préstamos</NavLink>
                    {isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
                </nav>

                <div className="navbar__user">
                    <span className="navbar__name">{user.nombre}</span>
                    <span className="navbar__role">{isAdmin ? "ADMIN" : "ALUMNO"}</span>
                    <button className="navbar__logout" onClick={logout}>Cerrar sesión</button>
                </div>
            </div>
        </header>
    );
}