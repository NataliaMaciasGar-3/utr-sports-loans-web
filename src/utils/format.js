const formatDate = (value) => {
    return value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";
};

export default formatDate;