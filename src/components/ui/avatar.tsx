import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AvatarProps = {
  uri?: string;
  size?: number;
};

export function Avatar({ uri, size = 80 }: AvatarProps) {
  return (
    <View style={[styles.marco, { width: size, height: size }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.imagen} resizeMode="cover" />
      ) : (
        <Ionicons name="person" size={size * 0.55} color="#94a3b8" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  marco: {
    backgroundColor: "#e3ebee",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#568ba5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagen: {
    width: "100%",
    height: "100%",
  },
});
