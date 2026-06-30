import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={34} color="#f7c7d3" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>マイモンスター</Text>

        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={30}
            color="#f7c7d3"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.line} />

      <View style={styles.content}>
        <Text style={styles.monsterName}>モンスターの名前</Text>

        <View style={styles.starsContainer}>
          <Text style={styles.star}>✦</Text>
          <Text style={styles.star}>✦</Text>
          <Text style={styles.starBig}>✦</Text>
          <Text style={styles.star}>✦</Text>
          <Text style={styles.star}>✦</Text>
          <Text style={styles.star}>✦</Text>
        </View>

        <Image
          source={{
            uri: "https://i.imgur.com/4AiXzf8.png",
          }}
          style={styles.monster}
        />

        <View style={styles.heartBubble}>
          <Text style={styles.heart}>💗</Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>おなか 70%</Text>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <TouchableOpacity style={styles.feedButton}>
          <Text style={styles.feedButtonText}>
            それ、食べていい？
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={28} color="#f7a9bc" />
          <Text style={styles.navTextActive}>ホーム</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons
            name="notebook-heart-outline"
            size={28}
            color="#c88ea4"
          />
          <Text style={styles.navText}>感情ログ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="stats-chart-outline" size={28} color="#c88ea4" />
          <Text style={styles.navText}>きろく</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bag-outline" size={28} color="#c88ea4" />
          <Text style={styles.navText}>ショップ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={28} color="#c88ea4" />
          <Text style={styles.navText}>マイページ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171d4b",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
  },

  headerTitle: {
    color: "#f7c7d3",
    fontSize: 34,
    fontWeight: "700",
  },

  line: {
    height: 1.5,
    backgroundColor: "#d6a8b7",
    opacity: 0.7,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
  },

  monsterName: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    alignSelf: "flex-start",
    marginLeft: 34,
    marginBottom: 10,
  },

  starsContainer: {
    position: "absolute",
    top: 100,
    width: "100%",
    height: 200,
  },

  star: {
    position: "absolute",
    color: "#fff6d5",
    fontSize: 34,
    textShadowColor: "#fff6d5",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  starBig: {
    position: "absolute",
    color: "#fff6d5",
    fontSize: 48,
    textShadowColor: "#fff6d5",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    top: 0,
    right: 80,
  },

  monster: {
    width: 310,
    height: 310,
    marginTop: 70,
    resizeMode: "contain",
  },

  heartBubble: {
    position: "absolute",
    right: 40,
    top: 280,
    width: 90,
    height: 70,
    backgroundColor: "#ffffff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  heart: {
    fontSize: 36,
  },

  statusBox: {
    width: "86%",
    borderWidth: 2,
    borderColor: "#f3bcc8",
    borderRadius: 28,
    padding: 22,
    marginTop: 20,
    backgroundColor: "#232b61",
  },

  statusText: {
    color: "#ffd4de",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },

  progressBar: {
    width: "100%",
    height: 24,
    backgroundColor: "#51527c",
    borderRadius: 30,
    overflow: "hidden",
  },

  progressFill: {
    width: "74%",
    height: "100%",
    backgroundColor: "#f5c6d2",
    borderRadius: 30,
  },

  feedButton: {
    width: "74%",
    height: 92,
    backgroundColor: "#efb5c5",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 36,
  },

  feedButtonText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
  },

  bottomNav: {
    height: 100,
    borderTopWidth: 1.5,
    borderColor: "#d6a8b7",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#171d4b",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    color: "#c88ea4",
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },

  navTextActive: {
    color: "#f7a9bc",
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },
});