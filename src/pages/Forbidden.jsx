import { useNavigate } from "react-router-dom";
import StatusPage from "../components/StatusPage";

export default function Forbidden() {
    const navigate = useNavigate();
    const handleGoHome = () => navigate("/inventory", { replace: true });

    return (
        <StatusPage
            icon={<img src="/lock-status-icon.png" alt="Locked" />}
            code="ERROR 403"
            title="No tienes permiso para ver esta sección"
            text="Esta área está reservada para personal de Coordinación Deportiva."
            buttonLabel="Volver al inventario"
            onAction={handleGoHome}
        />
    );
}