import { ActivityIndicator, View } from "react-native";
import { Slot, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/ui/Sidebar";

export default function AppLayout() {
  const { user, cargando } = useAuth();

  // Mientras se restaura la sesión no se redirige (evita un parpadeo al login)
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!user) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Sidebar />
      <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <Slot />
      </View>
    </View>
  );
}
