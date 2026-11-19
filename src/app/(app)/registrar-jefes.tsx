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

export default function RegistrarJefe() {
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidoUno, setApellidoUno] = useState("");
  const [apellidoDos, setApellidoDos] = useState("");
  const [puesto, setPuesto] = useState("");
  const [area, setArea] = useState("");
  const [genero, setGenero] = useState("Mujer");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("JEFE_OFICINA"); // Por defecto

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const guardarJefe = async () => {
    // Validaciones básicas
    if (!numeroEmpleado || !nombre || !apellidoUno || !puesto || !area) {
      setMensaje("Llena todos los campos obligatorios (*).");
      return;
    }

    setCargando(true);
    setMensaje("");
    setExito(false);

    try {
      const res = await apiFetch("/api/jefes", {
        method: "POST",
        body: JSON.stringify({
          numeroEmpleado,
          nombre,
          apellidoUno,
          apellidoDos,
          puesto,
          area,
          genero,
          telefono,
          correo,
          rol,
        }),
      });

      if (res.ok) {
        setExito(true);
        Alert.alert(
          "Éxito",
          `Jefe registrado.\n\nContraseña inicial: ${numeroEmpleado}`,
        );
        // Limpiamos el formulario
        setNumeroEmpleado("");
        setNombre("");
        setApellidoUno("");
        setApellidoDos("");
        setPuesto("");
        setArea("");
        setTelefono("");
        setCorreo("");
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al registrar al jefe.");
    } finally {
      setCargando(false);
    }
  };

  const rolesDisponibles = [
    { value: "JEFE_OFICINA", label: "Jefe de Oficina" },
    { value: "JEFE_DEPA", label: "Jefe de Departamento" },
    { value: "ADMIN", label: "Administrador" },
  ];

  const opcionesGenero = ["Mujer", "Hombre", "Otro"];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registrar Personal</Text>
      <Text style={styles.subtitulo}>
        Da de alta a un nuevo Jefe o Administrador en el sistema. Su contraseña
        será su número de empleado.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Tipo de Rol *</Text>
        <View style={styles.rolesContainer}>
          {rolesDisponibles.map((opcion) => (
            <Pressable
              key={opcion.value}
              style={[
                styles.rolBoton,
                rol === opcion.value && styles.rolBotonActivo,
              ]}
              onPress={() => setRol(opcion.value)}
            >
              <Text
                style={[
                  styles.rolTexto,
                  rol === opcion.value && styles.rolTextoActivo,
                ]}
              >
                {opcion.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.seccionTitulo}>Datos Personales</Text>

        <Text style={styles.label}>Número de Empleado *</Text>
        <TextInput
          style={styles.input}
          value={numeroEmpleado}
          onChangeText={setNumeroEmpleado}
          keyboardType="numeric"
          placeholder="Ej. 1001"
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
            <Text style={styles.label}>Puesto *</Text>
            <TextInput
              style={styles.input}
              value={puesto}
              onChangeText={setPuesto}
              placeholder="Ej. Jefe de Sistemas"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>Área *</Text>
            <TextInput
              style={styles.input}
              value={area}
              onChangeText={setArea}
              placeholder="Ej. Sistemas"
            />
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Ej. 6671234567"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="correo@tecnm.mx"
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

        <Pressable
          style={[styles.boton, cargando && { opacity: 0.7 }]}
          onPress={guardarJefe}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Registrar Personal</Text>
          )}
        </Pressable>

        {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}
        {exito && <Text style={styles.mensajeExito}>¡Registro exitoso!</Text>}
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
    marginTop: 16,
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
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  rolBoton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  rolBotonActivo: {
    backgroundColor: "#09134b",
    borderColor: "#09134b",
  },
  rolTexto: {
    fontFamily: "NotoSerif_400Regular",
    fontSize: 13,
    color: "#475569",
  },
  rolTextoActivo: {
    fontFamily: "NotoSerif_700Bold",
    color: "#fff",
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
});
