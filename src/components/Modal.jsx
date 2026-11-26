import { useEffect } from "react";
import "./Modal.css";

export default function Modal({ title, onClose, busy = false, children }) {
    // Cerrar con Escape (salvo que se esté enviando)
    useEffect(() => {
        const handleKey = (e) => e.key === "Escape" && !busy && onClose();
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, busy]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !busy) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
                <header className="modal__head">
                    <h2>{title}</h2>
                    <button className="modal__close" onClick={onClose} aria-label="Cerrar" disabled={busy}>✕</button>
                </header>
                {children}
            </div>
        </div>
    );
}