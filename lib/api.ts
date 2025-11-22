// Centralized API exports: consolidate future REST helpers here.
import api from "./axios";

export * from "./auth"; // exports publicRoutes / helpers

// Example helper wrappers (extend as needed):
export const get = (url: string, config?: any) => api.get(url, config).then(r => r.data);
export const post = (url: string, data?: any, config?: any) => api.post(url, data, config).then(r => r.data);
export const put = (url: string, data?: any, config?: any) => api.put(url, data, config).then(r => r.data);
export const del = (url: string, config?: any) => api.delete(url, config).then(r => r.data);

export { api };
