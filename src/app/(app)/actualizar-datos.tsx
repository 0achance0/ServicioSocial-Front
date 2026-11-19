import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ActualizarDatos() {
  const { user, actualizarUsuario } = useAuth();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellidoUno, setApellidoUno] = useState(user?.apellido_uno || "");
  const [apellidoDos, setApellidoDos] = useState(user?.apellido_dos || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [genero, setGenero] = useState(user?.genero || "Otro");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const guardarCambios = async () => {
    if (!nombre.trim() || !apellidoUno.trim()) {
      setMensaje("El nombre y el primer apellido son obligatorios.");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const res = await apiFetch("/api/perfil", {
        method: "PUT",
        body: JSON.stringify({
          nombre,
          apellidoUno,
          apellidoDos,
          telefono,
          genero,
        }),
      });

      if (res.ok) {
        setMensaje("Actualización de datos exitosa.");

        await actualizarUsuario({
          nombre,
          apellido_uno: apellidoUno,
          apellido_dos: apellidoDos,
          telefono,
          genero,
        });
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al actualizar los datos.");
    } finally {
      setCargando(false);
    }
  };

  const opcionesGenero = ["Mujer", "Hombre", "Otro"];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Actualizar Datos</Text>

      <View style={styles.card}>
        <Text style={styles.cardSubtitulo}>
          Modifica tu información personal. Tu número de control y carrera no
          pueden ser cambiados.
        </Text>

        {/* Campo: Nombre */}
        <Text style={styles.label}>Nombre(s) *</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Juan Carlos"
        />

        {/* Campo: Apellido Paterno */}
        <Text style={styles.label}>Apellido Uno *</Text>
        <TextInput
          style={styles.input}
          value={apellidoUno}
          onChangeText={setApellidoUno}
          placeholder="Ej. Pérez"
        />

        {/* Campo: Apellido Materno */}
        <Text style={styles.label}>Apellido Dos</Text>
        <TextInput
          style={styles.input}
          value={apellidoDos}
          onChangeText={setApellidoDos}
          placeholder="Ej. Gómez"
        />

        {/* Campo: Teléfono */}
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej. 6671234567"
          keyboardType="phone-pad"
        />

        {/* Selector de Género */}
        <Text style={styles.label}>Género</Text>
        <View style={styles.generoContainer}>
          {opcionesGenero.map((opcion) => (
            <Pressable
              key={opcion}
              style={[
                styles.generoBoton,
                genero === opcion && styles.generoBotonActivo,
              ]}
              onPress={() => setGenero(opcion)}
            >
              <Text
                style={[
                  styles.generoTexto,
                  genero === opcion && styles.generoTextoActivo,
                ]}
              >
                {opcion}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Botón de Guardar */}
        <Pressable
          style={[styles.boton, cargando && { opacity: 0.7 }]}
          onPress={guardarCambios}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Guardar Cambios</Text>
          )}
        </Pressable>

        {/* Mensaje de éxito o error */}
        {!!mensaje && (
          <Text
            style={[
              styles.mensaje,
              { color: mensaje.includes("exitosa") ? "#166534" : "#991b1b" },
            ]}
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
  },
  titulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 24,
    marginBottom: 16,
    color: "#0f172a",
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
  cardSubtitulo: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 18,
  },
  label: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 14,
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "NotoSerif_400Regular",
    marginBottom: 16,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  generoContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  generoBoton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  generoBotonActivo: {
    backgroundColor: "#09134b",
    borderColor: "#09134b",
  },
  generoTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#64748b",
  },
  generoTextoActivo: {
    color: "#fff",
    fontFamily: "NotoSerif_700Bold",
  },
  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
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
