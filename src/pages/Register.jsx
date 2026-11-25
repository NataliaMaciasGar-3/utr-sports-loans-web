import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";
import AuthLayout from "../components/AuthLayout";

const INITIAL = { nombre: "", matricula: "", email: "", password: "" };

export default function Register() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

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
            await register({
                nombre: form.nombre.trim(),
                matricula: form.matricula.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            await login(form.email.trim(), form.password);
            navigate("/inventory", { replace: true });
        } catch (err) {
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message); // por ejemplo 409: correo o matrícula duplicados
            }
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: "nombre", label: "Nombre completo", type: "text", placeholder: "Juanito Pérez", autoComplete: "name" },
        { name: "matricula", label: "Matrícula", type: "text", placeholder: "Ej. UTR22001", autoComplete: "off" },
        { name: "email", label: "Correo electrónico", type: "email", placeholder: "Ej. st1123@utr.edu.mx", autoComplete: "email" },
        { name: "password", label: "Contraseña", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
    ];

    return (
        <AuthLayout
            title="Crea tu cuenta"
            subtitle={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
            panelLink={{ to: "/login", label: "¿Ya tienes cuenta? Inicia sesión" }}
        >
            <form className="form" onSubmit={handleSubmit} noValidate>
                {error && <div className="alert" role="alert">⚠ {error}</div>}

                {fields.map((f) => (
                    <div className="field" key={f.name}>
                        <label htmlFor={f.name}>{f.label}</label>
                        <input
                            id={f.name}
                            name={f.name}
                            type={f.type}
                            placeholder={f.placeholder}
                            autoComplete={f.autoComplete}
                            value={form[f.name]}
                            onChange={handleChange}
                            className={fieldErrors[f.name] ? "is-invalid" : ""}
                            required
                        />
                        {fieldErrors[f.name] && <span className="field__error">{fieldErrors[f.name]}</span>}
                    </div>
                ))}

                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
            </form>
        </AuthLayout>
    );
}