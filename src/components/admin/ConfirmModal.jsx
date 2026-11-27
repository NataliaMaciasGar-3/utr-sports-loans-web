import { useState } from "react";
import Modal from "../Modal";
import "./ItemFormModal.css";

const ConfirmModal = ({ title, children, confirmLabel, onConfirm, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        setError("");
        setLoading(true);
        try {
            await onConfirm(); // si sale bien, el padre cierra el modal
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <Modal title={title} onClose={onClose} busy={loading}>
            <div className="modal__body form-modal">
                {error && <div className="alert" role="alert">⚠ {error}</div>}
                <div className="confirm-text">{children}</div>
                <div className="modal__actions">
                    <button className="btn-outline btn-block" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button className="btn-primary btn-block" onClick={handleConfirm} disabled={loading}>
                        {loading ? "Guardando..." : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmModal;