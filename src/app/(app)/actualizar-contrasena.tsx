import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CambiarContrasena() {
  const { logout } = useAuth();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const guardarContrasena = async () => {
    // Validaciones locales de los campos
    if (!actual || !nueva || !confirmar) {
      setMensaje("Llena todos los campos.");
      return;
    }
    if (nueva.length < 8) {
      setMensaje("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      setMensaje("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    if (nueva === actual) {
      setMensaje("La nueva contraseña no puede ser igual a la anterior.");
      return;
    }

    setCargando(true);
    setMensaje("");
    setExito(false);

    try {
      const res = await apiFetch("/api/auth/contrasena", {
        method: "PUT",
        body: JSON.stringify({
          contrasenaActual: actual,
          contrasenaNueva: nueva,
          confirmar: confirmar,
        }),
      });

      if (res.ok) {
        setExito(true);
        setMensaje("Contraseña actualizada exitosamente.");
        setActual("");
        setNueva("");
        setConfirmar("");

        // Alerta y cierre de sesión automático
        Alert.alert(
          "Contraseña actualizada",
          "Por seguridad, debes iniciar sesión de nuevo con tu nueva contraseña.",
          [{ text: "Ir al Login", onPress: () => logout() }],
        );
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al cambiar la contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cambiar Contraseña</Text>
      <Text style={styles.subtitulo}>
        Actualiza tu contraseña de acceso. Por seguridad, te recomendamos usar
        una combinación de letras, números y símbolos.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Contraseña Actual *</Text>
        <TextInput
          style={styles.input}
          value={actual}
          onChangeText={setActual}
          secureTextEntry
          placeholder="Ingresa tu contraseña actual"
        />

        <Text style={styles.label}>Nueva Contraseña * (Mín. 8 caracteres)</Text>
        <TextInput
          style={styles.input}
          value={nueva}
          onChangeText={setNueva}
          secureTextEntry
          placeholder="Ingresa tu nueva contraseña"
        />

        <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
        <TextInput
          style={styles.input}
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry
          placeholder="Repite la nueva contraseña"
        />

        <Pressable
          style={[styles.boton, cargando && { opacity: 0.7 }]}
          onPress={guardarContrasena}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Actualizar Contraseña</Text>
          )}
        </Pressable>

        {!!mensaje && (
          <Text
            style={[styles.mensaje, { color: exito ? "#166534" : "#dc2626" }]}
          >
            {mensaje}
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
    justifyContent: "center",
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
    fontSize: 13,
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "NotoSerif_400Regular",
    marginBottom: 16,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  botonTexto: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
    fontSize: 16,
  },
  mensaje: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
});
