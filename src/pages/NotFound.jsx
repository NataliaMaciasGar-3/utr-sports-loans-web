import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusPage from "../components/StatusPage";

export default function NotFound() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const handleGoHome = () => navigate(user ? "/inventory" : "/login", { replace: true });

    return (
        <StatusPage
            icon={<img src="/compass-status-icon.png" alt="Compass" />}
            code="ERROR 404"
            title="Página no encontrada"
            text="La página que buscas no existe o fue movida."
            buttonLabel={user ? "Volver al inventario" : "Ir al inicio de sesión"}
            onAction={handleGoHome}
        />
    );
}