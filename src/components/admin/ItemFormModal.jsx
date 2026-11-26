import { useState } from "react";
import Modal from "../Modal";
import { createItem, updateItem } from "../../services/itemsService";
import { PHYSICAL_STATES } from "../../utils/constants";
import "./ItemFormModal.css";

const OTHER = "__otro__";

export default function ItemFormModal({ item, sports, onClose, onSaved }) {
    const isEdit = Boolean(item);
    const inUse = isEdit ? item.cantidadTotal - item.disponibles : 0; // unidades prestadas ahora

    const [form, setForm] = useState(
        isEdit
            ? { estadoFisico: item.estadoFisico, cantidadTotal: String(item.cantidadTotal) }
            : {
                codigo: "",
                nombre: "",
                deporte: sports[0] ?? OTHER,
                estadoFisico: "NUEVO",
                cantidadTotal: "5",
            }
    );
    const [customSport, setCustomSport] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const isOtherSport = form.deporte === OTHER;

    const clearFieldError = (name) => setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "cantidadTotal" ? value.replace(/\D/g, "") : value,
        }));
        clearFieldError(name);
    };

    const handleCustomSportChange = (e) => {
        setCustomSport(e.target.value);
        clearFieldError("deporte");
    };

    const validate = () => {
        const errors = {};
        const qty = Number(form.cantidadTotal);
        if (!isEdit) {
            if (!form.codigo.trim()) errors.codigo = "Indica el código";
            if (!form.nombre.trim()) errors.nombre = "Indica el nombre";
            if (isOtherSport && !customSport.trim()) errors.deporte = "Indica el deporte";
        }
        if (!form.cantidadTotal || qty < 1) errors.cantidadTotal = "Indica al menos 1 unidad";
        else if (isEdit && qty < inUse) {
            errors.cantidadTotal = `No puede ser menor a los ${inUse} artículos prestados`;
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;

        setLoading(true);
        try {
            if (isEdit) {
                const changes = {};
                if (form.estadoFisico !== item.estadoFisico) changes.estadoFisico = form.estadoFisico;
                if (Number(form.cantidadTotal) !== item.cantidadTotal) {
                    changes.cantidadTotal = Number(form.cantidadTotal);
                }
                if (!Object.keys(changes).length) {
                    setError("No hiciste ningún cambio.");
                    setLoading(false);
                    return;
                }
                await updateItem(item.id, changes);
                onSaved("Ítem actualizado correctamente");
            } else {
                await createItem({
                    codigo: form.codigo.trim(),
                    nombre: form.nombre.trim(),
                    deporte: isOtherSport ? customSport.trim() : form.deporte,
                    estadoFisico: form.estadoFisico,
                    cantidadTotal: Number(form.cantidadTotal),
                });
                onSaved("Ítem registrado correctamente");
            }
        } catch (err) {
            if (err.errors?.length) {
                setFieldErrors(Object.fromEntries(err.errors.map((x) => [x.campo, x.mensaje])));
            } else {
                setError(err.message); // por ejemplo 409: código duplicado
            }
            setLoading(false);
        }
    };

    return (
        <Modal title={isEdit ? "Editar ítem" : "Nuevo ítem deportivo"} onClose={onClose} busy={loading}>
            <form className="modal__body form-modal" onSubmit={handleSubmit} noValidate>
                {error && <div className="alert" role="alert">⚠ {error}</div>}

                {isEdit ? (
                    <div className="loan-item">
                        <span className="loan-item__top">{item.codigo}</span>
                        <strong>{item.nombre}</strong>
                        <span className="loan-item__stock">En préstamo activo: {inUse}</span>
                    </div>
                ) : (
                    <>
                        <div className="field">
                            <label htmlFor="codigo">Código</label>
                            <input
                                id="codigo"
                                name="codigo"
                                placeholder="Ej. DEP-08"
                                value={form.codigo}
                                onChange={handleChange}
                                className={fieldErrors.codigo ? "is-invalid" : ""}
                                autoComplete="off"
                            />
                            {fieldErrors.codigo && <span className="field__error">{fieldErrors.codigo}</span>}
                        </div>

                        <div className="field">
                            <label htmlFor="deporte">Deporte</label>
                            <select
                                id="deporte"
                                name="deporte"
                                value={form.deporte}
                                onChange={handleChange}
                                className={fieldErrors.deporte && !isOtherSport ? "is-invalid" : ""}
                            >
                                {sports.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                                <option value={OTHER}>Otro deporte…</option>
                            </select>
                            {isOtherSport && (
                                <input
                                    aria-label="Nombre del deporte"
                                    placeholder="Ej. Natación"
                                    value={customSport}
                                    onChange={handleCustomSportChange}
                                    className={fieldErrors.deporte ? "is-invalid" : ""}
                                    autoComplete="off"
                                />
                            )}
                            {fieldErrors.deporte && <span className="field__error">{fieldErrors.deporte}</span>}
                        </div>

                        <div className="field">
                            <label htmlFor="nombre">Nombre del artículo</label>
                            <input
                                id="nombre"
                                name="nombre"
                                placeholder="Ej. Petos de entrenamiento (Set 12)"
                                value={form.nombre}
                                onChange={handleChange}
                                className={fieldErrors.nombre ? "is-invalid" : ""}
                                autoComplete="off"
                            />
                            {fieldErrors.nombre && <span className="field__error">{fieldErrors.nombre}</span>}
                        </div>
                    </>
                )}

                <div className="field">
                    <label htmlFor="estadoFisico">Estado físico</label>
                    <select id="estadoFisico" name="estadoFisico" value={form.estadoFisico} onChange={handleChange}>
                        {PHYSICAL_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {fieldErrors.estadoFisico && <span className="field__error">{fieldErrors.estadoFisico}</span>}
                </div>

                <div className="field">
                    <label htmlFor="cantidadTotal">Cantidad total</label>
                    <input
                        id="cantidadTotal"
                        name="cantidadTotal"
                        inputMode="numeric"
                        value={form.cantidadTotal}
                        onChange={handleChange}
                        className={fieldErrors.cantidadTotal ? "is-invalid" : ""}
                        autoComplete="off"
                    />
                    {fieldErrors.cantidadTotal ? (
                        <span className="field__error">{fieldErrors.cantidadTotal}</span>
                    ) : (
                        isEdit && (
                            <span className="field__help">
                                La cantidad total no puede ser menor a los {inUse} artículos prestados.
                            </span>
                        )
                    )}
                </div>

                <div className="modal__actions">
                    <button type="button" className="btn-outline btn-block" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary btn-block" disabled={loading}>
                        {loading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar ítem"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}