import { useAuth } from "@/context/AuthContext";
import { API_URL, apiFetch, leerToken } from "@/lib/api";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
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

type Formato = {
  tipo: string;
  nombre: string;
};

type ExpedienteInfo = {
  expedienteCompleto: boolean;
  faltantes: string[];
  formatos: Formato[];
};

export default function Formatos() {
  const { user } = useAuth();
  const [info, setInfo] = useState<ExpedienteInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [descargando, setDescargando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  const cargarFormatos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/documentos/formatos");
      setInfo(res.datos);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar los formatos.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarFormatos();
  }, []);

  const descargarFormato = async (tipo: string) => {
    setDescargando(tipo);
    setMensaje("");

    try {
      if (Platform.OS === "web") {
        // --- Lógica para WEB ---
        const token = await leerToken();
        const response = await fetch(
          `${API_URL}/api/documentos/generar/${tipo}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.mensaje || "Error al generar el documento");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${tipo}_${user?.numero_control}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // --- Lógica para MÓVIL (Expo) ---
        const token = await leerToken();

        // Creamos el destino aquí adentro, donde 'tipo' sí existe
        const destination = new File(
          Paths.document,
          `${tipo}_${user?.numero_control}.docx`,
        );

        const downloadedFile = await File.downloadFileAsync(
          `${API_URL}/api/documentos/generar/${tipo}`,
          destination,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (downloadedFile.exists) {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadedFile.uri);
          }
        } else {
          throw new Error("No se pudo descargar el archivo");
        }
      }
    } catch (error: any) {
      Alert.alert(
        "Atención",
        error.message || "No se pudo descargar el documento.",
      );
    } finally {
      setDescargando(null);
    }
  };

  const renderTarjeta = ({ item }: { item: Formato }) => {
    const estaDescargando = descargando === item.tipo;

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.tipo}>Formato oficial</Text>
        </View>

        <Pressable
          style={[styles.boton, estaDescargando && styles.botonDeshabilitado]}
          onPress={() => descargarFormato(item.tipo)}
          disabled={estaDescargando || !info?.expedienteCompleto}
        >
          {estaDescargando ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.botonTexto}>Descargar</Text>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Formatos y Documentos</Text>
      <Text style={styles.subtitulo}>
        Descarga los formatos oficiales para tu Servicio Social. Los documentos
        se generan automáticamente con tus datos y los del programa asignado.
      </Text>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Verificando expediente...</Text>
        </View>
      ) : (
        <>
          {/* Aviso de expediente incompleto */}
          {info && !info.expedienteCompleto && (
            <View style={styles.alertaRoja}>
              <Text style={styles.alertaTitulo}>Expediente incompleto</Text>
              <Text style={styles.alertaTexto}>
                Para poder descargar tus documentos, primero debes completar lo
                siguiente:
              </Text>
              <View style={styles.listaFaltantes}>
                {info.faltantes.map((faltante, index) => (
                  <Text key={index} style={styles.bullet}>
                    • {faltante}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Aviso de expediente completo */}
          {info && info.expedienteCompleto && (
            <View style={styles.alertaVerde}>
              <Text style={styles.alertaVerdeTexto}>
                Tu expediente está completo. Ya puedes descargar tus formatos.
              </Text>
            </View>
          )}

          <FlatList
            data={info?.formatos || []}
            keyExtractor={(item) => item.tipo}
            renderItem={renderTarjeta}
            contentContainerStyle={styles.lista}
            refreshing={refrescando}
            onRefresh={() => cargarFormatos(true)}
            ListEmptyComponent={
              <Text style={styles.vacio}>
                No hay formatos disponibles en este momento.
              </Text>
            }
          />
        </>
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
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  nombre: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  tipo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  botonDeshabilitado: {
    backgroundColor: "#cbd5e1",
  },
  botonTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 13,
  },
  alertaRoja: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  alertaTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 15,
    color: "#991b1b",
    marginBottom: 4,
  },
  alertaTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#991b1b",
    marginBottom: 8,
  },
  listaFaltantes: {
    marginLeft: 8,
  },
  bullet: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#991b1b",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  alertaVerde: {
    backgroundColor: "#dcfce7",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  alertaVerdeTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#166534",
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
