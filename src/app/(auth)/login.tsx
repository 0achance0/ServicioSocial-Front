import { ROLES, rutaInicio } from "@/constants/menu";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

// Usuarios de prueba, luego los reemplazamos
// const USUARIOS: Record<string, { password: string; rol: Rol }> = {
//   alumno: { password: "1234", rol: "alumno" },
//   jefe: { password: "1234", rol: "jefe" },
//   admin: { password: "1234", rol: "admin" },
// };

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esAncha = width > 768;

  const entrar = async () => {
    if (!usuario.trim() || !password) {
      setError("Ingresa usuario y contraseña");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const r = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ usuario: usuario.trim(), contrasena: password }),
      });
      const rol = ROLES[r.datos.rol];
      await login({
        token: r.datos.token,
        rol,
        usuario: r.datos.usuario,
        nombre: r.datos.nombre,
      });
      router.replace(rutaInicio(rol) as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Mitad izquierda: imagen */}
      {esAncha && (
        <View style={styles.izquierda}>
          <Image
            source={require("@/assets/images/friends.png")}
            style={styles.imagen}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Mitad derecha: formulario */}
      <View style={styles.derecha}>
        <View style={styles.card}>
          <Text style={styles.title}>Servicio Social</Text>
          <Text style={[styles.title, styles.subtitle]}>ITC</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            autoCapitalize="none"
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            style={styles.input}
            onSubmitEditing={entrar}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.button} onPress={entrar} disabled={cargando}>
            <Text style={styles.buttonText}>
              {cargando ? "Entrando..." : "Iniciar sesión"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#09134b",
  },
  izquierda: {
    flex: 1,
  },
  imagen: {
    width: "210%",
    height: "105%",
  },
  derecha: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#e3ebee",
    padding: 50,
    borderRadius: 25,
    gap: 8,
  },
  title: {
    fontFamily: "NotoSerif_700Bold",
    fontSize: 34,
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 3,
  },
  subtitle: { fontSize: 28, color: "#1e293b" },
  input: {
    fontFamily: "NotoSerif_400Regular",
    borderWidth: 1,
    borderColor: "#50606c",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  error: { fontFamily: "NotoSerif_400Regular", color: "#dc2626", fontSize: 13 },
  button: {
    backgroundColor: "#5a656a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "NotoSerif_400Regular",
    color: "#fff",
    fontSize: 15,
  },
});
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
