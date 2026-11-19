import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function InicioAlumno() {
  const { user, cambiarFoto } = useAuth();
  const [mensaje, setMensaje] = useState("");

  const subirFoto = async (asset: ImagePicker.ImagePickerAsset) => {
    const form = new FormData();
    if (Platform.OS === "web") {
      const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
      form.append("fotografia", blob, "foto.jpg");
    } else {
      form.append("fotografia", {
        uri: asset.uri,
        name: "foto.jpg",
        type: asset.mimeType ?? "image/jpeg",
      } as any);
    }
    await apiFetch("/api/perfil/foto", { method: "PUT", body: form });
  };

  const elegirFoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (r.canceled) return;
    const asset = r.assets[0];
    if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
      setMensaje("La fotografía no debe pesar más de 2 MB");
      return;
    }
    try {
      await subirFoto(asset);
      cambiarFoto(asset.uri); // muestra la foto de inmediato
      setMensaje("Actualización de datos exitosa");
    } catch (e: any) {
      setMensaje(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Inicio</Text>

      {/* Contenedor en fila para poner las tarjetas lado a lado */}
      <View style={styles.rowContainer}>
        {/* Tarjeta 1: Fotografía */}
        <View style={styles.cardFoto}>
          <Text style={styles.cardTitulo}>Fotografía</Text>
          <Text style={styles.cardTexto}>
            Esta imagen se usará en tus documentos.
          </Text>

          <Avatar uri={user?.foto} size={160} />

          <Pressable style={styles.boton} onPress={elegirFoto}>
            <Text style={styles.botonTexto}>
              {user?.foto ? "Cambiar foto" : "Subir foto"}
            </Text>
          </Pressable>

          {!!mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}
        </View>

        {/* Tarjeta 2: Datos del Alumno */}
        <View style={styles.cardDatos}>
          <Text style={styles.cardTitulo}>Mis Datos</Text>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Nombre:</Text>
            <Text style={styles.datoValor}>
              {user?.nombre} {user?.apellido_uno} {user?.apellido_dos}
            </Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Número de control:</Text>
            <Text style={styles.datoValor}>{user?.numero_control}</Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Carrera:</Text>
            <Text style={styles.datoValor}>{user?.carrera}</Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Semestre:</Text>
            <Text style={styles.datoValor}>{user?.semestre}</Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Correo:</Text>
            <Text style={styles.datoValor}>{user?.correo}</Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Teléfono:</Text>
            <Text style={styles.datoValor}>{user?.telefono}</Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Estatus:</Text>
            <Text style={styles.datoValor}>{user?.estatus}</Text>
          </View>

          <View style={styles.datoRow}>
            <Text style={styles.datoLabel}>Folio Proyecto:</Text>
            <Text style={styles.datoValor}>
              {user?.folio_proyecto || "Sin asignar"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  titulo: { fontFamily: "NotoSerif_700Bold", fontSize: 24, marginBottom: 16 },

  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    alignItems: "flex-start",
  },

  // Estilos de la Tarjeta de Foto
  cardFoto: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Estilos de la Tarjeta de Datos
  cardDatos: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 18,
    marginBottom: 8,
  },
  cardTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },

  // Estilos para la lista de datos
  datoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 6,
    marginBottom: 4,
  },
  datoLabel: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#334155",
    width: 130,
  },
  datoValor: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },

  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  botonTexto: {
    fontFamily: "NotoSerif_400Regular",
    color: "#fff",
    fontSize: 14,
  },
  mensaje: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#334155",
    textAlign: "center",
  },
});
