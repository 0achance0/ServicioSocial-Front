import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type DocumentoHistorial = {
  numero_documento: number;
  numero_control: string;
  alumno: string;
  tipo: string;
  nombre_documento: string;
  estatus: "PENDIENTE" | "ACEPTADO" | "DENEGADO";
  fecha_subida: string;
  numero_periodo: number | null;
  comentario: string | null;
};

export default function HistorialDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState<"ACEPTADO" | "DENEGADO">(
    "ACEPTADO",
  );

  const cargarHistorial = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      // El backend por defecto busca PENDIENTE, aquí le pasamos el filtro
      const res = await apiFetch(`/api/documentos?estatus=${filtroEstatus}`);
      setDocumentos(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al cargar el historial.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [filtroEstatus]);

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case "ACEPTADO":
        return { bg: "#dcfce7", texto: "#166534" };
      case "DENEGADO":
        return { bg: "#fee2e2", texto: "#991b1b" };
      default:
        return { bg: "#f1f5f9", texto: "#475569" };
    }
  };

  const renderTarjeta = ({ item }: { item: DocumentoHistorial }) => {
    const colores = getEstatusColor(item.estatus);
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
            <Text style={styles.fecha}>Revisado/Subido el: {fecha}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colores.bg }]}>
            <Text style={[styles.badgeText, { color: colores.texto }]}>
              {item.estatus}
            </Text>
          </View>
        </View>

        <View style={styles.docInfo}>
          <Text style={styles.tipoDocumento}>{item.nombre_documento}</Text>
          {item.numero_periodo && (
            <Text style={styles.periodo}>Periodo: {item.numero_periodo}</Text>
          )}
        </View>

        {item.estatus === "DENEGADO" && item.comentario && (
          <View style={styles.comentarioContainer}>
            <Text style={styles.comentarioTitulo}>Motivo de rechazo:</Text>
            <Text style={styles.comentarioTexto}>{item.comentario}</Text>
          </View>
        )}
      </View>
    );
  };

  // Filtramos en el cliente por la búsqueda de texto (nombre o número de control)
  const documentosFiltrados = documentos.filter(
    (doc) =>
      doc.alumno.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.numero_control.includes(busqueda),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historial de Documentos</Text>
      <Text style={styles.subtitulo}>
        Consulta los documentos que ya han sido revisados y validados por el
        personal.
      </Text>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <Pressable
          style={[
            styles.filtroBoton,
            filtroEstatus === "ACEPTADO" && styles.filtroBotonActivo,
          ]}
          onPress={() => setFiltroEstatus("ACEPTADO")}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtroEstatus === "ACEPTADO" && styles.filtroTextoActivo,
            ]}
          >
            Aceptados
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filtroBoton,
            filtroEstatus === "DENEGADO" && styles.filtroBotonActivo,
          ]}
          onPress={() => setFiltroEstatus("DENEGADO")}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtroEstatus === "DENEGADO" && styles.filtroTextoActivo,
            ]}
          >
            Denegados
          </Text>
        </Pressable>
      </View>

      {/* Búsqueda */}
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
          <Text style={styles.cargandoTexto}>Cargando historial...</Text>
        </View>
      ) : (
        <FlatList
          data={documentosFiltrados}
          keyExtractor={(item) => item.numero_documento.toString()}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarHistorial(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {busqueda
                ? "No se encontraron resultados para tu búsqueda."
                : `No hay documentos ${filtroEstatus.toLowerCase()}s.`}
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
  filtrosContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  filtroBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  filtroBotonActivo: {
    backgroundColor: "#09134b",
  },
  filtroTexto: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#475569",
  },
  filtroTextoActivo: {
    color: "#fff",
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
    marginBottom: 2,
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
  docInfo: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  comentarioContainer: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  comentarioTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 13,
    color: "#991b1b",
    marginBottom: 4,
  },
  comentarioTexto: {
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
