import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080", // Change to backend URL
});

instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
