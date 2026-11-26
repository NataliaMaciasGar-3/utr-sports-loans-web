import "./StatusPage.css";

export default function StatusPage({ icon, code, title, text, buttonLabel, onAction }) {
    return (
        <div className="status-page">
            <div className="status-card">
                <div className="status-card__icon">{icon}</div>
                <span className="status-card__code">{code}</span>
                <h1>{title}</h1>
                <p>{text}</p>
                <button className="btn-primary status-card__btn" onClick={onAction}>
                    ← {buttonLabel}
                </button>
            </div>
        </div>
    );
}