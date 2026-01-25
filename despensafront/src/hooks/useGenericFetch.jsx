import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export const useGenericFetch = () => {
  const { token, logout } = useContext(AuthContext);

  const genericFetch = async ({
    endpoint,
    method = "GET",
    body = null,
  }) => {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, options);

    if (res.status === 401 || res.status === 403) {
      logout?.();
      throw new Error("Sesión expirada");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Error en la petición");
    }

    return res.json();
  };

  return { genericFetch };
};
