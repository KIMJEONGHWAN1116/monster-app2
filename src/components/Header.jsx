// src/components/Header.jsx

import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import colors from "../styles/colors";

export default function Header() {
  return (
    <View style={styles.container}>
      <Feather name="menu" size={34} color={colors.pinkText} />

      <Text style={styles.title}>マイモンスター</Text>

      <Feather name="bell" size={28} color={colors.pinkText} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: "#DDA7B6",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 20,
  },

  title: {
    color: "#F6C3D1",
    fontSize: 28,
    fontWeight: "800",
  },
});