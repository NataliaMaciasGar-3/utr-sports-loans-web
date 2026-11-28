import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_APP_TOKEN = import.meta.env.VITE_API_APP_TOKEN;
const TOKEN_KEY = "user_jwt_token";

export const tokenStorage = {
    get: () => sessionStorage.getItem(TOKEN_KEY),
    set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
    clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

// La UI define qué hacer (redirigir a /login, mostrar pantalla 403)
let onUnauthorized = null;
let onForbidden = null;
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);
export const setForbiddenHandler = (fn) => (onForbidden = fn);

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: { "Content-Type": "application/json" },
});

// Doble JWT: x-api-token siempre, Authorization si hay sesión
apiClient.interceptors.request.use((config) => {
    config.headers["x-api-token"] = API_APP_TOKEN;
    const userToken = tokenStorage.get();
    if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
    return config;
});

const SESSION_CODES = ["TOKEN_MISSING", "TOKEN_INVALID", "TOKEN_EXPIRED", "USER_INACTIVE"];

apiClient.interceptors.response.use(
    (res) => res.data,
    (error) => {
        const { response } = error;
        if (!response) {
            return Promise.reject(new Error("No hay conexión con el servidor"));
        }

        const { status, data } = response;
        const err = new Error(data?.message || "Error del servidor");
        err.status = status;
        err.code = data?.code;
        err.errors = data?.errors;

        if (status === 401 && SESSION_CODES.includes(data?.code)) {
            tokenStorage.clear();
            if (onUnauthorized) onUnauthorized();
        }
        if (status === 403 && onForbidden) onForbidden();

        return Promise.reject(err);
    }
);

export default apiClient;