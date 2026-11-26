import { useEffect, useState } from "react";
import { getItems, getSports } from "../../services/itemsService";
import ItemFormModal from "./ItemFormModal";

const STATUS_CLASS = { NUEVO: "badge--new", BUENO: "badge--good", DESGASTADO: "badge--worn" };

export default function AdminInventory() {
    const [items, setItems] = useState([]);
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [modal, setModal] = useState(null); // null | { item: null } (crear) | { item } (editar)
    const [notice, setNotice] = useState("");

    useEffect(() => {
        getSports().then(setSports).catch(() => setSports([]));
    }, [reloadKey]);

    useEffect(() => {
        let cancelled = false;

        const loadItems = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getItems();
                if (!cancelled) setItems([...data].sort((a, b) => a.codigo.localeCompare(b.codigo)));
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
    }, [reloadKey]);

    // El aviso de éxito desaparece solo
    useEffect(() => {
        if (!notice) return;
        const id = setTimeout(() => setNotice(""), 3500);
        return () => clearTimeout(id);
    }, [notice]);

    const handleNew = () => setModal({ item: null });
    const handleEdit = (item) => setModal({ item });
    const handleCloseModal = () => setModal(null);
    const handleRetry = () => setReloadKey((k) => k + 1);
    const handleSaved = (message) => {
        setModal(null);
        setNotice(message);
        setReloadKey((k) => k + 1);
    };

    return (
        <>
            <div className="admin-bar">
                <span className="admin-bar__count">
                    Total de artículos registrados: <strong>{loading ? "…" : items.length}</strong>
                </span>
                <button className="btn-primary btn-primary--inline" onClick={handleNew}>+ Nuevo ítem</button>
            </div>

            {notice && <div className="toast" role="status">✓ {notice}</div>}

            {loading && <div className="state"><p>Cargando inventario...</p></div>}

            {!loading && error && (
                <div className="state state--error">
                    <h2>Error al cargar el inventario</h2>
                    <p>{error}</p>
                    <button className="btn-request btn-request--inline" onClick={handleRetry}>Reintentar</button>
                </div>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="state">
                    <h2>Aún no hay artículos registrados</h2>
                    <p>Crea el primero con el botón "Nuevo ítem".</p>
                </div>
            )}

            {!loading && !error && items.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Artículo</th>
                                <th>Deporte</th>
                                <th>Estado físico</th>
                                <th>Disponibilidad</th>
                                <th className="actions">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td><span className="badge badge--code">{item.codigo}</span></td>
                                    <td><strong>{item.nombre}</strong></td>
                                    <td>{item.deporte}</td>
                                    <td><span className={`badge ${STATUS_CLASS[item.estadoFisico] || ""}`}>{item.estadoFisico}</span></td>
                                    <td className="num">{item.disponibles} / {item.cantidadTotal}</td>
                                    <td className="actions">
                                        <button className="btn-small" onClick={() => handleEdit(item)}>✎ Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <ItemFormModal item={modal.item} sports={sports} onClose={handleCloseModal} onSaved={handleSaved} />
            )}
        </>
    );
}