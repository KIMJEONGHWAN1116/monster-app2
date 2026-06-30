// src/components/StatusBarCard.jsx

import { StyleSheet, Text, View } from "react-native";

export default function StatusBarCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>
        おなか <Text style={styles.percent}>70%</Text>
      </Text>

      <View style={styles.barBackground}>
        <View style={styles.barFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    marginTop: 18,

    width: 340,
    height: 110,

    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D9A5B7",

    backgroundColor: "#2A2F63",

    paddingHorizontal: 24,
    paddingTop: 20,
  },

  text: {
    color: "#FFD7E0",
    fontSize: 18,
    fontWeight: "700",
  },

  percent: {
    fontSize: 20,
    fontWeight: "800",
  },

  barBackground: {
    marginTop: 14,

    width: "100%",
    height: 22,

    borderRadius: 20,

    backgroundColor: "#4A4D7C",
    overflow: "hidden",
  },

  barFill: {
    width: "72%",
    height: "100%",

    borderRadius: 20,

    backgroundColor: "#F7C2CF",
  },
});