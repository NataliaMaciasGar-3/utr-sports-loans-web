import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLoans } from "../services/loansService";
import "./Loans.css";

const FILTERS = [
    { key: "TODOS", label: "Todos" },
    { key: "ACTIVO", label: "Activos" },
    { key: "FINALIZADO", label: "Finalizados" },
];

const formatDate = (value) =>
    value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function Loans() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [loans, setLoans] = useState([]);
    const [filter, setFilter] = useState("TODOS");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadLoans = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getLoans();
                // Más recientes primero
                const sorted = [...data].sort((a, b) => new Date(b.horaSalida) - new Date(a.horaSalida));
                if (!cancelled) setLoans(sorted);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadLoans();
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleSelectFilter = (key) => setFilter(key);
    const handleRetry = () => setReloadKey((k) => k + 1);
    const handleGoToInventory = () => navigate("/inventory");

    const count = (key) => (key === "TODOS" ? loans.length : loans.filter((l) => l.estatus === key).length);
    const activeCount = count("ACTIVO");
    const visibleLoans = filter === "TODOS" ? loans : loans.filter((l) => l.estatus === filter);

    return (
        <>
            <section className="panel">
                <div className="panel__head">
                    <div>
                        <h1 className="panel__title">
                            {isAdmin ? "Préstamos deportivos" : "Mis Préstamos Deportivos"}
                        </h1>
                        <p className="panel__subtitle">
                            {isAdmin
                                ? "Consulta los vales de todos los usuarios."
                                : "Consulta tus vales activos y el historial de material devuelto."}
                        </p>
                    </div>

                    <div className="segmented" role="tablist">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                role="tab"
                                aria-selected={filter === f.key}
                                className={"segmented__btn" + (filter === f.key ? " is-active" : "")}
                                onClick={() => handleSelectFilter(f.key)}
                            >
                                {f.label} ({count(f.key)})
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {!loading && !error && !isAdmin && activeCount > 0 && (
                <div className="notice">
                    <span>
                        Tienes {activeCount} {activeCount === 1 ? "préstamo activo" : "préstamos activos"}.
                        Devuelve el material en bodega al terminar tu actividad.
                    </span>
                    <button className="btn-outline" onClick={handleGoToInventory}>
                        Solicitar otro préstamo
                    </button>
                </div>
            )}

            {loading && (
                <div className="loan-list" aria-busy="true">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div className="loan-card loan-card--skeleton" key={i} />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="state state--error">
                    <h2>No pudimos cargar tus préstamos</h2>
                    <p>{error}</p>
                    <button className="btn-request btn-request--inline" onClick={handleRetry}>
                        Reintentar
                    </button>
                </div>
            )}

            {!loading && !error && visibleLoans.length === 0 && (
                <div className="state">
                    <h2>{loans.length === 0 ? "Aún no tienes préstamos" : "No hay préstamos en esta categoría"}</h2>
                    <p>
                        {loans.length === 0
                            ? "Cuando solicites material, tu vale aparecerá aquí."
                            : "Prueba con otro filtro."}
                    </p>
                    {loans.length === 0 && (
                        <button className="btn-request btn-request--inline" onClick={handleGoToInventory}>
                            Ir al inventario
                        </button>
                    )}
                </div>
            )}

            {!loading && !error && visibleLoans.length > 0 && (
                <div className="loan-list">
                    {visibleLoans.map((loan) => {
                        const active = loan.estatus === "ACTIVO";
                        const damaged = loan.estadoDevolucion === "DANADO";

                        return (
                            <article className="loan-card" key={loan.loanId}>
                                <div className="loan-card__top">
                                    <div className="loan-card__tags">
                                        <span className="badge badge--code">Folio #{loan.loanId}</span>
                                        <span className={"badge " + (active ? "badge--active" : "badge--done")}>
                                            {loan.estatus}
                                        </span>
                                    </div>
                                    <span className="loan-card__date">{formatDate(loan.horaSalida)}</span>
                                </div>

                                <div className="loan-card__main">
                                    <div>
                                        <h3 className="loan-card__title">{loan.cantidad}x {loan.item}</h3>
                                        <p className="loan-card__meta">
                                            {loan.codigo} · {loan.canchaOActividad}
                                        </p>
                                        {isAdmin && (
                                            <p className="loan-card__meta">
                                                Solicitante: {loan.usuario} ({loan.matricula})
                                            </p>
                                        )}
                                    </div>

                                    {active ? (
                                        <span className="pill">Entregar en bodega</span>
                                    ) : (
                                        <span className="pill">
                                            Devolución:{" "}
                                            <strong className={damaged ? "text-bad" : "text-good"}>
                                                {loan.estadoDevolucion || "—"}
                                            </strong>
                                        </span>
                                    )}
                                </div>

                                <div className={"loan-card__foot" + (active ? "" : " loan-card__foot--done")}>
                                    {active
                                        ? "Devuelve el material en bodega al finalizar tu actividad."
                                        : `Devuelto el ${formatDate(loan.horaDevolucion)}${loan.notas ? ` · ${loan.notas}` : ""}`}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </>
    );
}