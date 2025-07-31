import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  // baseURL: import.meta.env.VITE_API_BASE_URL || "http://100.27.216.198/api",
});
