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

export default function RegistrarAlumno() {
  const [numeroControl, setNumeroControl] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidoUno, setApellidoUno] = useState("");
  const [apellidoDos, setApellidoDos] = useState("");
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const [genero, setGenero] = useState("Mujer");
  const [telefono, setTelefono] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const guardarAlumno = async () => {
    // Validaciones locales
    if (!numeroControl || !nombre || !apellidoUno || !carrera || !semestre) {
      setMensaje("Llena todos los campos obligatorios (*).");
      return;
    }
    if (numeroControl.length !== 8) {
      setMensaje("El número de control debe tener 8 dígitos.");
      return;
    }
    if (Number(semestre) < 7) {
      setMensaje("El alumno debe tener al menos 7° semestre para hacer SS.");
      return;
    }
    if (telefono && telefono.length !== 10) {
      setMensaje("El teléfono debe tener 10 dígitos (o dejarse vacío).");
      return;
    }

    setCargando(true);
    setMensaje("");
    setExito(false);

    try {
      const res = await apiFetch("/api/alumnos", {
        method: "POST",
        body: JSON.stringify({
          numeroControl,
          nombre,
          apellidoUno,
          apellidoDos,
          carrera,
          semestre: Number(semestre),
          genero,
          telefono,
          asistenciaInduccion: true, // Según tu backend, esto es obligatorio en el registro
        }),
      });

      if (res.ok) {
        setExito(true);
        Alert.alert(
          "Éxito",
          `Alumno registrado.\n\nContraseña inicial: ${numeroControl}\nCorreo generado: ${res.datos?.correo || ""}`,
        );
        // Limpiamos el formulario
        setNumeroControl("");
        setNombre("");
        setApellidoUno("");
        setApellidoDos("");
        setCarrera("");
        setSemestre("");
        setTelefono("");
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al registrar el alumno.");
    } finally {
      setCargando(false);
    }
  };

  const opcionesGenero = ["Mujer", "Hombre", "Otro"];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Dar de Alta Alumno</Text>
      <Text style={styles.subtitulo}>
        Registra a un alumno en el sistema. Su contraseña inicial será su número
        de control.
      </Text>

      <View style={styles.card}>
        <Text style={styles.seccionTitulo}>Datos Personales</Text>

        <Text style={styles.label}>Número de Control * (8 dígitos)</Text>
        <TextInput
          style={styles.input}
          value={numeroControl}
          onChangeText={setNumeroControl}
          keyboardType="numeric"
          maxLength={8}
          placeholder="Ej. 23170230"
        />

        <Text style={styles.label}>Nombre(s) *</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Juan Carlos"
        />

        <Text style={styles.label}>Apellido Uno *</Text>
        <TextInput
          style={styles.input}
          value={apellidoUno}
          onChangeText={setApellidoUno}
          placeholder="Ej. Pérez"
        />

        <Text style={styles.label}>Apellido Dos</Text>
        <TextInput
          style={styles.input}
          value={apellidoDos}
          onChangeText={setApellidoDos}
          placeholder="Ej. Gómez"
        />

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Carrera *</Text>
            <TextInput
              style={styles.input}
              value={carrera}
              onChangeText={setCarrera}
              placeholder="Ej. Sistemas"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>Semestre *</Text>
            <TextInput
              style={styles.input}
              value={semestre}
              onChangeText={setSemestre}
              keyboardType="numeric"
              maxLength={2}
              placeholder="Ej. 7"
            />
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Teléfono (10 dígitos)</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Ej. 6671234567"
            />
          </View>
        </View>

        <Text style={styles.label}>Género *</Text>
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
        <View style={styles.container}>
          <Text style={styles.notaTexto}>
            * Nota: Al registrar al alumno, el sistema asumirá que ya asistió al
            curso de inducción.
          </Text>
        </View>
        <Pressable
          style={[styles.boton, cargando && { opacity: 0.7 }]}
          onPress={guardarAlumno}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Registrar Alumno</Text>
          )}
        </Pressable>

        {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}
        {exito && (
          <Text style={styles.mensajeExito}>
            ¡Alumno registrado correctamente!
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
  seccionTitulo: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 16,
    color: "#09134b",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
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
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "NotoSerif_400Regular",
    marginBottom: 12,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  fila: {
    flexDirection: "row",
    gap: 12,
  },
  mitad: {
    flex: 1,
  },
  generoContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
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
  notaContainer: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  notaTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 12,
    color: "#1e3a8a",
    lineHeight: 16,
  },
});
