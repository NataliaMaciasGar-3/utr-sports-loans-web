import { apiClient } from "./apiClient";

// params: { search, rol, activo } (los undefined no se envían)
export const getUsers = (params) => apiClient.get("/api/users", { params });

export const updateUserRole = (id, rol) => apiClient.patch(`/api/users/${id}/role`, { rol });

export const updateUserStatus = (id, activo) => apiClient.patch(`/api/users/${id}/status`, { activo });
