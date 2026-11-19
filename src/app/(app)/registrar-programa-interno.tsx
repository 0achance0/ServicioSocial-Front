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

export default function RegistrarPropuestaInterna() {
  const [nombrePrograma, setNombrePrograma] = useState("");
  const [responsablePrograma, setResponsablePrograma] = useState("");
  const [puestoResponsable, setPuestoResponsable] = useState("");
  const [area, setArea] = useState("");
  const [actividades, setActividades] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sector, setSector] = useState("");
  const [origenCapital, setOrigenCapital] = useState("");
  const [alumnosSolicitados, setAlumnosSolicitados] = useState("");

  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");

  const [asesorServicioSocial, setAsesorServicioSocial] = useState("");

  const [nombreInstitucion, setNombreInstitucion] = useState("");
  const [telefonoInstitucion, setTelefonoInstitucion] = useState("");
  const [calleInstitucion, setCalleInstitucion] = useState("");
  const [numeroInstitucion, setNumeroInstitucion] = useState("");
  const [ciudadInstitucion, setCiudadInstitucion] = useState("");
  const [cpInstitucion, setCpInstitucion] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const guardarPrograma = async () => {
    if (
      !nombrePrograma ||
      !responsablePrograma ||
      !alumnosSolicitados ||
      !horarioInicio ||
      !horarioFin
    ) {
      setMensaje("Por favor, llena todos los campos obligatorios (*).");
      return;
    }

    setCargando(true);
    setMensaje("");
    setExito(false);

    try {
      // Endpoint exacto para propuestas internas
      const res = await apiFetch("/api/propuestas/internas", {
        method: "POST",
        body: JSON.stringify({
          nombrePrograma,
          responsablePrograma,
          puestoResponsable,
          area,
          actividades,
          objetivo,
          descripcion,
          sector,
          origenCapital,
          alumnosSolicitados: Number(alumnosSolicitados),
          horarioInicio,
          horarioFin,
          asesorServicioSocial,
          nombreInstitucion,
          telefonoInstitucion,
          calleInstitucion,
          numeroInstitucion,
          ciudadInstitucion,
          cpInstitucion,
        }),
      });

      if (res.ok) {
        setExito(true);
        Alert.alert(
          "Éxito",
          "Programa interno registrado. Recuerda ir al Banco de Programas y presionar 'Publicar propuestas internas pendientes' para que esté disponible para los alumnos.",
        );
        // Limpiamos el formulario
        setNombrePrograma("");
        setResponsablePrograma("");
        setPuestoResponsable("");
        setArea("");
        setActividades("");
        setObjetivo("");
        setDescripcion("");
        setSector("");
        setOrigenCapital("");
        setAlumnosSolicitados("");
        setOrigenCapital("");
        setAsesorServicioSocial("");
        setHorarioInicio("");
        setHorarioFin("");
        setNombreInstitucion("");
        setTelefonoInstitucion("");
        setCalleInstitucion("");
        setNumeroInstitucion("");
        setCiudadInstitucion("");
        setCpInstitucion("");
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al registrar el programa.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registrar Programa Interno</Text>
      <Text style={styles.subtitulo}>
        Registra un nuevo programa para el banco de proyectos de la institución.
      </Text>

      <View style={styles.card}>
        {/* --- SECCIÓN 1: DATOS DEL PROGRAMA --- */}
        <Text style={styles.seccionTitulo}>1. Datos del Programa</Text>

        <Text style={styles.label}>Nombre del Programa *</Text>
        <TextInput
          style={styles.input}
          value={nombrePrograma}
          onChangeText={setNombrePrograma}
          placeholder="Ej. Apoyo en laboratorio"
        />

        <Text style={styles.label}>Responsable del Programa *</Text>
        <TextInput
          style={styles.input}
          value={responsablePrograma}
          onChangeText={setResponsablePrograma}
          placeholder="Ej. Ing. Juan Pérez"
        />

        <Text style={styles.label}>Puesto del Responsable *</Text>
        <TextInput
          style={styles.input}
          value={puestoResponsable}
          onChangeText={setPuestoResponsable}
          placeholder="Ej. Jefe de área"
        />

        <Text style={styles.label}>Área o Departamento *</Text>
        <TextInput
          style={styles.input}
          value={area}
          onChangeText={setArea}
          placeholder="Ej. Sistemas"
        />

        <Text style={styles.label}>Actividades a realizar *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          value={actividades}
          onChangeText={setActividades}
          placeholder="Describe las actividades..."
        />

        <Text style={styles.label}>Objetivo del programa *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={2}
          value={objetivo}
          onChangeText={setObjetivo}
          placeholder="Ej. Dar soporte técnico..."
        />

        <Text style={styles.label}>Descripción breve</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={2}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción general..."
        />

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Sector *</Text>
            <TextInput
              style={styles.input}
              value={sector}
              onChangeText={setSector}
              placeholder="Ej. Público"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>Origen de capital *</Text>
            <TextInput
              style={styles.input}
              value={origenCapital}
              onChangeText={setOrigenCapital}
              placeholder="Ej. Federal"
            />
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Alumnos solicitados *</Text>
            <TextInput
              style={styles.input}
              value={alumnosSolicitados}
              onChangeText={setAlumnosSolicitados}
              keyboardType="numeric"
              placeholder="Ej. 3"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>Asesor de SS *</Text>
            <TextInput
              style={styles.input}
              value={asesorServicioSocial}
              onChangeText={setAsesorServicioSocial}
              placeholder="Ej. Mtra. Ana"
            />
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Hora Inicio (HH:MM) *</Text>
            <TextInput
              style={styles.input}
              value={horarioInicio}
              onChangeText={setHorarioInicio}
              placeholder="08:00"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>Hora Fin (HH:MM) *</Text>
            <TextInput
              style={styles.input}
              value={horarioFin}
              onChangeText={setHorarioFin}
              placeholder="14:00"
            />
          </View>
        </View>

        {/* --- SECCIÓN 2: DATOS DE LA INSTITUCIÓN --- */}
        <Text style={[styles.seccionTitulo, { marginTop: 16 }]}>
          2. Datos de la Institución
        </Text>

        <Text style={styles.label}>Nombre de la Institución *</Text>
        <TextInput
          style={styles.input}
          value={nombreInstitucion}
          onChangeText={setNombreInstitucion}
          placeholder="Ej. Instituto Tecnológico"
        />

        <Text style={styles.label}>Teléfono (10 dígitos) *</Text>
        <TextInput
          style={styles.input}
          value={telefonoInstitucion}
          onChangeText={setTelefonoInstitucion}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="Ej. 6671234567"
        />

        <View style={styles.fila}>
          <View style={styles.dosTercios}>
            <Text style={styles.label}>Calle *</Text>
            <TextInput
              style={styles.input}
              value={calleInstitucion}
              onChangeText={setCalleInstitucion}
              placeholder="Ej. Av. Universidad"
            />
          </View>
          <View style={styles.unTercio}>
            <Text style={styles.label}>Número *</Text>
            <TextInput
              style={styles.input}
              value={numeroInstitucion}
              onChangeText={setNumeroInstitucion}
              placeholder="Ej. 310"
            />
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Text style={styles.label}>Ciudad *</Text>
            <TextInput
              style={styles.input}
              value={ciudadInstitucion}
              onChangeText={setCiudadInstitucion}
              placeholder="Ej. Culiacán"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.label}>C.P. (5 dígitos) *</Text>
            <TextInput
              style={styles.input}
              value={cpInstitucion}
              onChangeText={setCpInstitucion}
              keyboardType="numeric"
              maxLength={5}
              placeholder="Ej. 80220"
            />
          </View>
        </View>

        {/* BOTÓN GUARDAR */}
        <Pressable
          style={[styles.boton, cargando && { opacity: 0.7 }]}
          onPress={guardarPrograma}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Registrar Programa Interno</Text>
          )}
        </Pressable>

        {!!mensaje && <Text style={styles.mensajeError}>{mensaje}</Text>}
        {exito && (
          <Text style={styles.mensajeExito}>
            ¡Programa registrado correctamente!
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
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  fila: {
    flexDirection: "row",
    gap: 12,
  },
  mitad: {
    flex: 1,
  },
  dosTercios: {
    flex: 2,
  },
  unTercio: {
    flex: 1,
  },
  boton: {
    backgroundColor: "#09134b",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
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
