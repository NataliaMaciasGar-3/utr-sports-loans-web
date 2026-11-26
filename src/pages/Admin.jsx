import { useState } from "react";
import AdminInventory from "../components/admin/AdminInventory";
import "./Admin.css";

const TABS = [
    { key: "inventory", label: "Inventario" },
    { key: "returns", label: "Devoluciones" },
    { key: "users", label: "Usuarios" },
];

export default function Admin() {
    const [tab, setTab] = useState("inventory");

    const handleSelectTab = (key) => setTab(key);

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
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                role="tab"
                                aria-selected={tab === t.key}
                                className={"segmented__btn" + (tab === t.key ? " is-active" : "")}
                                onClick={() => handleSelectTab(t.key)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {tab === "inventory" && <AdminInventory />}
            {tab === "returns" && <div className="state"><h2>Devoluciones</h2><p>Próximamente.</p></div>}
            {tab === "users" && <div className="state"><h2>Usuarios</h2><p>Próximamente.</p></div>}
        </>
    );
}