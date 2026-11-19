import { API_URL, apiFetch, leerToken } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type DocumentoPendiente = {
  numero_documento: number;
  numero_control: string;
  alumno: string;
  tipo: string;
  nombre_documento: string;
  estatus: string;
  fecha_subida: string;
  numero_periodo: number | null;
  comentario: string | null;
};

export default function ValidarDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estados para el modal de Detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [docSeleccionadoDetalle, setDocSeleccionadoDetalle] =
    useState<DocumentoPendiente | null>(null);

  // Estados para el modal de rechazo
  const [modalVisible, setModalVisible] = useState(false);
  const [docSeleccionado, setDocSeleccionado] =
    useState<DocumentoPendiente | null>(null);
  const [comentario, setComentario] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargarDocumentos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/documentos");
      setDocumentos(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar los documentos pendientes.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const verArchivo = async (id: number, tipo: string) => {
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
    }
  };

  const aceptarDocumento = async (id: number) => {
    setProcesando(true);
    try {
      const res = await apiFetch(`/api/documentos/${id}/aceptar`, {
        method: "PATCH",
      });
      if (res.ok) {
        setModalDetalleVisible(false); // Cerramos el modal si estaba abierto
        Alert.alert("Éxito", "Documento aceptado correctamente.");
        cargarDocumentos();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo aceptar el documento.");
    } finally {
      setProcesando(false);
    }
  };

  const abrirDetalleDocumento = (doc: DocumentoPendiente) => {
    setDocSeleccionadoDetalle(doc);
    setModalDetalleVisible(true);
  };

  const abrirModalRechazo = (doc: DocumentoPendiente) => {
    setDocSeleccionado(doc);
    setComentario("");
    setModalVisible(true);
  };

  const denegarDocumento = async () => {
    if (!comentario.trim()) {
      Alert.alert(
        "Atención",
        "El comentario es obligatorio para denegar el documento.",
      );
      return;
    }

    setProcesando(true);
    try {
      const res = await apiFetch(
        `/api/documentos/${docSeleccionado?.numero_documento}/denegar`,
        {
          method: "PATCH",
          body: JSON.stringify({ comentario }),
        },
      );
      if (res.ok) {
        setModalVisible(false);
        setModalDetalleVisible(false);
        Alert.alert("Éxito", "Documento denegado. El alumno verá el motivo.");
        cargarDocumentos();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo denegar el documento.");
    } finally {
      setProcesando(false);
    }
  };

  const renderTarjeta = ({ item }: { item: DocumentoPendiente }) => {
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
            <Text style={styles.alumno}>{item.alumno}</Text>
            <Text style={styles.noControl}>
              No. Control: {item.numero_control}
            </Text>
          </View>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        <View style={styles.docInfo}>
          <Text style={styles.tipoDocumento}>{item.nombre_documento}</Text>
          {item.numero_periodo && (
            <Text style={styles.periodo}>Periodo: {item.numero_periodo}</Text>
          )}
        </View>

        <View style={styles.accionesContainer}>
          <Pressable
            style={[styles.botonAccion, styles.botonRevisar]}
            onPress={() => abrirDetalleDocumento(item)}
          >
            <Text style={styles.botonRevisarTexto}>Revisar Documento</Text>
          </Pressable>
        </View>

        <View style={styles.accionesContainer}>
          <Pressable
            style={[styles.botonAccion, styles.botonAceptar]}
            onPress={() => aceptarDocumento(item.numero_documento)}
          >
            <Text style={styles.botonAccionTexto}>Aceptar</Text>
          </Pressable>
          <Pressable
            style={[styles.botonAccion, styles.botonDenegar]}
            onPress={() => abrirModalRechazo(item)}
          >
            <Text style={styles.botonAccionTexto}>Denegar</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Validar Documentos</Text>
      <Text style={styles.subtitulo}>
        Revisa los documentos pendientes de los alumnos. Puedes leerlos y
        decidir si cumplen con los requisitos.
      </Text>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Cargando documentos...</Text>
        </View>
      ) : (
        <FlatList
          data={documentos}
          keyExtractor={(item) => item.numero_documento.toString()}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarDocumentos(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay documentos pendientes de revisión.
            </Text>
          }
        />
      )}

      {/* MODAL DE DETALLE (Revisar) */}
      <Modal visible={modalDetalleVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Revisar Documento</Text>
            <Text style={styles.modalSubtitulo}>
              Verifica que el archivo sea legible y cumpla con los requisitos.
            </Text>

            <View style={styles.docInfo}>
              <Text style={styles.tipoDocumento}>
                {docSeleccionadoDetalle?.nombre_documento}
              </Text>
              <Text style={styles.detalleTexto}>
                Alumno: {docSeleccionadoDetalle?.alumno}
              </Text>
              <Text style={styles.detalleTexto}>
                No. Control: {docSeleccionadoDetalle?.numero_control}
              </Text>
            </View>

            <Pressable
              style={styles.botonAbrirArchivo}
              onPress={() => {
                if (docSeleccionadoDetalle)
                  verArchivo(
                    docSeleccionadoDetalle.numero_documento,
                    docSeleccionadoDetalle.tipo,
                  );
              }}
            >
              <Text style={styles.botonAbrirArchivoTexto}>
                Abrir Archivo PDF
              </Text>
            </Pressable>

            {/* Acciones dentro del modal */}
            <View style={styles.modalBotones}>
              <Pressable
                style={[styles.botonModal, styles.botonConfirmarDenegar]}
                onPress={() => {
                  setModalDetalleVisible(false);
                  if (docSeleccionadoDetalle)
                    abrirModalRechazo(docSeleccionadoDetalle);
                }}
              >
                <Text style={styles.botonConfirmarTexto}>Denegar</Text>
              </Pressable>

              <Pressable
                style={[styles.botonModal, styles.botonAceptar]}
                onPress={() => {
                  if (docSeleccionadoDetalle)
                    aceptarDocumento(docSeleccionadoDetalle.numero_documento);
                }}
              >
                <Text style={styles.botonConfirmarTexto}>Aceptar</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.botonCerrar}
              onPress={() => setModalDetalleVisible(false)}
            >
              <Text style={styles.botonCerrarTexto}>
                Cerrar y Volver a la Lista
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL PARA DENEGAR */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Denegar Documento</Text>
            <Text style={styles.modalSubtitulo}>
              Explica brevemente al alumno por qué no se aceptó su documento. El
              comentario es obligatorio.
            </Text>

            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Ej. El archivo no cuenta con las firmas correspondientes..."
              value={comentario}
              onChangeText={setComentario}
            />

            <View style={styles.modalBotones}>
              <Pressable
                style={[styles.botonModal, styles.botonCancelar]}
                onPress={() => setModalVisible(false)}
                disabled={procesando}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.botonModal,
                  styles.botonConfirmarDenegar,
                  procesando && { opacity: 0.7 },
                ]}
                onPress={denegarDocumento}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.botonConfirmarTexto}>Denegar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  alumno: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 2,
  },
  noControl: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
  },
  fecha: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#94a3b8",
  },
  docInfo: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipoDocumento: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 15,
    color: "#09134b",
    marginBottom: 4,
  },
  periodo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  accionesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  botonAccion: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botonRevisar: {
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  botonRevisarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#475569",
    fontSize: 14,
  },
  botonAceptar: {
    backgroundColor: "#10b981",
  },
  botonDenegar: {
    backgroundColor: "#ef4444",
  },
  botonAccionTexto: {
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
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  modalTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 20,
    color: "#0f172a",
    marginBottom: 8,
  },
  modalSubtitulo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#0f172a",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 20,
  },
  modalBotones: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botonCancelar: {
    backgroundColor: "#f1f5f9",
  },
  botonCancelarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#475569",
    fontSize: 14,
  },
  botonConfirmarDenegar: {
    backgroundColor: "#ef4444",
  },
  botonConfirmarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 14,
  },

  // Nuevos estilos para el modal de Detalle
  detalleTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#334155",
    marginBottom: 4,
  },
  botonAbrirArchivo: {
    backgroundColor: "#3b82f6", // Azul para indicar que abre un archivo
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  botonAbrirArchivoTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 14,
  },
  botonCerrar: {
    paddingVertical: 12,
    alignItems: "center",
  },
  botonCerrarTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#09134b",
  },
});
