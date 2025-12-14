// Centralized API exports: consolidate future REST helpers here.
import api from "./axios";
import type { AxiosRequestConfig } from "axios";

export * from "./auth"; // exports publicRoutes / helpers

// Example helper wrappers (extend as needed):
export const get = (url: string, config?: AxiosRequestConfig) => api.get(url, config).then(r => r.data);
export const post = (url: string, data?: unknown, config?: AxiosRequestConfig) => api.post(url, data, config).then(r => r.data);
export const put = (url: string, data?: unknown, config?: AxiosRequestConfig) => api.put(url, data, config).then(r => r.data);
export const del = (url: string, config?: AxiosRequestConfig) => api.delete(url, config).then(r => r.data);

export { api };
