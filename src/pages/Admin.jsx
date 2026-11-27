import { useEffect, useState } from "react";
import AdminInventory from "../components/admin/AdminInventory";
import AdminReturns from "../components/admin/AdminReturns";
import { getLoans } from "../services/loansService";
import AdminUsers from "../components/admin/AdminUsers";
import "./Admin.css";

const Admin = () => {
    const [tab, setTab] = useState("inventory");

    const [loans, setLoans] = useState([]);
    const [loansLoading, setLoansLoading] = useState(true);
    const [loansError, setLoansError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadLoans = async () => {
            setLoansLoading(true);
            setLoansError("");
            try {
                const data = await getLoans();
                if (!cancelled) setLoans(data);
            } catch (err) {
                if (!cancelled) setLoansError(err.message);
            } finally {
                if (!cancelled) setLoansLoading(false);
            }
        };

        loadLoans();
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleSelectTab = (key) => setTab(key);
    const handleReloadLoans = () => setReloadKey((k) => k + 1);

    const pendingCount = loans.filter((l) => l.estatus === "ACTIVO").length;

    const tabs = [
        { key: "inventory", label: "Inventario" },
        { key: "returns", label: "Devoluciones", badge: pendingCount },
        { key: "users", label: "Usuarios" },
    ];

    return (
        <>
            <section className="panel">
                <div className="panel__head">
                    <div>
                        <h1 className="panel__title">Coordinación Deportiva</h1>
                        <p className="panel__subtitle">
                            Administración de catálogo, recepción de material y gestión de usuarios.
                        </p>
                    </div>

                    <div className="segmented" role="tablist">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                role="tab"
                                aria-selected={tab === t.key}
                                className={"segmented__btn" + (tab === t.key ? " is-active" : "")}
                                onClick={() => handleSelectTab(t.key)}
                            >
                                {t.label}
                                {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {tab === "inventory" && <AdminInventory />}
            {tab === "returns" && (
                <AdminReturns
                    loans={loans}
                    loading={loansLoading}
                    error={loansError}
                    onReload={handleReloadLoans}
                />
            )}
            {tab === "users" && <AdminUsers />}
        </>
    );
}

export default Admin;