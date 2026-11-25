const STATUS_CLASS = {
    NUEVO: "badge--new",
    BUENO: "badge--good",
    DESGASTADO: "badge--worn",
};

export default function ItemCard({ item, onRequest }) {
    const soldOut = item.disponibles === 0;

    return (
        <article className="item-card">
            <div className="item-card__top">
                <span className="badge badge--code">{item.codigo}</span>
                <span className={`badge ${STATUS_CLASS[item.estadoFisico] || ""}`}>{item.estadoFisico}</span>
            </div>

            <p className="item-card__sport">{item.deporte}</p>
            <h3 className="item-card__name">{item.nombre}</h3>

            <div className="item-card__stock">
                <span>Stock disponible</span>
                <strong>{item.disponibles} / {item.cantidadTotal}</strong>
            </div>

            <button
                className="btn-request"
                onClick={() => onRequest(item)}
                disabled={soldOut}
            >
                {soldOut ? "Agotado" : "⊕ Solicitar préstamo"}
            </button>
        </article>
    );
}