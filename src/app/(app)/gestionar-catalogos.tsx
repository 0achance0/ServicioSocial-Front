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
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type Periodo = {
  numero_periodo: number;
  nombre: string;
  etapa: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_prorroga: number;
  estatus: "ACTIVO" | "INACTIVO";
};

type Formato = {
  id_formato: number;
  tipo: string;
  plan_estudios: string;
  nombre: string;
  plantilla: string | null;
  estatus: "ACTIVO" | "INACTIVO";
};

export default function GestionCatalogos() {
  const [tab, setTab] = useState<"PERIODOS" | "FORMATOS">("PERIODOS");
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [formatos, setFormatos] = useState<Formato[]>([]);

  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estados del Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Estados para el formulario de Periodo
  const [pNombre, setPNombre] = useState("");
  const [pEtapa, setPEtapa] = useState("REGISTRO");
  const [pInicio, setPInicio] = useState("");
  const [pFin, setPFin] = useState("");
  const [pProrroga, setPProrroga] = useState("0");

  // Estados para el formulario de Formato
  const [fTipo, setFTipo] = useState("SOLICITUD");
  const [fPlan, setFPlan] = useState("2015-2016");
  const [fNombre, setFNombre] = useState("");
  const [fPlantilla, setFPlantilla] = useState("");

  const cargarDatos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      if (tab === "PERIODOS") {
        const res = await apiFetch("/api/catalogos/periodos");
        setPeriodos(res.datos || []);
      } else {
        const res = await apiFetch("/api/catalogos/formatos");
        setFormatos(res.datos || []);
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar el catálogo.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [tab]);

  // --- Lógica para alternar Estatus (ACTIVO/INACTIVO) ---
  const toggleEstatus = async (id: number, estatusActual: string) => {
    const nuevoEstatus = estatusActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    try {
      const ruta = tab === "PERIODOS" ? "periodos" : "formatos";
      await apiFetch(`/api/catalogos/${ruta}/${id}/estatus`, {
        method: "PATCH",
        body: JSON.stringify({ estatus: nuevoEstatus }),
      });
      cargarDatos(true); // Recargar silenciosamente
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "No se pudo cambiar el estatus. Verifica que no esté en uso.",
      );
    }
  };

  // --- Lógica del Modal ---
  const abrirModal = (item?: any) => {
    if (item) {
      setEditandoId(item.numero_periodo || item.id_formato);
      if (tab === "PERIODOS") {
        setPNombre(item.nombre);
        setPEtapa(item.etapa);
        setPInicio(item.fecha_inicio.split("T")[0]); // Formato YYYY-MM-DD
        setPFin(item.fecha_fin.split("T")[0]);
        setPProrroga(item.dias_prorroga.toString());
      } else {
        setFTipo(item.tipo);
        setFPlan(item.plan_estudios);
        setFNombre(item.nombre);
        setFPlantilla(item.plantilla || "");
      }
    } else {
      setEditandoId(null);
      // Limpiar campos
      setPNombre("");
      setPEtapa("REGISTRO");
      setPInicio("");
      setPFin("");
      setPProrroga("0");
      setFTipo("SOLICITUD");
      setFPlan("2015-2016");
      setFNombre("");
      setFPlantilla("");
    }
    setModalVisible(true);
  };

  const guardarRegistro = async () => {
    setProcesando(true);
    setMensaje("");

    try {
      const ruta = tab === "PERIODOS" ? "periodos" : "formatos";
      const metodo = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `/api/catalogos/${ruta}/${editandoId}`
        : `/api/catalogos/${ruta}`;

      let body = {};
      if (tab === "PERIODOS") {
        body = {
          nombre: pNombre,
          etapa: pEtapa,
          fecha_inicio: pInicio,
          fecha_fin: pFin,
          dias_prorroga: Number(pProrroga),
        };
      } else {
        body = {
          tipo: fTipo,
          plan_estudios: fPlan,
          nombre: fNombre,
          plantilla: fPlantilla,
        };
      }

      const res = await apiFetch(url, {
        method: metodo,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalVisible(false);
        cargarDatos();
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al guardar el registro.");
    } finally {
      setProcesando(false);
    }
  };

  // --- Renders de las tarjetas ---
  const renderPeriodo = ({ item }: { item: Periodo }) => (
    <View
      style={[styles.card, item.estatus === "INACTIVO" && styles.cardInactiva]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.etapa}>{item.etapa}</Text>
        </View>
        <Switch
          value={item.estatus === "ACTIVO"}
          onValueChange={() => toggleEstatus(item.numero_periodo, item.estatus)}
          trackColor={{ false: "#cbd5e1", true: "#10b981" }}
        />
      </View>
      <Text style={styles.textoInfo}>
        Del {item.fecha_inicio.split("T")[0]} al {item.fecha_fin.split("T")[0]}
      </Text>
      <Text style={styles.textoInfo}>Prórroga: {item.dias_prorroga} días</Text>

      <Pressable style={styles.botonEditar} onPress={() => abrirModal(item)}>
        <Text style={styles.botonEditarTexto}>Editar Periodo</Text>
      </Pressable>
    </View>
  );

  const renderFormato = ({ item }: { item: Formato }) => (
    <View
      style={[styles.card, item.estatus === "INACTIVO" && styles.cardInactiva]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.etapa}>
            {item.tipo} - Plan {item.plan_estudios}
          </Text>
        </View>
        <Switch
          value={item.estatus === "ACTIVO"}
          onValueChange={() => toggleEstatus(item.id_formato, item.estatus)}
          trackColor={{ false: "#cbd5e1", true: "#10b981" }}
        />
      </View>
      <Pressable style={styles.botonEditar} onPress={() => abrirModal(item)}>
        <Text style={styles.botonEditarTexto}>Editar Formato</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Catálogos del Sistema</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, tab === "PERIODOS" && styles.tabActiva]}
          onPress={() => setTab("PERIODOS")}
        >
          <Text
            style={[
              styles.tabTexto,
              tab === "PERIODOS" && styles.tabTextoActivo,
            ]}
          >
            Periodos
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "FORMATOS" && styles.tabActiva]}
          onPress={() => setTab("FORMATOS")}
        >
          <Text
            style={[
              styles.tabTexto,
              tab === "FORMATOS" && styles.tabTextoActivo,
            ]}
          >
            Formatos
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.botonAgregar} onPress={() => abrirModal()}>
        <Text style={styles.botonAgregarTexto}>
          + Agregar {tab === "PERIODOS" ? "Periodo" : "Formato"}
        </Text>
      </Pressable>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <ActivityIndicator
          size="large"
          color="#09134b"
          style={{ marginTop: 50 }}
        />
      ) : tab === "PERIODOS" ? (
        // FLATLIST PARA PERIODOS
        <FlatList
          data={periodos}
          keyExtractor={(item) => item.numero_periodo.toString()}
          renderItem={renderPeriodo}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarDatos(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay periodos registrados.</Text>
          }
        />
      ) : (
        // FLATLIST PARA FORMATOS
        <FlatList
          data={formatos}
          keyExtractor={(item) => item.id_formato.toString()}
          renderItem={renderFormato}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarDatos(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay formatos registrados.</Text>
          }
        />
      )}

      {/* MODAL CREAR/EDITAR */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {editandoId ? "Editar" : "Nuevo"}{" "}
              {tab === "PERIODOS" ? "Periodo" : "Formato"}
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {tab === "PERIODOS" ? (
                <>
                  <Text style={styles.label}>Nombre del Periodo</Text>
                  <TextInput
                    style={styles.input}
                    value={pNombre}
                    onChangeText={setPNombre}
                    placeholder="Ej. Periodo Bimestral 1"
                  />

                  <Text style={styles.label}>Etapa</Text>
                  <View style={styles.opcionesContainer}>
                    {["INDUCCION", "REGISTRO", "BIMESTRAL", "MEMORIA"].map(
                      (e) => (
                        <Pressable
                          key={e}
                          style={[
                            styles.opcion,
                            pEtapa === e && styles.opcionActiva,
                          ]}
                          onPress={() => setPEtapa(e)}
                        >
                          <Text
                            style={[
                              styles.opcionTexto,
                              pEtapa === e && styles.opcionTextoActivo,
                            ]}
                          >
                            {e}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </View>

                  <Text style={styles.label}>Fecha Inicio (AAAA-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={pInicio}
                    onChangeText={setPInicio}
                    placeholder="2024-02-01"
                  />

                  <Text style={styles.label}>Fecha Fin (AAAA-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={pFin}
                    onChangeText={setPFin}
                    placeholder="2024-02-28"
                  />

                  <Text style={styles.label}>Días de Prórroga</Text>
                  <TextInput
                    style={styles.input}
                    value={pProrroga}
                    onChangeText={setPProrroga}
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Nombre del Formato</Text>
                  <TextInput
                    style={styles.input}
                    value={fNombre}
                    onChangeText={setFNombre}
                    placeholder="Ej. Carta de Aceptación"
                  />

                  <Text style={styles.label}>Tipo de Documento</Text>
                  <View style={styles.opcionesContainer}>
                    {[
                      "SOLICITUD",
                      "CARTA_ACEPTACION",
                      "PLAN_TRABAJO",
                      "REPORTE_BIMESTRAL",
                      "MEMORIA_FINAL",
                      "CONSTANCIA",
                    ].map((t) => (
                      <Pressable
                        key={t}
                        style={[
                          styles.opcion,
                          fTipo === t && styles.opcionActiva,
                        ]}
                        onPress={() => setFTipo(t)}
                      >
                        <Text
                          style={[
                            styles.opcionTexto,
                            fTipo === t && styles.opcionTextoActivo,
                          ]}
                        >
                          {t}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.label}>Plan de Estudios</Text>
                  <View style={styles.row}>
                    {["2009-2010", "2015-2016"].map((p) => (
                      <Pressable
                        key={p}
                        style={[
                          styles.opcion,
                          fPlan === p && styles.opcionActiva,
                          { flex: 1, marginHorizontal: 4 },
                        ]}
                        onPress={() => setFPlan(p)}
                      >
                        <Text
                          style={[
                            styles.opcionTexto,
                            fPlan === p && styles.opcionTextoActivo,
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

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
                  styles.botonGuardar,
                  procesando && { opacity: 0.7 },
                ]}
                onPress={guardarRegistro}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
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
  titulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 24,
    color: "#0f172a",
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  tabActiva: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabTexto: { fontFamily: "NotoSerif_700Bold", fontSize: 14, color: "#64748b" },
  tabTextoActivo: { color: "#09134b" },
  botonAgregar: {
    backgroundColor: "#09134b",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  botonAgregarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 15,
  },
  lista: { gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#09134b",
    elevation: 2,
  },
  cardInactiva: { opacity: 0.6, borderLeftColor: "#cbd5e1" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nombre: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 2,
  },
  etapa: { fontFamily: "NotoSerif_400Regular", fontSize: 13, color: "#64748b" },
  textoInfo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  botonEditar: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#09134b",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  botonEditarTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#09134b",
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
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 8,
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
    marginBottom: 16,
  },
  label: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#334155",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "NotoSerif_400Regular",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  opcionesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  opcion: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  opcionActiva: { backgroundColor: "#09134b", borderColor: "#09134b" },
  opcionTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  opcionTextoActivo: { color: "#fff", fontFamily: "NotoSerif_700Bold" },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  modalBotones: { flexDirection: "row", gap: 12, marginTop: 16 },
  botonModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botonCancelar: { backgroundColor: "#f1f5f9" },
  botonCancelarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#475569",
    fontSize: 14,
  },
  botonGuardar: { backgroundColor: "#10b981" },
  botonGuardarTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 14,
  },
});
