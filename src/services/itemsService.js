import { apiClient } from "./apiClient";

// params: { deporte, disponible } (los undefined no se envían)
export const getItems = (params) => apiClient.get("/api/sports/items", { params });

// Disciplinas existentes, para los chips de filtro
export const getSports = () => apiClient.get("/api/sports/items/sports");