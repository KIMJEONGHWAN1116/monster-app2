// src/components/BottomNav.jsx

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import colors from "../styles/colors";

export default function BottomNav() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Ionicons name="home" size={28} color={colors.pinkText} />
        <Text style={styles.text}>ホーム</Text>
      </View>

      <View style={styles.item}>
        <Feather name="book-open" size={28} color={colors.pinkText} />
        <Text style={styles.text}>感情ログ</Text>
      </View>

      <View style={styles.item}>
        <MaterialCommunityIcons
          name="chart-bar"
          size={28}
          color={colors.pinkText}
        />
        <Text style={styles.text}>きろく</Text>
      </View>

      <View style={styles.item}>
        <Feather name="shopping-bag" size={28} color={colors.pinkText} />
        <Text style={styles.text}>ショップ</Text>
      </View>

      <View style={styles.item}>
        <Feather name="user" size={28} color={colors.pinkText} />
        <Text style={styles.text}>マイページ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,

    width: "100%",
    height: 92,

    borderTopWidth: 1,
    borderTopColor: "#DDA7B6",

    backgroundColor: "#1D234F",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  item: {
    alignItems: "center",
  },

  text: {
    color: "#F5B8C7",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "700",
  },
});