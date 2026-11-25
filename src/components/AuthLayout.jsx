import { Link } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({ title, subtitle, panelLink, children }) {
    return (
        <div className="auth">
            <aside className="auth__panel">
                <img className="auth__panel-logo" src="/logo-utr.png" alt="Universidad Tecnológica de El Retoño" />
                <p className="auth__panel-text">
                    Consulta la disponibilidad del material deportivo en campus, genera tu vale digital y
                    controla tus entregas en bodega.
                </p>
                <Link className="auth__panel-link" to={panelLink.to}>
                    {panelLink.label} →
                </Link>
            </aside>

            <main className="auth__form-side">
                <div className="auth__form-box">
                    <div className="auth__brand">
                        <img src="/logo-sports.png" alt="" />
                        <span>UTR Sports</span>
                    </div>
                    <h1 className="auth__title">{title}</h1>
                    <p className="auth__subtitle">{subtitle}</p>
                    {children}
                </div>
            </main>
        </div>
    );
}