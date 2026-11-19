import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AlumnoCarta = {
  numero_control: string;
  nombre: string;
  apellido_uno: string;
  apellido_dos: string | null;
  carrera: string;
  folio_proyecto: string;
  carta_habilitada: boolean;
};

export default function HabilitarCartas() {
  const [alumnos, setAlumnos] = useState<AlumnoCarta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargarAlumnos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/cartas");
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

  const habilitarCarta = async (numeroControl: string) => {
    setProcesando(numeroControl);
    try {
      const res = await apiFetch(`/api/cartas/${numeroControl}/habilitar`, {
        method: "PATCH",
      });
      if (res.ok) {
        Alert.alert("Éxito", "Carta de terminación habilitada correctamente.");
        cargarAlumnos(); // Recargar la lista
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo habilitar la carta.");
    } finally {
      setProcesando(null);
    }
  };

  const renderTarjeta = ({ item }: { item: AlumnoCarta }) => {
    const estaProcesando = procesando === item.numero_control;

    return (
      <View
        style={[styles.card, item.carta_habilitada && styles.cardHabilitada]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>
              {item.nombre} {item.apellido_uno} {item.apellido_dos || ""}
            </Text>
            <Text style={styles.control}>
              No. Control: {item.numero_control}
            </Text>
            <Text style={styles.carrera}>
              {item.carrera} | Folio: {item.folio_proyecto}
            </Text>
          </View>
          {item.carta_habilitada && (
            <View style={styles.badgeHabilitado}>
              <Text style={styles.badgeHabilitadoText}>HABILITADA</Text>
            </View>
          )}
        </View>

        {!item.carta_habilitada ? (
          <Pressable
            style={[styles.botonHabilitar, estaProcesando && { opacity: 0.7 }]}
            onPress={() => habilitarCarta(item.numero_control)}
            disabled={estaProcesando}
          >
            {estaProcesando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.botonHabilitarTexto}>
                Habilitar Carta de Terminación
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.accionesHabilitadas}>
            <Text style={styles.textoHabilitado}>
              El alumno ya puede descargar su carta de terminación desde su
              perfil.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cartas de Terminación</Text>
      <Text style={styles.subtitulo}>
        Verifica los requisitos del alumno y habilita su carta para que pueda
        imprimirla.
      </Text>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Cargando alumnos...</Text>
        </View>
      ) : (
        <FlatList
          data={alumnos}
          keyExtractor={(item) => item.numero_control}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarAlumnos(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay alumnos con programas asignados actualmente.
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
    marginBottom: 20,
    lineHeight: 18,
  },
  lista: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#cbd5e1",
    elevation: 2,
  },
  cardHabilitada: {
    borderLeftColor: "#10b981", // Verde si ya está habilitada
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
    marginBottom: 4,
  },
  control: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
  },
  carrera: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#94a3b8",
  },
  badgeHabilitado: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeHabilitadoText: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 10,
    color: "#166534",
  },
  botonHabilitar: {
    backgroundColor: "#09134b",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  botonHabilitarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 14,
  },
  accionesHabilitadas: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  textoHabilitado: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#166534",
    textAlign: "center",
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
