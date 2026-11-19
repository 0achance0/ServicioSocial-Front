import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Tipo basado en la respuesta del backend
type Propuesta = {
  id_propuesta: number;
  tipo: string;
  estatus: "PENDIENTE" | "ACEPTADA" | "DENEGADA";
  comentario: string | null;
  fecha_propuesta: string;
  nombre_programa: string;
  responsable_programa: string;
  area: string;
  folio: string | null;
};

export default function EstatusPropuestas() {
  const { user } = useAuth();
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState<number | null>(null);

  const cargarPropuestas = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/propuestas/mias");
      setPropuestas(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar tus propuestas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, []);

  const toggleExpandir = (id: number) => {
    setExpandido(expandido === id ? null : id);
  };

  // Función auxiliar para pintar el color del estatus
  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case "PENDIENTE":
        return { bg: "#fef3c7", texto: "#92400e" }; // Amarillo
      case "ACEPTADA":
        return { bg: "#dcfce7", texto: "#166534" }; // Verde
      case "DENEGADA":
        return { bg: "#fee2e2", texto: "#991b1b" }; // Rojo
      default:
        return { bg: "#f1f5f9", texto: "#475569" };
    }
  };

  const renderTarjeta = ({ item }: { item: Propuesta }) => {
    const estaExpandido = expandido === item.id_propuesta;
    const colores = getEstatusColor(item.estatus);

    // Formatear la fecha
    const fecha = new Date(item.fecha_propuesta).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipo}>{item.tipo}</Text>
            <Text style={styles.nombre}>{item.nombre_programa}</Text>
            <Text style={styles.fecha}>Enviada el {fecha}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colores.bg }]}>
            <Text style={[styles.badgeText, { color: colores.texto }]}>
              {item.estatus}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.botonExpandir}
          onPress={() => toggleExpandir(item.id_propuesta)}
        >
          <Text style={styles.botonExpandirTexto}>
            {estaExpandido ? "Ocultar detalles ▲" : "Ver detalles ▼"}
          </Text>
        </Pressable>

        {estaExpandido && (
          <View style={styles.detallesContainer}>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Responsable: </Text>
              {item.responsable_programa}
            </Text>
            <Text style={styles.detalleTexto}>
              <Text style={styles.negrita}>Área: </Text>
              {item.area}
            </Text>

            {item.estatus === "ACEPTADA" && item.folio && (
              <View style={styles.alertaAceptada}>
                <Text style={styles.textoAceptada}>
                  ¡Felicidades! Tu propuesta fue aceptada. Se ha publicado en el
                  banco con el folio:
                </Text>
                <Text style={styles.folioTexto}>{item.folio}</Text>
              </View>
            )}

            {item.estatus === "DENEGADA" && item.comentario && (
              <View style={styles.alertaDenegada}>
                <Text style={styles.textoDenegadaTitulo}>
                  Motivo del rechazo:
                </Text>
                <Text style={styles.textoDenegada}>{item.comentario}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Propuestas</Text>
      <Text style={styles.subtitulo}>
        Aquí puedes dar seguimiento a los programas que has propuesto.
      </Text>

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
              Aún no has enviado ninguna propuesta.
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
  },
  tipo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nombre: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  fecha: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#94a3b8",
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
  botonExpandir: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
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
    gap: 6,
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
  alertaAceptada: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#dcfce7",
    borderRadius: 8,
  },
  textoAceptada: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#166534",
    marginBottom: 4,
  },
  folioTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#166534",
    textAlign: "center",
  },
  alertaDenegada: {
    marginTop: 8,
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
