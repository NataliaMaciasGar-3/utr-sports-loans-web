import { apiClient } from "./apiClient";

// params: { deporte, disponible } (los undefined no se envían)
export const getItems = (params) => apiClient.get("/api/sports/items", { params });

// Disciplinas existentes, para los chips de filtro
export const getSports = () => apiClient.get("/api/sports/items/sports");

export const createItem = ({ codigo, nombre, deporte, estadoFisico, cantidadTotal }) =>
    apiClient.post("/api/sports/items", { codigo, nombre, deporte, estadoFisico, cantidadTotal });

// changes: solo los campos que cambiaron (estadoFisico y/o cantidadTotal)
export const updateItem = (id, changes) => apiClient.patch(`/api/sports/items/${id}`, changes);