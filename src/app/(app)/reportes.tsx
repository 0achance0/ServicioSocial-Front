import { apiFetch } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";
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
import * as XLSX from "xlsx"; // Para generar el Excel

type AlumnoSinDoc = {
  numero_control: string;
  nombre: string;
  apellido_uno: string;
  apellido_dos: string | null;
  carrera: string;
  semestre: number;
  correo: string;
  folio_proyecto: string;
};

export default function Reportes() {
  const [alumnos, setAlumnos] = useState<AlumnoSinDoc[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [generandoExcel, setGenerandoExcel] = useState(false);

  const cargarReporte = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/reportes/sin-documentos");
      setAlumnos(res.datos || []);
    } catch (error: any) {
      setMensaje(error.message || "Error al generar el reporte.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const exportarExcel = async () => {
    if (alumnos.length === 0) {
      Alert.alert("Aviso", "No hay datos para exportar.");
      return;
    }

    setGenerandoExcel(true);
    try {
      // 1. Mapeamos los datos para que las columnas se vean bonitas en Excel
      const datosExcel = alumnos.map((a) => ({
        "No. Control": a.numero_control,
        "Nombre Completo":
          `${a.nombre} ${a.apellido_uno} ${a.apellido_dos || ""}`.trim(),
        Carrera: a.carrera,
        Semestre: a.semestre,
        Correo: a.correo,
        "Folio Programa": a.folio_proyecto,
      }));

      // 2. Creamos la hoja y el libro
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Alumnos sin Documentos",
      );

      if (Platform.OS === "web") {
        // En web, descarga directa
        XLSX.writeFile(workbook, "Reporte_Alumnos_Sin_Documentos.xlsx");
      } else {
        // En móvil, convertimos a base64 y guardamos
        const wbout = XLSX.write(workbook, {
          type: "base64",
          bookType: "xlsx",
        });
        const uri = `${FileSystem.cacheDirectory}Reporte_Alumnos_Sin_Documentos.xlsx`;

        await FileSystem.writeAsStringAsync(uri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Éxito", "Archivo generado en: " + uri);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", "No se pudo generar el Excel: " + error.message);
    } finally {
      setGenerandoExcel(false);
    }
  };

  const renderTarjeta = ({ item }: { item: AlumnoSinDoc }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>
            {item.nombre} {item.apellido_uno} {item.apellido_dos || ""}
          </Text>
          <Text style={styles.control}>No. Control: {item.numero_control}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.folio_proyecto}</Text>
        </View>
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
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Reporte: Alumnos sin Documentos</Text>
      <Text style={styles.subtitulo}>
        Muestra a los alumnos que ya tienen un programa asignado pero que aún no
        han subido ningún documento al sistema.
      </Text>

      {/* Botón de Excel */}
      <Pressable
        style={[styles.botonExcel, generandoExcel && { opacity: 0.7 }]}
        onPress={exportarExcel}
        disabled={generandoExcel || alumnos.length === 0}
      >
        {generandoExcel ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonExcelTexto}>Exportar a Excel (.xlsx)</Text>
        )}
      </Pressable>

      {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}

      {cargando && !refrescando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#09134b" />
          <Text style={styles.cargandoTexto}>Generando reporte...</Text>
        </View>
      ) : (
        <FlatList
          data={alumnos}
          keyExtractor={(item) => item.numero_control}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={() => cargarReporte(true)}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              ¡Buenas noticias! No hay alumnos pendientes de subir documentos.
            </Text>
          }
        />
      )}
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
  botonExcel: {
    backgroundColor: "#166534", // Verde oscuro
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  botonExcelTexto: {
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
  control: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
  },
  badge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 11,
    color: "#475569",
  },
  infoContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  textoInfo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#334155",
  },
  negrita: { fontFamily: "NotoSerif_700Bold" },
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
