import { Avatar } from "@/components/ui/avatar";
import { ETIQUETA_ROL, menuParaRol } from "@/constants/menu";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.perfil}>
        <Avatar uri={user.foto} size={72} />
      </View>

      <Text style={styles.title}>Mi Servicio Social</Text>
      <Text style={styles.role}>
        {user.nombre} · {ETIQUETA_ROL[user.rol]}
      </Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {menuParaRol(user.rol).map((item) => {
          const active = pathname === item.href;
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as any)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? "#fff" : "#cbd5e1"}
              />
              <Text style={[styles.label, active && { color: "#fff" }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={styles.item}
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#cbd5e1" />
        <Text style={styles.label}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  perfil: { alignItems: "center", marginBottom: 12 },
  container: { width: 245, backgroundColor: "#09134b", padding: 16 },
  title: { fontFamily: "NotoSerif_700Bold", color: "#fff", fontSize: 20 },
  role: {
    fontFamily: "NotoSerif_400Regular",
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  itemActive: { backgroundColor: "#949399" },
  label: { fontFamily: "NotoSerif_400Regular", color: "#cbd5e1", fontSize: 11 },
});
