import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage, setUnauthorizedHandler, setForbiddenHandler } from "../services/apiClient";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 401 -> limpiar sesión y volver a Login. 403 -> pantalla de acceso restringido
    useEffect(() => {
        setUnauthorizedHandler(() => {
            setUser(null);
            navigate("/login", { replace: true });
        });
        setForbiddenHandler(() => navigate("/forbidden"));
    }, [navigate]);

    // Al abrir la app, si hay token guardado, recupera al usuario
    useEffect(() => {
        const restoreSession = async () => {
            if (!tokenStorage.get()) {
                setLoading(false);
                return;
            }
            try {
                setUser(await authService.getMe());
            } catch {
                tokenStorage.clear();
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        const loggedUser = await authService.login(email, password);
        setUser(loggedUser);
        return loggedUser;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        navigate("/login", { replace: true });
    };

    const value = { user, loading, isAdmin: user?.rol === "ADMIN", login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);