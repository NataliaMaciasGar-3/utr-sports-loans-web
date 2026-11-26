import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLoan } from "../services/loansService";
import "./LoanModal.css";

const SUGGESTIONS = ["Cancha 1 - Fútbol", "Cancha 2 - Torneo", "Gimnasio - Básquetbol", "Clase Educación Física"];

const LoanModal = ({ item, onClose, onCreated }) => {
    const navigate = useNavigate();

    const [cantidad, setCantidad] = useState("1");
    const [cancha, setCancha] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [created, setCreated] = useState(null); // respuesta de la API al crear

    // Cerrar con Escape
    useEffect(() => {
        const handleKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const max = item.disponibles;

    const handleQuantityChange = (e) => {
        setCantidad(e.target.value.replace(/\D/g, ""));
        setFieldErrors((prev) => ({ ...prev, cantidad: "" }));
    };
    const handleStep = (delta) => {
        const next = Math.min(max, Math.max(1, (Number(cantidad) || 0) + delta));
        setCantidad(String(next));
        setFieldErrors((prev) => ({ ...prev, cantidad: "" }));
    };
    const handleCanchaChange = (e) => {
        setCancha(e.target.value);
        setFieldErrors((prev) => ({ ...prev, canchaOActividad: "" }));
    };
    const handleSelectSuggestion = (text) => {
        setCancha(text);
        setFieldErrors((prev) => ({ ...prev, canchaOActividad: "" }));
    };

    const validate = () => {
        const errors = {};
        const qty = Number(cantidad);
        if (!qty || qty < 1) errors.cantidad = "Indica al menos 1 unidad";
        else if (qty > max) errors.cantidad = `Máximo ${max} unidades disponibles`;
        if (!cancha.trim()) errors.canchaOActividad = "Indica la cancha o actividad";
        if (!accepted) errors.accepted = "Debes aceptar el compromiso";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;

        setLoading(true);
        try {
            const loan = await createLoan({
                itemId: item.id,
                cantidad: Number(cantidad),
                canchaOActividad: cancha.trim(),
            });
            setCreated(loan);
            onCreated(); // refresca el stock del catálogo
        } catch (err) {
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message); // por ejemplo 409: sin stock suficiente
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLoans = () => {
        onClose();
        navigate("/loans");
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !loading) onClose();
    };

    const formatDate = (value) =>
        value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="loan-modal-title">
                <header className="modal__head">
                    <h2 id="loan-modal-title">Solicitar préstamo</h2>
                    <button className="modal__close" onClick={onClose} aria-label="Cerrar" disabled={loading}>
                        ✕
                    </button>
                </header>

                {created ? (
                    <div className="modal__body loan-success">
                        <div className="loan-success__icon">✓</div>
                        <h3>¡Vale confirmado!</h3>
                        <p>Presenta este folio en la ventanilla de Coordinación Deportiva para recoger tu material.</p>

                        <dl className="loan-summary">
                            <div><dt>Folio de préstamo</dt><dd><strong>#{created.loanId}</strong></dd></div>
                            <div><dt>Material</dt><dd>{cantidad}x {item.nombre}</dd></div>
                            <div><dt>Cancha o actividad</dt><dd>{cancha.trim()}</dd></div>
                            <div><dt>Hora de salida</dt><dd>{formatDate(created.horaSalida)}</dd></div>
                        </dl>

                        <div className="modal__actions">
                            <button className="btn-outline btn-block" onClick={onClose}>Seguir explorando</button>
                            <button className="btn-primary btn-block" onClick={handleGoToLoans}>Ver mis préstamos</button>
                        </div>
                    </div>
                ) : (
                    <form className="modal__body" onSubmit={handleSubmit} noValidate>
                        <div className="loan-item">
                            <div className="loan-item__top">
                                <span>{item.codigo} · {item.deporte}</span>
                                <span className="badge badge--good">{item.estadoFisico}</span>
                            </div>
                            <strong>{item.nombre}</strong>
                            <span className="loan-item__stock">{item.disponibles} unidades disponibles en bodega</span>
                        </div>

                        {error && <div className="alert" role="alert">⚠ {error}</div>}

                        <div className="field">
                            <label htmlFor="cantidad">Cantidad <span className="field__hint">Máx. {max}</span></label>
                            <div className="stepper">
                                <button type="button" onClick={() => handleStep(-1)} aria-label="Restar">−</button>
                                <input
                                    id="cantidad"
                                    inputMode="numeric"
                                    value={cantidad}
                                    onChange={handleQuantityChange}
                                    className={fieldErrors.cantidad ? "is-invalid" : ""}
                                />
                                <button type="button" onClick={() => handleStep(1)} aria-label="Sumar">+</button>
                            </div>
                            {fieldErrors.cantidad && <span className="field__error">{fieldErrors.cantidad}</span>}
                        </div>

                        <div className="field">
                            <label htmlFor="cancha">Cancha o actividad</label>
                            <input
                                id="cancha"
                                type="text"
                                placeholder="Ej. Cancha 2 - Torneo"
                                value={cancha}
                                onChange={handleCanchaChange}
                                className={fieldErrors.canchaOActividad ? "is-invalid" : ""}
                            />
                            {fieldErrors.canchaOActividad && (
                                <span className="field__error">{fieldErrors.canchaOActividad}</span>
                            )}
                            <div className="suggestions">
                                {SUGGESTIONS.map((s) => (
                                    <button type="button" key={s} className="chip chip--small" onClick={() => handleSelectSuggestion(s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="check">
                            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                            <span>Me comprometo a cuidar el material y devolverlo en bodega al finalizar la actividad.</span>
                        </label>
                        {fieldErrors.accepted && <span className="field__error">{fieldErrors.accepted}</span>}

                        <div className="modal__actions">
                            <button type="button" className="btn-outline btn-block" onClick={onClose} disabled={loading}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary btn-block" disabled={loading}>
                                {loading ? "Enviando..." : "Confirmar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default LoanModal;