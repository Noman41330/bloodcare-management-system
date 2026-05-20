import axios from "axios";


// Base API connection
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});


// Request interceptor = add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;