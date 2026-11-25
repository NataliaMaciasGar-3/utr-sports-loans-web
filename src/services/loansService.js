import { apiClient } from "./apiClient";

export const getLoans = () => apiClient.get("/api/sports/loans");

export const createLoan = ({ itemId, cantidad, canchaOActividad }) =>
    apiClient.post("/api/sports/loans", { itemId, cantidad, canchaOActividad });

// se usara el panel de admin más adelante
export const returnLoan = (id, { estadoDevolucion, notas }) =>
    apiClient.patch(`/api/sports/loans/${id}/return`, { estadoDevolucion, notas });