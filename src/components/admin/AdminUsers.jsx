import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUsers, updateUserRole, updateUserStatus } from "../../services/usersService";
import ConfirmModal from "./ConfirmModal";
import formatDate from "../../utils/format";

const AdminUsers = () => {
    const { user: me } = useAuth();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [rol, setRol] = useState("");
    const [activo, setActivo] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [modal, setModal] = useState(null); // { type: "role" | "status", user }
    const [notice, setNotice] = useState("");

    // Espera a que el usuario deje de escribir
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search.trim()), 500);
        return () => clearTimeout(id);
    }, [search]);

    useEffect(() => {
        let cancelled = false;

        const loadUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getUsers({
                    search: debouncedSearch || undefined,
                    rol: rol || undefined,
                    activo: activo || undefined,
                });
                if (!cancelled) setUsers(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadUsers();
        return () => {
            cancelled = true;
        };
    }, [debouncedSearch, rol, activo, reloadKey]);

    // El aviso de éxito desaparece solo
    useEffect(() => {
        if (!notice) return;
        const id = setTimeout(() => setNotice(""), 4000);
        return () => clearTimeout(id);
    }, [notice]);

    const handleSearchChange = (e) => setSearch(e.target.value);
    const handleRolChange = (e) => setRol(e.target.value);
    const handleActivoChange = (e) => setActivo(e.target.value);
    const handleRetry = () => setReloadKey((k) => k + 1);
    const handleClearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setRol("");
        setActivo("");
    };
    const handleAskRole = (user) => setModal({ type: "role", user });
    const handleAskStatus = (user) => setModal({ type: "status", user });
    const handleCloseModal = () => setModal(null);

    const handleConfirm = async () => {
        const { type, user } = modal;
        if (type === "role") {
            await updateUserRole(user.id, user.rol === "ADMIN" ? "USER" : "ADMIN");
            setNotice(`Rol de ${user.nombre} actualizado.`);
        } else {
            await updateUserStatus(user.id, !user.activo);
            setNotice(`${user.nombre} fue ${user.activo ? "desactivado" : "activado"}.`);
        }
        setModal(null);
        setReloadKey((k) => k + 1);
    };

    const hasFilters = Boolean(debouncedSearch || rol || activo);

    const renderModal = () => {
        if (!modal) return null;
        const { type, user } = modal;

        if (type === "role") {
            const makeAdmin = user.rol !== "ADMIN";
            return (
                <ConfirmModal
                    title={makeAdmin ? "Dar rol de administrador" : "Quitar rol de administrador"}
                    confirmLabel={makeAdmin ? "Hacer administrador" : "Quitar administrador"}
                    onConfirm={handleConfirm}
                    onClose={handleCloseModal}
                >
                    {makeAdmin ? (
                        <p><strong>{user.nombre}</strong> podrá crear y editar material, registrar devoluciones y gestionar usuarios.</p>
                    ) : (
                        <p><strong>{user.nombre}</strong> volverá a ser un usuario normal y perderá el acceso al panel de administración.</p>
                    )}
                </ConfirmModal>
            );
        }

        return (
            <ConfirmModal
                title={user.activo ? "Desactivar usuario" : "Activar usuario"}
                confirmLabel={user.activo ? "Desactivar" : "Activar"}
                onConfirm={handleConfirm}
                onClose={handleCloseModal}
            >
                {user.activo ? (
                    <p><strong>{user.nombre}</strong> no podrá iniciar sesión y su sesión actual se cerrará en su siguiente petición.</p>
                ) : (
                    <p><strong>{user.nombre}</strong> podrá volver a iniciar sesión.</p>
                )}
            </ConfirmModal>
        );
    };

    return (
        <>
            <div className="admin-filters">
                <input
                    className="search"
                    type="search"
                    placeholder="Buscar por nombre, matrícula o correo"
                    value={search}
                    onChange={handleSearchChange}
                />
                <select className="filter-select" value={rol} onChange={handleRolChange} aria-label="Filtrar por rol">
                    <option value="">Todos los roles</option>
                    <option value="USER">Alumnos (USER)</option>
                    <option value="ADMIN">Administradores (ADMIN)</option>
                </select>
                <select className="filter-select" value={activo} onChange={handleActivoChange} aria-label="Filtrar por estado">
                    <option value="">Todos los estados</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                </select>
            </div>

            <div className="admin-bar">
                <span className="admin-bar__count">
                    Usuarios: <strong>{loading ? "…" : users.length}</strong>
                </span>
            </div>

            {notice && <div className="toast" role="status">✓ {notice}</div>}

            {loading && <div className="state"><p>Cargando usuarios...</p></div>}

            {!loading && error && (
                <div className="state state--error">
                    <h2>No pudimos cargar los usuarios</h2>
                    <p>{error}</p>
                    <button className="btn-request btn-request--inline" onClick={handleRetry}>Reintentar</button>
                </div>
            )}

            {!loading && !error && users.length === 0 && (
                <div className="state">
                    <div className="state__icon">
                        <img src="/public/compass-status-icon.png" alt="compass" width="30" height="30" />
                    </div>
                    <h2>{hasFilters ? "No hay usuarios con estos filtros" : "Aún no hay usuarios registrados"}</h2>
                    {hasFilters && (
                        <>
                            <p>Prueba con otro nombre, matrícula o correo, o cambia los filtros.</p>
                            <button className="btn-request btn-request--inline" onClick={handleClearFilters}>
                                ↺ Limpiar filtros
                            </button>
                        </>
                    )}
                </div>
            )}

            {!loading && !error && users.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Matrícula</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Registro</th>
                                <th className="actions">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const isMe = user.id === me.id;
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <strong>{user.nombre}</strong>
                                            {isMe && <span className="badge badge--you">Tú</span>}
                                        </td>
                                        <td><span className="badge badge--code">{user.matricula}</span></td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={"badge " + (user.rol === "ADMIN" ? "badge--admin" : "badge--done")}>
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={"badge " + (user.activo ? "badge--active" : "badge--inactive")}>
                                                {user.activo ? "ACTIVO" : "INACTIVO"}
                                            </span>
                                        </td>
                                        <td className="muted">{formatDate(user.createdAt)}</td>
                                        <td className="actions">
                                            <div className="row-actions">
                                                <button
                                                    className="btn-small"
                                                    onClick={() => handleAskRole(user)}
                                                    disabled={isMe}
                                                    title={isMe ? "No puedes cambiar tu propio rol" : undefined}
                                                >
                                                    {user.rol === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                                                </button>
                                                <button
                                                    className="btn-small"
                                                    onClick={() => handleAskStatus(user)}
                                                    disabled={isMe}
                                                    title={isMe ? "No puedes desactivarte a ti mismo" : undefined}
                                                >
                                                    {user.activo ? "Desactivar" : "Activar"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {renderModal()}
        </>
    );
}

export default AdminUsers;