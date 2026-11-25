import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // Si ya hay sesión, no tiene sentido ver el login
    if (user) return <Navigate to="/inventory" replace />;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        setLoading(true);
        try {
            await login(form.email.trim(), form.password);
            navigate("/inventory", { replace: true });
        } catch (err) {
            // 400: errores por campo
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Iniciar sesión"
            subtitle={<>¿No tienes cuenta? <Link to="/register">Regístrate</Link></>}
            panelLink={{ to: "/register", label: "¿No tienes una cuenta? Regístrate" }}
        >
            <form className="form" onSubmit={handleSubmit} noValidate>
                {error && <div className="alert" role="alert">⚠ {error}</div>}

                <div className="field">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Ej. st1123@utr.edu.mx"
                        value={form.email}
                        onChange={handleChange}
                        className={fieldErrors.email ? "is-invalid" : ""}
                        autoComplete="username"
                        required
                    />
                    {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
                </div>

                <div className="field">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className={fieldErrors.password ? "is-invalid" : ""}
                        autoComplete="current-password"
                        required
                    />
                    {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
                </div>

                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? "Ingresando..." : "Iniciar sesión"}
                </button>
            </form>
        </AuthLayout>
    );
}