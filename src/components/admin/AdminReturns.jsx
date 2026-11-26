import { useEffect, useMemo, useState } from "react";
import ReturnModal from "./ReturnModal";
import  formatDate  from "../../utils/format";

const AdminReturns = ({ loans, loading, error, onReload }) => {
    const [selected, setSelected] = useState(null);
    const [notice, setNotice] = useState("");

    // El aviso de éxito desaparece solo
    useEffect(() => {
        if (!notice) return;
        const id = setTimeout(() => setNotice(""), 4500);
        return () => clearTimeout(id);
    }, [notice]);

    const pending = useMemo(
        () =>
            loans
                .filter((l) => l.estatus === "ACTIVO")
                .sort((a, b) => new Date(b.horaSalida) - new Date(a.horaSalida)),
        [loans]
    );

    const handleSelect = (loan) => setSelected(loan);
    const handleCloseModal = (refresh) => {
        setSelected(null);
        if (refresh) onReload();
    };
    const handleReturned = (message) => {
        setSelected(null);
        setNotice(message);
        onReload();
    };

    return (
        <>
            <div className="admin-bar">
                <span className="admin-bar__count">
                    Préstamos pendientes de devolución: <strong>{loading ? "…" : pending.length}</strong>
                </span>
            </div>

            {notice && <div className="toast" role="status">✓ {notice}</div>}

            {loading && <div className="state"><p>Cargando préstamos...</p></div>}

            {!loading && error && (
                <div className="state state--error">
                    <h2>No pudimos cargar los préstamos</h2>
                    <p>{error}</p>
                    <button className="btn-request btn-request--inline" onClick={onReload}>Reintentar</button>
                </div>
            )}

            {!loading && !error && pending.length === 0 && (
                <div className="state">
                    <h2>No hay préstamos pendientes de devolución</h2>
                    <p>Cuando un alumno solicite material, su vale aparecerá aquí.</p>
                </div>
            )}

            {!loading && !error && pending.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Material</th>
                                <th>Solicitante</th>
                                <th>Cancha / actividad</th>
                                <th>Hora de salida</th>
                                <th className="actions">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.map((loan) => (
                                <tr key={loan.loanId}>
                                    <td><span className="badge badge--code">#{loan.loanId}</span></td>
                                    <td><strong>{loan.cantidad}x {loan.item}</strong></td>
                                    <td>
                                        {loan.usuario}
                                        <br />
                                        <small className="muted">{loan.matricula}</small>
                                    </td>
                                    <td>{loan.canchaOActividad}</td>
                                    <td>{formatDate(loan.horaSalida)}</td>
                                    <td className="actions">
                                        <button className="btn-primary btn-primary--inline" onClick={() => handleSelect(loan)}>
                                            Registrar devolución
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && <ReturnModal loan={selected} onClose={handleCloseModal} onReturned={handleReturned} />}
        </>
    );
}

export default AdminReturns;