import { API_URL, apiFetch, leerToken } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
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

type Documento = {
  numero_documento: number;
  tipo: string;
  nombre_documento: string;
  estatus: "PENDIENTE" | "ACEPTADO" | "DENEGADO";
  comentario: string | null;
  fecha_subida: string;
  numero_periodo: number | null;
};

export default function MisDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [abriendo, setAbriendo] = useState<number | null>(null);

  // Estado para el filtro: 'TODOS', 'ACEPTADOS', 'DENEGADOS'
  const [filtro, setFiltro] = useState<"TODOS" | "ACEPTADOS" | "DENEGADOS">(
    "TODOS",
  );

  const cargarDocumentos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/documentos/mios");
      setDocumentos(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar tus documentos.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const verArchivo = async (id: number, tipo: string) => {
    setAbriendo(id);
    try {
      const token = await leerToken();
      const url = `${API_URL}/api/documentos/${id}/archivo`;

      if (Platform.OS === "web") {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("No se pudo obtener el archivo");
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } else {
        const fileUri = `${FileSystem.cacheDirectory}${tipo}_${id}.pdf`;
        const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (downloadRes.status !== 200) throw new Error("Error al descargar");

        const contentUri = await FileSystem.getContentUriAsync(downloadRes.uri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo abrir el archivo. " + error.message);
    } finally {
      setAbriendo(null);
    }
  };

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case "PENDIENTE":
        return { bg: "#fef3c7", texto: "#92400e" };
      case "ACEPTADO":
        return { bg: "#dcfce7", texto: "#166534" };
      case "DENEGADO":
        return { bg: "#fee2e2", texto: "#991b1b" };
      default:
        return { bg: "#f1f5f9", texto: "#475569" };
    }
  };

  const renderTarjeta = ({ item }: { item: Documento }) => {
    const colores = getEstatusColor(item.estatus);
    const estaAbriendo = abriendo === item.numero_documento;

    const fecha = new Date(item.fecha_subida).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipo}>{item.nombre_documento}</Text>
            <Text style={styles.fecha}>Subido el {fecha}</Text>
            {item.numero_periodo && (
              <Text style={styles.fecha}>Periodo: {item.numero_periodo}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: colores.bg }]}>
            <Text style={[styles.badgeText, { color: colores.texto }]}>
              {item.estatus}
            </Text>
          </View>
        </View>

        {/* Alerta si fue denegado */}
        {item.estatus === "DENEGADO" && item.comentario && (
          <View style={styles.alertaDenegada}>
            <Text style={styles.textoDenegadaTitulo}>Motivo del rechazo:</Text>
            <Text style={styles.textoDenegada}>{item.comentario}</Text>
          </View>
        )}

        {/* Botón para ver archivo */}
        <Pressable
          style={[styles.botonVer, estaAbriendo && styles.botonDeshabilitado]}
          onPress={() => verArchivo(item.numero_documento, item.tipo)}
          disabled={estaAbriendo}
        >
          {estaAbriendo ? (
            <ActivityIndicator color="#09134b" size="small" />
          ) : (
            <Text style={styles.botonVerTexto}>Ver Documento</Text>
          )}
        </Pressable>
      </View>
    );
  };

  // Filtramos la lista según la opción seleccionada
  const documentosFiltrados = documentos.filter((doc) => {
    if (filtro === "TODOS") return true;
    if (filtro === "ACEPTADOS") return doc.estatus === "ACEPTADO";
    if (filtro === "DENEGADOS") return doc.estatus === "DENEGADO";
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Documentos</Text>
      <Text style={styles.subtitulo}>
        Consulta el estado de tus entregas. Si un documento fue rechazado,
        podrás leer el motivo y volver a subirlo.
      </Text>

      {/* Selector de Filtros */}
      <View style={styles.filtrosContainer}>
        {(["TODOS", "ACEPTADOS", "DENEGADOS"] as const).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filtroBoton,
              filtro === f && styles.filtroBotonActivo,
            ]}
            onPress={() => setFiltro(f)}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === f && styles.filtroTextoActivo,
              ]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Cargando tus documentos...</Text>
        </View>
      ) : (
        <FlatList
          data={documentosFiltrados}
          keyExtractor={(item) => item.numero_documento.toString()}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarDocumentos(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay documentos con este filtro.</Text>
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
  filtrosContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filtroBoton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  filtroBotonActivo: {
    backgroundColor: "#09134b",
  },
  filtroTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#475569",
  },
  filtroTextoActivo: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
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
  tipo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  fecha: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 12,
  },
  alertaDenegada: {
    marginTop: 4,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  textoDenegadaTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#991b1b",
    marginBottom: 2,
  },
  textoDenegada: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#991b1b",
    lineHeight: 18,
  },
  botonVer: {
    borderWidth: 1,
    borderColor: "#09134b",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botonDeshabilitado: {
    borderColor: "#cbd5e1",
    opacity: 0.7,
  },
  botonVerTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#09134b",
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
