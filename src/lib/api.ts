import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// En el .env del front:  EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
// (en celular usa la IP de tu PC; en web sirve http://localhost:3000)
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// ---------- Almacenamiento: SecureStore en celular, localStorage en web ----------
const almacen = {
  leer: async (k: string) =>
    Platform.OS === "web"
      ? localStorage.getItem(k)
      : SecureStore.getItemAsync(k),
  guardar: async (k: string, v: string) => {
    if (Platform.OS === "web") localStorage.setItem(k, v);
    else await SecureStore.setItemAsync(k, v);
  },
  borrar: async (k: string) => {
    if (Platform.OS === "web") localStorage.removeItem(k);
    else await SecureStore.deleteItemAsync(k);
  },
};

export const guardarToken = (t: string) => almacen.guardar("token", t);
export const leerToken = () => almacen.leer("token");
export const borrarToken = () => almacen.borrar("token");

// Datos básicos del usuario (sin la foto: SecureStore tiene un límite de tamaño)
export const guardarUsuario = (u: object) =>
  almacen.guardar("usuario", JSON.stringify(u));
export const borrarUsuario = () => almacen.borrar("usuario");
export const leerUsuario = async () => {
  try {
    const texto = await almacen.leer("usuario");
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
};

// ---------- Peticiones a la API ----------
export class ApiError extends Error {
  status: number;
  errores?: { campo: string; mensaje: string }[];
  constructor(
    status: number,
    mensaje: string,
    errores?: { campo: string; mensaje: string }[],
  ) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

// El AuthContext se registra aquí para cerrar la sesión cuando la API responde 401
let alExpirarSesion: (() => void) | null = null;
export const onSesionExpirada = (fn: () => void) => {
  alExpirarSesion = fn;
};

export async function apiFetch(ruta: string, opciones: RequestInit = {}) {
  const token = await leerToken();
  const headers: Record<string, string> = {
    ...(opciones.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  // Con FormData NO se pone Content-Type: lo arma solo, con su boundary
  if (opciones.body && !(opciones.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }

  const json = await res.json().catch(() => ({}));
  // 401 con token guardado = sesión vencida (el token dura 2 horas)
  if (res.status === 401 && token) alExpirarSesion?.();
  if (!res.ok)
    throw new ApiError(
      res.status,
      json.mensaje ?? "Error inesperado",
      json.errores,
    );
  return json;
}

// La foto requiere sesión: se descarga con el token y se convierte a data URL
export async function cargarFoto(
  numeroControl: string,
): Promise<string | undefined> {
  const token = await leerToken();
  if (!token) return undefined;
  const res = await fetch(`${API_URL}/api/perfil/foto/${numeroControl}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return undefined;
  const blob = await res.blob();
  return new Promise((ok, fallo) => {
    const lector = new FileReader();
    lector.onloadend = () => ok(lector.result as string);
    lector.onerror = fallo;
    lector.readAsDataURL(blob);
  });
}
