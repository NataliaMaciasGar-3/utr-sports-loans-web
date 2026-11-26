import { useState } from "react";
import Modal from "../Modal";
import { returnLoan } from "../../services/loansService";
import formatDate  from "../../utils/format";
import "./ItemFormModal.css";
import "./ReturnModal.css";

const OPTIONS = [
    { value: "BUENO", label: "BUENO", hint: "Sin daños", icon: "✓" },
    { value: "DANADO", label: "DAÑADO", hint: "Requiere nota", icon: "⚠" },
];

const ReturnModal = ({ loan, onClose, onReturned }) => {
    const [estado, setEstado] = useState("BUENO");
    const [notas, setNotas] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [stale, setStale] = useState(false); // el préstamo ya cambió en el servidor

    const damaged = estado === "DANADO";

    const handleSelectState = (value) => {
        setEstado(value);
        setFieldErrors({});
    };
    const handleNotesChange = (e) => {
        setNotas(e.target.value);
        setFieldErrors((prev) => ({ ...prev, notas: "" }));
    };
    // Si hubo un 404/409, al cerrar se vuelve a pedir la lista
    const handleClose = () => onClose(stale);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (damaged && !notas.trim()) {
            setFieldErrors({ notas: "Debes describir el daño presentado en el material." });
            return;
        }

        setLoading(true);
        try {
            const body = { estadoDevolucion: estado };
            if (notas.trim()) body.notas = notas.trim();
            await returnLoan(loan.loanId, body);
            onReturned(
                damaged
                    ? `Devolución registrada. ${loan.cantidad} unidad(es) dadas de baja del inventario.`
                    : "Devolución registrada correctamente."
            );
        } catch (err) {
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message);
                if (err.status === 404 || err.status === 409) setStale(true); // por ejemplo, ya devuelto
            }
            setLoading(false);
        }
    };

    return (
        <Modal title="Registrar devolución" onClose={handleClose} busy={loading}>
            <form className="modal__body form-modal" onSubmit={handleSubmit} noValidate>
                {error && <div className="alert" role="alert">⚠ {error}</div>}

                <div className="loan-item">
                    <div className="loan-item__top">
                        <span>Folio #{loan.loanId}</span>
                        <span>{loan.usuario} ({loan.matricula})</span>
                    </div>
                    <strong>{loan.cantidad}x {loan.item}</strong>
                    <span className="loan-item__stock">{loan.canchaOActividad} · salió {formatDate(loan.horaSalida)}</span>
                </div>

                <div className="field">
                    <label>Estado de devolución *</label>
                    <div className="choices" role="radiogroup">
                        {OPTIONS.map((o) => (
                            <label
                                key={o.value}
                                className={
                                    "choice" +
                                    (estado === o.value ? (o.value === "BUENO" ? " is-good" : " is-bad") : "")
                                }
                            >
                                <input
                                    type="radio"
                                    name="estadoDevolucion"
                                    value={o.value}
                                    checked={estado === o.value}
                                    onChange={() => handleSelectState(o.value)}
                                />
                                <span className="choice__icon">{o.icon}</span>
                                <strong>{o.label}</strong>
                                <small>{o.hint}</small>
                            </label>
                        ))}
                    </div>
                </div>

                {damaged && (
                    <div className="warning" role="note">
                        Al registrar material dañado, {loan.cantidad === 1 ? "la unidad se da" : `las ${loan.cantidad} unidades se dan`} de
                        baja y la cantidad total de <strong>{loan.item}</strong> disminuirá en el inventario.
                    </div>
                )}

                <div className="field">
                    <label htmlFor="notas">
                        Notas de recepción{damaged && <span className="required"> * (obligatorio)</span>}
                    </label>
                    <textarea
                        id="notas"
                        rows={3}
                        placeholder="Observaciones sobre el estado del material..."
                        value={notas}
                        onChange={handleNotesChange}
                        className={fieldErrors.notas ? "is-invalid" : ""}
                    />
                    {fieldErrors.notas && <span className="field__error">⚠ {fieldErrors.notas}</span>}
                </div>

                <div className="modal__actions">
                    <button type="button" className="btn-outline btn-block" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary btn-block" disabled={loading}>
                        {loading ? "Registrando..." : "Confirmar recepción"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ReturnModal;