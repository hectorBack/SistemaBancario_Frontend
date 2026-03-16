// app/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api", //Puerto de Springboot
});

// INTERCEPTOR: Agrega el token a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data; // Retorna el JwtResponseDTO (token, username, id)
};

export const getDashboardData = async (userId: number) => {
  const response = await api.get(`/dashboard/${userId}`);
  return response.data;
};

export const postTransferencia = async (datos: any) => {
  const response = await api.post("/transferencias", datos);
  return response.data;
};

export const getStats = async (userId: number) => {
  const response = await api.get(`/dashboard/stats/${userId}`);
  return response.data;
};

export default api;