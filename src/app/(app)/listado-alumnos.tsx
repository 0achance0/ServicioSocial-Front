import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Alumno = {
  numero_control: string;
  nombre: string;
  apellido_uno: string;
  apellido_dos: string | null;
  carrera: string;
  semestre: number;
  correo: string;
  estatus: string;
  folio_proyecto: string | null;
};

export default function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargarAlumnos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/alumnos");
      setAlumnos(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar la lista de alumnos.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const darDeBaja = (numeroControl: string) => {
    Alert.alert(
      "Confirmar baja",
      `¿Estás seguro de dar de baja al alumno con número de control ${numeroControl}? Esta acción desactivará su cuenta.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, dar de baja",
          style: "destructive",
          onPress: () => ejecutarBaja(numeroControl),
        },
      ],
    );
  };

  const ejecutarBaja = async (numeroControl: string) => {
    setProcesando(numeroControl);
    try {
      const res = await apiFetch(`/api/alumnos/${numeroControl}`, {
        method: "DELETE",
      });
      if (res.ok) {
        Alert.alert("Éxito", "El alumno ha sido dado de baja correctamente.");
        cargarAlumnos();
      }
    } catch (error: any) {
      Alert.alert(
        "No se pudo dar de baja",
        error.message || "Error en el servidor.",
      );
    } finally {
      setProcesando(null);
    }
  };

  const renderTarjeta = ({ item }: { item: Alumno }) => {
    const estaProcesando = procesando === item.numero_control;
    const estaInactivo = item.estatus === "INACTIVO";

    return (
      <View style={[styles.card, estaInactivo && { opacity: 0.6 }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>
              {item.nombre} {item.apellido_uno} {item.apellido_dos || ""}
            </Text>
            <Text style={styles.control}>
              No. Control: {item.numero_control}
            </Text>
          </View>
          {estaInactivo && (
            <View style={styles.badgeInactivo}>
              <Text style={styles.badgeInactivoText}>INACTIVO</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.textoInfo}>
            <Text style={styles.negrita}>Carrera: </Text>
            {item.carrera} ({item.semestre}° sem)
          </Text>
          <Text style={styles.textoInfo}>
            <Text style={styles.negrita}>Correo: </Text>
            {item.correo}
          </Text>
          <Text style={styles.textoInfo}>
            <Text style={styles.negrita}>Programa: </Text>
            {item.folio_proyecto ? item.folio_proyecto : "Sin asignar"}
          </Text>
        </View>

        {/* Botón de Baja (solo si está activo) */}
        {!estaInactivo && (
          <Pressable
            style={[styles.botonBaja, estaProcesando && { opacity: 0.7 }]}
            onPress={() => darDeBaja(item.numero_control)}
            disabled={estaProcesando}
          >
            {estaProcesando ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <Text style={styles.botonBajaTexto}>Dar de baja</Text>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  // Filtrar los alumnos según la búsqueda
  const alumnosFiltrados = alumnos.filter(
    (a) =>
      a.numero_control.includes(busqueda) ||
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.apellido_uno.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Alumnos Registrados</Text>
      <Text style={styles.subtitulo}>
        Consulta la información de los alumnos. Puedes darlos de baja si aún no
        tienen un programa asignado.
      </Text>

      {/* Barra de búsqueda */}
      <View style={styles.busquedaContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar por nombre o No. Control..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Cargando alumnos...</Text>
        </View>
      ) : (
        <FlatList
          data={alumnosFiltrados}
          keyExtractor={(item) => item.numero_control}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarAlumnos(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {busqueda
                ? "No se encontraron alumnos con esa búsqueda."
                : "No hay alumnos registrados."}
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
    color: "#0f172a",
  },
  subtitulo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 18,
  },
  busquedaContainer: {
    marginBottom: 16,
  },
  busquedaInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "NotoSerif_400Regular",
    color: "#0f172a",
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
    marginBottom: 12,
  },
  nombre: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 2,
  },
  control: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
  },
  badgeInactivo: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeInactivoText: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 10,
    color: "#64748b",
  },
  infoContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 4,
  },
  textoInfo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#334155",
  },
  negrita: {
    fontFamily: "NotoSerif_700Bold",
  },
  botonBaja: {
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botonBajaTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#ef4444",
    fontSize: 13,
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
