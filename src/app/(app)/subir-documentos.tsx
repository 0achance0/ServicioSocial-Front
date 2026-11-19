import { apiFetch } from "@/lib/api";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Los tipos permitidos por tu backend
const TIPOS_DOCUMENTO = [
  { value: "SOLICITUD", label: "Solicitud (Solo propuestas externas)" },
  { value: "CARTA_ACEPTACION", label: "Carta de Aceptación" },
  { value: "PLAN_TRABAJO", label: "Plan de Trabajo" },
  { value: "REPORTE_BIMESTRAL", label: "Reporte Bimestral" },
  { value: "MEMORIA_FINAL", label: "Memoria Final" },
];

export default function SubirDocumento() {
  const [tipo, setTipo] = useState<string>("CARTA_ACEPTACION");
  const [archivo, setArchivo] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const seleccionarArchivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // Solo PDFs como pediste
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) return;

      const asset = resultado.assets[0];

      // Validar que no pese más de 10 MB (según tu documentoController.js)
      if (asset.size && asset.size > 10 * 1024 * 1024) {
        setMensaje("El archivo no debe pesar más de 10 MB.");
        return;
      }

      setArchivo(asset);
      setMensaje("");
    } catch (error) {
      setMensaje("Error al seleccionar el archivo.");
    }
  };

  const subirDocumento = async () => {
    if (!archivo) {
      setMensaje("Por favor, selecciona un archivo PDF primero.");
      return;
    }

    setCargando(true);
    setMensaje("");
    setExito(false);

    try {
      const formData = new FormData();
      formData.append("tipo", tipo);

      if (Platform.OS === "web") {
        const respuesta = await fetch(archivo.uri);
        const blob = await respuesta.blob();
        formData.append("archivo", blob, archivo.name);
      } else {
        formData.append("archivo", {
          uri: archivo.uri,
          name: archivo.name,
          type: "application/pdf",
        } as any);
      }

      // apiFetch inyecta el token y maneja el FormData automáticamente
      const res = await apiFetch("/api/documentos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setExito(true);
        setArchivo(null); // Limpiamos el archivo
        Alert.alert(
          "Éxito",
          "Documento subido correctamente. Queda en espera de revisión por el personal.",
        );
      }
    } catch (error: any) {
      // Aquí se capturan los errores 409 (cascada/periodo) o 400 (formato)
      setMensaje(error.message || "Error al subir el documento.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Subir Documento</Text>
      <Text style={styles.subtitulo}>
        Sube tus documentos en formato PDF. Asegúrate de que tengan las firmas
        correspondientes y que el tamaño no supere los 10 MB.
      </Text>

      <View style={styles.card}>
        {/* Selector de Tipo */}
        <Text style={styles.label}>¿Qué documento vas a subir?</Text>
        <View style={styles.opcionesContainer}>
          {TIPOS_DOCUMENTO.map((opcion) => (
            <Pressable
              key={opcion.value}
              style={[
                styles.opcionBoton,
                tipo === opcion.value && styles.opcionBotonActiva,
              ]}
              onPress={() => setTipo(opcion.value)}
            >
              <Text
                style={[
                  styles.opcionTexto,
                  tipo === opcion.value && styles.opcionTextoActivo,
                ]}
              >
                {opcion.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Selector de Archivo */}
        <Text style={styles.label}>Archivo PDF *</Text>
        <Pressable
          style={[
            styles.selectorArchivo,
            archivo && styles.selectorArchivoConArchivo,
          ]}
          onPress={seleccionarArchivo}
        >
          <Text style={styles.selectorArchivoTexto}>
            {archivo
              ? `Archivo seleccionado:\n${archivo.name}`
              : "Presiona aquí para seleccionar tu archivo PDF"}
          </Text>
        </Pressable>

        {/* Botón de Subir */}
        <Pressable
          style={[styles.boton, cargando && { opacity: 0.7 }]}
          onPress={subirDocumento}
          disabled={cargando || !archivo}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Subir Documento</Text>
          )}
        </Pressable>

        {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}
        {exito && (
          <Text style={styles.mensajeExito}>
            ¡Documento subido exitosamente!
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  titulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 24,
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitulo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#334155",
    marginBottom: 12,
    marginTop: 8,
  },
  opcionesContainer: {
    gap: 8,
    marginBottom: 16,
  },
  opcionBoton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  opcionBotonActiva: {
    backgroundColor: "#09134b",
    borderColor: "#09134b",
  },
  opcionTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#475569",
  },
  opcionTextoActivo: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
  },
  selectorArchivo: {
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  selectorArchivoConArchivo: {
    borderColor: "#10b981", // Verde
    backgroundColor: "#f0fdf4",
  },
  selectorArchivoTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botonTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 16,
  },
  mensajeError: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
    marginTop: 16,
  },
  mensajeExito: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#166534",
    textAlign: "center",
    marginTop: 16,
  },
});
