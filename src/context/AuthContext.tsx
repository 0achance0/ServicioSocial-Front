import { Rol } from "@/constants/menu";
import {
  apiFetch,
  borrarToken,
  borrarUsuario,
  cargarFoto,
  guardarToken,
  guardarUsuario,
  leerToken,
  leerUsuario,
  onSesionExpirada,
} from "@/lib/api";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  usuario: string;
  nombre: string;
  apellido_uno: string;
  apellido_dos: string;
  numero_control: any;
  carrera: string;
  semestre: any;
  correo: any;
  telefono: any;
  genero: string;
  estatus: string;
  folio_proyecto: any;
  rol: Rol;
  foto?: string;
};

type DatosLogin = { token: string; rol: Rol; usuario: string; nombre?: string };

type Ctx = {
  user: User | null;
  cargando: boolean;
  login: (d: DatosLogin) => Promise<void>;
  logout: () => Promise<void>;
  cambiarFoto: (uri?: string) => void;
  actualizarUsuario: (datosParciales: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthContext);

function tokenVigente(token: string) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse((globalThis as any).atob(base64));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(async () => {
    await borrarToken();
    await borrarUsuario();
    setUser(null);
  }, []);

  // Trae la foto del alumno
  const traerFoto = useCallback(async (u: User) => {
    if (u.rol !== "alumno" || !u.numero_control) return;
    const foto = await cargarFoto(u.numero_control).catch(() => undefined);
    if (foto)
      setUser((actual) =>
        actual && actual.numero_control === u.numero_control
          ? { ...actual, foto }
          : actual,
      );
  }, []);

  // Pide el perfil completo al backend
  const cargarPerfilCompleto = useCallback(
    async (usuarioBase: string, rolBase: Rol) => {
      try {
        const res = await apiFetch("/api/perfil");
        const perfil = res.datos;

        const uCompleto: User = {
          usuario: perfil.usuario ?? usuarioBase,
          nombre: perfil.nombre ?? "",
          apellido_uno: perfil.apellido_uno ?? "",
          apellido_dos: perfil.apellido_dos ?? "",
          numero_control:
            perfil.numero_control ?? perfil.usuario ?? usuarioBase,
          carrera: perfil.carrera ?? "",
          semestre: perfil.semestre ?? null,
          correo: perfil.correo ?? "",
          telefono: perfil.telefono ?? "",
          genero: perfil.genero ?? "Otro",
          estatus: perfil.estatus ?? "ACTIVO",
          folio_proyecto: perfil.folio_proyecto ?? null,
          rol: rolBase,
        };

        await guardarUsuario(uCompleto);
        setUser(uCompleto);
        traerFoto(uCompleto);
      } catch (error) {
        console.error("Error al cargar el perfil completo", error);
        // Fallback de seguridad por si falla la red
        const uBasico: User = {
          usuario: usuarioBase,
          nombre: usuarioBase,
          apellido_uno: "",
          apellido_dos: "",
          numero_control: null,
          carrera: "",
          semestre: null,
          correo: "",
          telefono: "",
          genero: "Otro",
          estatus: "ACTIVO",
          folio_proyecto: null,
          rol: rolBase,
        };
        setUser(uBasico);
      }
    },
    [traerFoto],
  );

  // Restaurar sesión al abrir la app
  useEffect(() => {
    onSesionExpirada(cerrarSesion);
    (async () => {
      try {
        const token = await leerToken();
        const guardado = await leerUsuario();

        if (token && guardado && tokenVigente(token)) {
          await cargarPerfilCompleto(guardado.usuario, guardado.rol);
        } else {
          await cerrarSesion();
        }
      } finally {
        setCargando(false);
      }
    })();
  }, [cerrarSesion, cargarPerfilCompleto]);

  const login = async (d: DatosLogin) => {
    await guardarToken(d.token);
    await cargarPerfilCompleto(d.usuario, d.rol);
  };

  const cambiarFoto = (uri?: string) => {
    setUser((actual) => (actual ? { ...actual, foto: uri } : actual));
  };

  // Actualiza los datos del usuario y los guarda en el almacenamiento
  const actualizarUsuario = async (datosParciales: Partial<User>) => {
    if (!user) return;

    const usuarioActualizado = { ...user, ...datosParciales };

    setUser(usuarioActualizado);
    await guardarUsuario(usuarioActualizado);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cargando,
        login,
        logout: cerrarSesion,
        cambiarFoto,
        actualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
