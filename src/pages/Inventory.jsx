import { useEffect, useState } from "react";
import { getItems, getSports } from "../services/itemsService";
import ItemCard from "../components/ItemCard";
import LoanModal from "../components/LoanModal";
import "./Inventory.css";

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [sports, setSports] = useState([]);
    const [sport, setSport] = useState("Todos");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const [selectedItem, setSelectedItem] = useState(null);

    // Disciplinas para los chips (una sola vez al montar)
    useEffect(() => {
        getSports()
            .then(setSports)
            .catch(() => setSports([]));
    }, []);

    // Items: se vuelve a pedir cuando cambian los filtros
    useEffect(() => {
        let cancelled = false;

        const loadItems = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getItems({
                    deporte: sport === "Todos" ? undefined : sport,
                    disponible: onlyAvailable ? "true" : undefined,
                });
                if (!cancelled) setItems(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadItems();
        return () => {
            cancelled = true;
        };
    }, [sport, onlyAvailable, reloadKey]);

    const handleSelectSport = (name) => setSport(name);
    const handleToggleAvailable = (e) => setOnlyAvailable(e.target.checked);
    const handleSearchChange = (e) => setSearch(e.target.value);
    const handleRetry = () => setReloadKey((k) => k + 1);
    const handleClearFilters = () => {
        setSport("Todos");
        setOnlyAvailable(false);
        setSearch("");
    };
    // El modal de préstamo
    const handleRequest = (item) => setSelectedItem(item);
    const handleCloseModal = () => setSelectedItem(null);
    const handleLoanCreated = () => setReloadKey((k) => k + 1); // vuelve a pedir el stock

    const term = search.trim().toLowerCase();
    const visibleItems = items.filter(
        (i) => i.codigo.toLowerCase().includes(term) || i.nombre.toLowerCase().includes(term)
    );

    return (
        <>
            <section className="panel">
                <div className="panel__head">
                    <div>
                        <h1 className="panel__title">Inventario de Material Deportivo</h1>
                        <p className="panel__subtitle">
                            Consulta el equipo disponible en bodega y solicita tu vale de préstamo.
                        </p>
                    </div>

                    <label className="switch">
                        <input type="checkbox" checked={onlyAvailable} onChange={handleToggleAvailable} />
                        <span className="switch__track" />
                        <span>Solo disponibles</span>
                    </label>
                </div>

                <div className="filters">
                    <div className="chips">
                        {["Todos", ...sports].map((name) => (
                            <button
                                key={name}
                                className={"chip" + (sport === name ? " is-active" : "")}
                                onClick={() => handleSelectSport(name)}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    <input
                        className="search"
                        type="search"
                        placeholder="Buscar por código o nombre"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </section>

            {loading && (
                <div className="grid" aria-busy="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div className="item-card item-card--skeleton" key={i} />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="state state--error">
                    <h2>Error al cargar el inventario</h2>
                    <p>{error}</p>
                    <button className="btn-request btn-request--inline" onClick={handleRetry}>
                        Reintentar
                    </button>
                </div>
            )}

            {!loading && !error && visibleItems.length === 0 && (
                <div className="state">
                    <h2>No hay material con estos filtros</h2>
                    <p>Prueba seleccionando otra disciplina o desactivando el filtro de disponibilidad.</p>
                    <button className="btn-outline" onClick={handleClearFilters}>
                        Limpiar filtros
                    </button>
                </div>
            )}

            {!loading && !error && visibleItems.length > 0 && (
                <div className="grid">
                    {visibleItems.map((item) => (
                        <ItemCard key={item.id} item={item} onRequest={handleRequest} />
                    ))}
                </div>
            )}

            {selectedItem && (
                <LoanModal
                    item={selectedItem}
                    onClose={handleCloseModal}
                    onCreated={handleLoanCreated}
                />
            )}
        </>
    );
}