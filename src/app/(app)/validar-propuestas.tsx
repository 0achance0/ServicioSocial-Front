import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Propuesta = {
  id_propuesta: number;
  tipo: string;
  creador: string; // Número de control del alumno
  estatus: string;
  fecha_propuesta: string;
  nombre_programa: string;
  responsable_programa: string;
  area: string;
  objetivo: string;
  actividades: string;
  horario_inicio: string;
  horario_fin: string;
};

export default function ValidarPropuestas() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estados para el Detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);

  // Estados para el rechazo
  const [modalVisible, setModalVisible] = useState(false);
  const [propuestaSeleccionada, setPropuestaSeleccionada] =
    useState<Propuesta | null>(null);
  const [comentario, setComentario] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Filtro para ver Pendientes o Historial
  const [filtro, setFiltro] = useState<"PENDIENTE" | "TODAS">("PENDIENTE");

  const cargarPropuestas = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const url = `/api/propuestas?tipo=EXTERNA${filtro === "PENDIENTE" ? "&estatus=PENDIENTE" : ""}`;
      const res = await apiFetch(url);
      setPropuestas(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar las propuestas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, [filtro]);

  const aceptarPropuesta = async (id: number) => {
    setProcesando(true);
    try {
      const res = await apiFetch(`/api/propuestas/${id}/aceptar`, {
        method: "PATCH",
      });
      if (res.ok) {
        setModalDetalleVisible(false); // Cerramos el modal si estaba abierto
        Alert.alert(
          "Éxito",
          `Propuesta aceptada y publicada en el banco con el folio: ${res.datos?.folio || "Asignado"}`,
        );
        cargarPropuestas();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo aceptar la propuesta.");
    } finally {
      setProcesando(false);
    }
  };

  const abrirDetalle = (propuesta: Propuesta) => {
    setPropuestaSeleccionada(propuesta);
    setModalDetalleVisible(true);
  };

  const abrirModalRechazo = (propuesta: Propuesta) => {
    setPropuestaSeleccionada(propuesta);
    setComentario("");
    setModalVisible(true);
  };

  const denegarPropuesta = async () => {
    if (!comentario.trim()) {
      Alert.alert(
        "Atención",
        "El comentario es obligatorio para denegar la propuesta.",
      );
      return;
    }

    setProcesando(true);
    try {
      const res = await apiFetch(
        `/api/propuestas/${propuestaSeleccionada?.id_propuesta}/denegar`,
        {
          method: "PATCH",
          body: JSON.stringify({ comentario }),
        },
      );
      if (res.ok) {
        setModalVisible(false);
        setModalDetalleVisible(false); // Cerramos el modal de detalle si estaba abierto
        Alert.alert("Éxito", "Propuesta denegada. El alumno verá el motivo.");
        cargarPropuestas();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo denegar la propuesta.");
    } finally {
      setProcesando(false);
    }
  };

  const renderTarjeta = ({ item }: { item: Propuesta }) => {
    const fecha = new Date(item.fecha_propuesta).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isPendiente = item.estatus === "PENDIENTE";
    const badgeBg = isPendiente
      ? "#fef3c7"
      : item.estatus === "ACEPTADA"
        ? "#dcfce7"
        : "#fee2e2";
    const badgeColor = isPendiente
      ? "#92400e"
      : item.estatus === "ACEPTADA"
        ? "#166534"
        : "#991b1b";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>{item.nombre_programa}</Text>
            <Text style={styles.creador}>
              Alumno: {item.creador} | {fecha}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {item.estatus}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.textoInfo}>
            <Text style={styles.negrita}>Responsable: </Text>
            {item.responsable_programa}
          </Text>
          <Text style={styles.textoInfo}>
            <Text style={styles.negrita}>Área: </Text>
            {item.area}
          </Text>
        </View>

        {/* Botones de acción (Revisar, Aceptar, Denegar) */}
        {isPendiente && (
          <View style={styles.accionesContainer}>
            <Pressable
              style={[styles.botonAccion, styles.botonVer]}
              onPress={() => abrirDetalle(item)}
            >
              <Text style={styles.botonAccionTexto}>Revisar Información</Text>
            </Pressable>

            {/* Botones rápidos debajo */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable
                style={[
                  styles.botonAccion,
                  styles.botonAceptar,
                  procesando && { opacity: 0.7 },
                ]}
                onPress={() => aceptarPropuesta(item.id_propuesta)}
                disabled={procesando}
              >
                <Text style={styles.botonAccionTexto}>Aceptar</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.botonAccion,
                  styles.botonDenegar,
                  procesando && { opacity: 0.7 },
                ]}
                onPress={() => abrirModalRechazo(item)}
                disabled={procesando}
              >
                <Text style={styles.botonAccionTexto}>Denegar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Validar Propuestas</Text>
      <Text style={styles.subtitulo}>
        Revisa las propuestas externas enviadas por los alumnos. Al aceptarlas,
        se publicarán automáticamente en el banco.
      </Text>

      <View style={styles.filtrosContainer}>
        <Pressable
          style={[
            styles.filtroBoton,
            filtro === "PENDIENTE" && styles.filtroBotonActivo,
          ]}
          onPress={() => setFiltro("PENDIENTE")}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtro === "PENDIENTE" && styles.filtroTextoActivo,
            ]}
          >
            Pendientes
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filtroBoton,
            filtro === "TODAS" && styles.filtroBotonActivo,
          ]}
          onPress={() => setFiltro("TODAS")}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtro === "TODAS" && styles.filtroTextoActivo,
            ]}
          >
            Historial
          </Text>
        </Pressable>
      </View>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Cargando propuestas...</Text>
        </View>
      ) : (
        <FlatList
          data={propuestas}
          keyExtractor={(item) => item.id_propuesta.toString()}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarPropuestas(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {filtro === "PENDIENTE"
                ? "No hay propuestas pendientes."
                : "No hay propuestas registradas."}
            </Text>
          }
        />
      )}

      {/* MODAL DE DETALLE (Revisar Información) */}
      <Modal visible={modalDetalleVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Revisar Propuesta</Text>
            <Text style={styles.modalSubtitulo}>
              Verifica los datos antes de tomar una decisión.
            </Text>

            <ScrollView style={{ maxHeight: 300, marginBottom: 16 }}>
              <Text style={styles.infoLabel}>
                Nombre del Programa:{" "}
                <Text style={styles.infoVal}>
                  {propuestaSeleccionada?.nombre_programa}
                </Text>
              </Text>
              <Text style={styles.infoLabel}>
                Responsable:{" "}
                <Text style={styles.infoVal}>
                  {propuestaSeleccionada?.responsable_programa}
                </Text>
              </Text>
              <Text style={styles.infoLabel}>
                Área:{" "}
                <Text style={styles.infoVal}>
                  {propuestaSeleccionada?.area}
                </Text>
              </Text>
              <Text style={styles.infoLabel}>
                Objetivo:{" "}
                <Text style={styles.infoVal}>
                  {propuestaSeleccionada?.objetivo}
                </Text>
              </Text>
              <Text style={styles.infoLabel}>
                Actividades:{" "}
                <Text style={styles.infoVal}>
                  {propuestaSeleccionada?.actividades}
                </Text>
              </Text>
              <Text style={styles.infoLabel}>
                Horario:{" "}
                <Text style={styles.infoVal}>
                  {propuestaSeleccionada?.horario_inicio} -{" "}
                  {propuestaSeleccionada?.horario_fin}
                </Text>
              </Text>
            </ScrollView>

            {/* Acciones dentro del modal */}
            <View style={styles.modalBotones}>
              <Pressable
                style={[styles.botonModal, styles.botonConfirmarDenegar]}
                onPress={() => {
                  setModalDetalleVisible(false);
                  if (propuestaSeleccionada)
                    abrirModalRechazo(propuestaSeleccionada);
                }}
              >
                <Text style={styles.botonConfirmarTexto}>Denegar</Text>
              </Pressable>

              <Pressable
                style={[styles.botonModal, styles.botonAceptar]}
                onPress={() => {
                  if (propuestaSeleccionada)
                    aceptarPropuesta(propuestaSeleccionada.id_propuesta);
                }}
              >
                <Text style={styles.botonConfirmarTexto}>Aceptar</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.botonCerrarModal}
              onPress={() => setModalDetalleVisible(false)}
            >
              <Text style={styles.botonCerrarModalTexto}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL PARA DENEGAR (Pide comentario) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Denegar Propuesta</Text>
            <Text style={styles.modalSubtitulo}>
              Explica al alumno por qué su propuesta no fue aceptada (máximo 500
              caracteres).
            </Text>

            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Ej. La institución no cuenta con los convenios necesarios..."
              value={comentario}
              onChangeText={setComentario}
              maxLength={500}
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
                onPress={denegarPropuesta}
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
  container: { flex: 1, padding: 24, backgroundColor: "#f8fafc" },
  titulo: { fontFamily: "NotoSerif_700Bold", fontSize: 24, color: "#0f172a" },
  subtitulo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 18,
  },
  filtrosContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  filtroBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  filtroBotonActivo: { backgroundColor: "#09134b" },
  filtroTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#475569",
  },
  filtroTextoActivo: { color: "#fff" },
  lista: { gap: 16, paddingBottom: 24 },
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
  nombre: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  creador: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeText: { fontFamily: "NotoSerif_700Bold", fontSize: 12 },
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
  negrita: { fontFamily: "NotoSerif_700Bold" },
  accionesContainer: { flexDirection: "column" },
  botonAccion: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botonVer: {
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  botonAceptar: { backgroundColor: "#10b981" },
  botonDenegar: { backgroundColor: "#ef4444" },
  botonAccionTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#334155",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
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
  modalBotones: { flexDirection: "row", gap: 12, marginTop: 8 },
  botonModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botonCancelar: { backgroundColor: "#f1f5f9" },
  botonCancelarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#475569",
    fontSize: 14,
  },
  botonConfirmarDenegar: { backgroundColor: "#ef4444" },
  botonConfirmarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 14,
  },

  // Estilos para el modal de detalle
  infoLabel: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#334155",
    marginTop: 8,
  },
  infoVal: { fontFamily: "NotoSerif_400Regular", color: "#64748b" },
  botonCerrarModal: { marginTop: 16, padding: 12, alignItems: "center" },
  botonCerrarModalTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#09134b",
  },
});
