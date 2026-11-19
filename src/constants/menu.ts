import { Ionicons } from "@expo/vector-icons";

export type Rol = "alumno" | "jefe_oficina" | "jefe_depa" | "admin";
export const ROLES: Record<string, Rol> = {
  ALUMNO: "alumno",
  JEFE_OFICINA: "jefe_oficina",
  JEFE_DEPA: "jefe_depa",
  ADMIN: "admin",
};
export const ETIQUETA_ROL: Record<Rol, string> = {
  alumno: "Alumno",
  jefe_oficina: "Jefe de oficina",
  jefe_depa: "Jefe de departamento",
  admin: "Administrador",
};

export type MenuItem = {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  roles: Rol[];
};

export const MENU: MenuItem[] = [
  {
    label: "Inicio",
    href: "/inicio-alumno",
    icon: "home-outline",
    roles: ["alumno"],
  },
  {
    label: "Inicio",
    href: "/inicio",
    icon: "home-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Actualizar datos",
    href: "/actualizar-datos",
    icon: "person-outline",
    roles: ["alumno"],
  },
  {
    label: "Actualizar contraseña",
    href: "/actualizar-contrasena",
    icon: "person-outline",
    roles: ["alumno"],
  },
  {
    label: "Banco de programas",
    href: "/banco-propuestas",
    icon: "albums-outline",
    roles: ["alumno", "jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Registrar programa",
    href: "/registrar-programa",
    icon: "create-outline",
    roles: ["alumno", "admin"],
  },
  {
    label: "Estatus de propuestas",
    href: "/estatus-propuestas",
    icon: "time-outline",
    roles: ["alumno"],
  },
  {
    label: "Formatos",
    href: "/formatos",
    icon: "download-outline",
    roles: ["alumno"],
  },
  {
    label: "Subir documentos",
    href: "/subir-documentos",
    icon: "download-outline",
    roles: ["alumno", "admin"],
  },
  {
    label: "Mis documentos",
    href: "/mis-documentos",
    icon: "folder-outline",
    roles: ["alumno"],
  },

  {
    label: "Alta alumnos",
    href: "/alta-alumnos",
    icon: "person-add-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Alumnos en Servicio Social",
    href: "/listado-alumnos",
    icon: "calendar-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Registrar programa interno",
    href: "/registrar-programa-interno",
    icon: "list-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Validar propuestas",
    href: "/validar-propuestas",
    icon: "shield-checkmark-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Validar documentos",
    href: "/validar-documentos",
    icon: "document-text-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: "bar-chart-outline",
    roles: ["jefe_oficina", "admin"],
  },
  {
    label: "Historial de documentación",
    href: "/historial-documentos",
    icon: "bar-chart-outline",
    roles: ["jefe_oficina", "jefe_depa", "admin"],
  },

  {
    label: "Registro jefes",
    href: "/registrar-jefes",
    icon: "people-outline",
    roles: ["admin"],
  },
  {
    label: "Constancia de Finalización",
    href: "/constancia",
    icon: "people-outline",
    roles: ["jefe_depa", "admin"],
  },
  // {
  //   label: "Modificación usuarios",
  //   href: "/modificacion-usuarios",
  //   icon: "settings-outline",
  //   roles: ["admin"],
  // },
  {
    label: "Gestión de catálogos",
    href: "/gestionar-catalogos",
    icon: "settings-outline",
    roles: ["admin"],
  },
];

export const menuParaRol = (rol: Rol) =>
  MENU.filter((i) => i.roles.includes(rol));

export const rutaInicio = (rol: Rol) =>
  rol === "alumno" ? "/inicio-alumno" : "/inicio";
