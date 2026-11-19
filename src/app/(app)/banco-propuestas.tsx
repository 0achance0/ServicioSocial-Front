import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProgramaBanco = {
  folio: string;
  tipo: string;
  nombre_programa: string;
  responsable_programa: string;
  puesto_responsable: string;
  area: string;
  actividades: string;
  objetivo: string;
  descripcion: string;
  alumnos_solicitados: number;
  cupo_ocupado: number;
  cupo_disponible: number;
  horario_inicio: string;
  horario_fin: string;
  asesor_servicio_social: string;
  nombre_institucion: string;
  telefono_institucion: string;
  calle_institucion: string;
  numero_institucion: string;
  ciudad_institucion: string;
  cp_institucion: string;
  vigente: boolean;
};

export default function BancoProgramas() {
  const { user, actualizarUsuario } = useAuth();
  const [programas, setProgramas] = useState<ProgramaBanco[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<"TODOS" | "INTERNA" | "EXTERNA">(
    "TODOS",
  );
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  const esPersonal =
    user?.rol === "jefe_oficina" ||
    user?.rol === "jefe_depa" ||
    user?.rol === "admin";
  const esAlumno = user?.rol === "alumno";

  const cargarProgramas = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);

    setMensaje("");

    try {
      let url = "/api/banco?";
      if (filtro !== "TODOS") url += `tipo=${filtro}&`;
      if (soloDisponibles) url += `disponibles=true&`;

      const res = await apiFetch(url);
      setProgramas(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar el banco de programas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarProgramas();
  }, [filtro, soloDisponibles]);

  const actualizarBanco = async () => {
    setCargando(true);
    try {
      const res = await apiFetch("/api/banco/actualizar", { method: "POST" });
      if (res.ok) {
        Alert.alert("Éxito", res.mensaje || "Banco actualizado correctamente");
        cargarProgramas();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el banco");
    } finally {
      setCargando(false);
    }
  };

  const seleccionarPrograma = async (folio: string) => {
    if (user?.folio_proyecto) {
      Alert.alert(
        "Atención",
        "Ya tienes un programa asignado. No puedes seleccionar otro.",
      );
      return;
    }

    if (Platform.OS === "web") {
      const confirmar = window.confirm(
        `¿Estás seguro de seleccionar el programa ${folio}?`,
      );
      if (!confirmar) return;
      await ejecutarSeleccion(folio);
    } else {
      Alert.alert(
        "Confirmar selección",
        `¿Estás seguro de seleccionar el programa ${folio}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sí, seleccionar", onPress: () => ejecutarSeleccion(folio) },
        ],
      );
    }
  };

  const ejecutarSeleccion = async (folio: string) => {
    setCargando(true);
    setMensaje("");
    try {
      const res = await apiFetch("/api/seleccionar", {
        method: "POST",
        body: JSON.stringify({ folio }),
      });

      if (res.ok) {
        Alert.alert("Éxito", res.mensaje || "Programa seleccionado con éxito");

        // 2. ACTUALIZAMOS
        await actualizarUsuario({ folio_proyecto: folio });

        // Recargamos la lista para reflejar el cambio de cupo
        cargarProgramas();
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo seleccionar el programa",
      );
    } finally {
      setCargando(false);
    }
  };

  const toggleExpandir = (folio: string) => {
    setExpandido(expandido === folio ? null : folio);
  };

  const renderTarjeta = ({ item }: { item: ProgramaBanco }) => {
    const sinCupo = item.cupo_disponible <= 0;
    const estaExpandido = expandido === item.folio;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.folio}>{item.folio}</Text>
            <Text style={styles.nombre}>{item.nombre_programa}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.tipo}</Text>
          </View>
        </View>

        {/* Resumen rápido sin emojis */}
        <View style={styles.resumenContainer}>
          <Text style={styles.textoInfo}>Área: {item.area}</Text>
          <Text style={styles.textoInfo}>
            Horario: {item.horario_inicio} - {item.horario_fin}
          </Text>
        </View>

        <View style={styles.cupoContainer}>
          <Text style={styles.cupoTexto}>
            Cupo: {item.cupo_ocupado} / {item.alumnos_solicitados}
          </Text>
          <Text
            style={[styles.cupoDisponible, sinCupo && { color: "#dc2626" }]}
          >
            {sinCupo ? "Sin cupo" : `${item.cupo_disponible} disponibles`}
          </Text>
        </View>

        <Pressable
          style={styles.botonExpandir}
          onPress={() => toggleExpandir(item.folio)}
        >
          <Text style={styles.botonExpandirTexto}>
            {estaExpandido ? "Ocultar detalles ▲" : "Ver detalles completos ▼"}
          </Text>
        </Pressable>

        {estaExpandido && (
          <View style={styles.detallesContainer}>
            <Text style={styles.seccionTitulo}>Descripción y Objetivo</Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Objetivo: </Text>
              {item.objetivo}
            </Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Actividades: </Text>
              {item.actividades}
            </Text>
            {item.descripcion && (
              <Text style={styles.detalleTexto}>
                <Text style={styles.negrita}>Descripción: </Text>
                {item.descripcion}
              </Text>
            )}

            <Text style={styles.seccionTitulo}>Responsables</Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Responsable: </Text>
              {item.responsable_programa} ({item.puesto_responsable})
            </Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Asesor SS: </Text>
              {item.asesor_servicio_social}
            </Text>

            <Text style={styles.seccionTitulo}>Institución</Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Nombre: </Text>
              {item.nombre_institucion}
            </Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Dirección: </Text>
              {item.calle_institucion} {item.numero_institucion},{" "}
              {item.ciudad_institucion}, C.P. {item.cp_institucion}
            </Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Teléfono: </Text>
              {item.telefono_institucion}
            </Text>
          </View>
        )}

        {esAlumno && (
          <Pressable
            style={[
              styles.boton,
              (sinCupo || !!user?.folio_proyecto) && styles.botonDeshabilitado,
            ]}
            onPress={() => seleccionarPrograma(item.folio)}
            disabled={sinCupo || !!user?.folio_proyecto || cargando}
          >
            <Text style={styles.botonTexto}>
              {user?.folio_proyecto === item.folio
                ? "Ya seleccionado"
                : sinCupo
                  ? "Sin cupo"
                  : "Seleccionar Programa"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Banco de Programas</Text>

      <View style={styles.filtrosContainer}>
        <View style={styles.filtrosTipo}>
          {(["TODOS", "INTERNA", "EXTERNA"] as const).map((t) => (
            <Pressable
              key={t}
              style={[
                styles.filtroBoton,
                filtro === t && styles.filtroBotonActivo,
              ]}
              onPress={() => setFiltro(t)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtro === t && styles.filtroTextoActivo,
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setSoloDisponibles(!soloDisponibles)}
        >
          <View
            style={[styles.checkbox, soloDisponibles && styles.checkboxActivo]}
          />
          <Text style={styles.checkboxLabel}>Solo con cupo disponible</Text>
        </Pressable>
      </View>

      {esPersonal && (
        <Pressable
          style={styles.botonActualizar}
          onPress={actualizarBanco}
          disabled={cargando}
        >
          <Text style={styles.botonTexto}>
            Publicar propuestas internas pendientes
          </Text>
        </Pressable>
      )}

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Cargando programas...</Text>
        </View>
      ) : (
        <FlatList
          data={programas}
          keyExtractor={(item) => item.folio}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarProgramas(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay programas que coincidan con los filtros.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  titulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 24,
    marginBottom: 16,
    color: "#0f172a",
  },
  filtrosContainer: {
    marginBottom: 16,
    gap: 12,
  },
  filtrosTipo: {
    flexDirection: "row",
    gap: 8,
  },
  filtroBoton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  filtroBotonActivo: {
    backgroundColor: "#09134b",
  },
  filtroTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#475569",
  },
  filtroTextoActivo: {
    color: "#fff",
    fontFamily: "NotoSerif_700Bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#94a3b8",
    borderRadius: 4,
  },
  checkboxActivo: {
    backgroundColor: "#09134b",
    borderColor: "#09134b",
  },
  checkboxLabel: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#334155",
  },
  botonActualizar: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  lista: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#09134b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  folio: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  nombre: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 18,
    color: "#1e293b",
    paddingRight: 8,
  },
  badge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 12,
    color: "#475569",
  },
  resumenContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  textoInfo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#64748b",
  },
  cupoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cupoTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#475569",
  },
  cupoDisponible: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#16a34a",
  },
  botonExpandir: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  botonExpandirTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#09134b",
  },
  detallesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    gap: 8,
  },
  seccionTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#0f172a",
    marginTop: 4,
    marginBottom: 2,
  },
  detalleTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  negrita: {
    fontFamily: "NotoSerif_700Bold",
  },
  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  botonDeshabilitado: {
    backgroundColor: "#cbd5e1",
  },
  botonTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 14,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cargandoTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
  },
  vacio: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 24,
  },
  mensajeError: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
});
