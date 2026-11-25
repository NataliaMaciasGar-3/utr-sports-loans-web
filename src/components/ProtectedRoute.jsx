import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sin sesión -> /login. Con "role" y rol distinto -> /forbidden
export default function ProtectedRoute({ role }) {
    const { user, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.rol !== role) return <Navigate to="/forbidden" replace />;

    return <Outlet />;
}