import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { BottomTabBar } from "../components/BottomTabBar";
import { DressedMonsterPreview } from "../components/DressedMonsterPreview";
import {
  countLogsByFeeling,
  EmotionLogEntry,
  EmotionPeriod,
  filterLogsByPeriod,
  formatLogTime,
  getPeriodRangeLabel,
} from "../state/emotionLog";
import { EvolutionChoice } from "../state/evolution";
import { MainTabKey } from "../state/navigation";
import { RoomItemPlacements } from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const emotionRecordsDesign = require("../../../assets/images/designs/emotion-records-design.png");

const chartColors = ["#72dcc8", "#a8e9e0", "#f3a9d1", "#a7c5f8"];

type AnalysisItem = {
  count: number;
  feeling: string;
  ratio: number;
};

type EmotionLogScreenProps = {
  activeTab: MainTabKey;
  currentEvolution: EvolutionChoice | null;
  logs: EmotionLogEntry[];
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  roomItemPlacements: RoomItemPlacements;
  theme?: MonsterTheme;
};

export function EmotionLogScreen({
  activeTab,
  currentEvolution,
  logs,
  onMogumoguPress,
  onTabPress,
  roomItemPlacements,
  theme = monsterTheme,
}: EmotionLogScreenProps) {
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<EmotionPeriod>("week");
  const artboardWidth = Math.min(width, 430);
  const periodLogs = useMemo(
    () => filterLogsByPeriod(logs, period),
    [logs, period]
  );
  const analysisItems = useMemo(
    () => compactAnalysisItems(countLogsByFeeling(periodLogs)),
    [periodLogs]
  );
  const recentLogs = useMemo(
    () =>
      [...periodLogs]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
        )
        .slice(0, 3),
    [periodLogs]
  );
  const primaryFeeling = analysisItems[0]?.feeling ?? "モヤモヤ";
  const periodLabel =
    period === "week" ? "今週" : period === "month" ? "今月" : "今年";

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={emotionRecordsDesign}
          style={styles.designImage}
        />

        <PeriodControl onChange={setPeriod} value={period} />

        <View style={styles.rangeOverlay}>
          <Text numberOfLines={1} style={styles.rangeText}>
            {getPeriodRangeLabel(period)}
          </Text>
        </View>

        <View style={styles.summaryOverlay}>
          <Text style={styles.summaryTitle}>{periodLabel}のモヤモヤバランス</Text>

          <View style={styles.balanceRow}>
            <DonutChart
              colors={chartColors}
              items={analysisItems}
              size={artboardWidth * 0.33}
            />

            <View style={styles.legend}>
              {analysisItems.length === 0 ? (
                <Text style={styles.emptyLegend}>
                  モヤモヤを食べてもらうと、ここに気持ちのバランスが出ます。
                </Text>
              ) : (
                analysisItems.map((item, index) => (
                  <View key={item.feeling} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        },
                      ]}
                    />
                    <Text numberOfLines={1} style={styles.legendFeeling}>
                      {item.feeling}
                    </Text>
                    <Text style={styles.legendPercent}>
                      {Math.round(item.ratio * 100)}%
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeading}>
              <MaterialCommunityIcons
                color="#9070e5"
                name="lightbulb-on-outline"
                size={25}
              />
              <Text style={styles.insightTitle}>気づき</Text>
            </View>
            <Text numberOfLines={2} style={styles.insightText}>
              {periodLogs.length === 0
                ? "まだ記録はありません。気持ちを吐き出せたら、一緒に振り返れます。"
                : `${periodLabel}は「${primaryFeeling}」が少し多めでした。吐き出せたことを大切にしましょう。`}
            </Text>
          </View>
        </View>

        <View style={styles.logsOverlay}>
          <Text style={styles.logsTitle}>{periodLabel}のログ</Text>

          {recentLogs.length === 0 ? (
            <View style={styles.emptyLogCard}>
              <MaterialCommunityIcons
                color="#ae9add"
                name="notebook-heart-outline"
                size={30}
              />
              <View style={styles.emptyLogCopy}>
                <Text style={styles.emptyLogTitle}>まだ記録がありません</Text>
                <Text style={styles.emptyLogText}>
                  もぐもぐすると、この期間の記録が残ります。
                </Text>
              </View>
            </View>
          ) : (
            recentLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logMonsterFrame}>
                  <DressedMonsterPreview
                    evolutionVisual={currentEvolution?.visual}
                    roomItemPlacements={roomItemPlacements}
                    size={52}
                  />
                </View>
                <View style={styles.logCopy}>
                  <Text numberOfLines={1} style={styles.feeling}>
                    {log.feeling}
                  </Text>
                  <Text numberOfLines={1} style={styles.note}>
                    {log.note}
                  </Text>
                </View>
                <Text style={styles.time}>{formatLogTime(log.createdAt)}</Text>
                <MaterialCommunityIcons
                  color="#2b277d"
                  name="chevron-right"
                  size={24}
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomNavigation}>
          <BottomTabBar
            activeTab={activeTab}
            onMogumoguPress={onMogumoguPress}
            onTabPress={onTabPress}
            theme={theme}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function PeriodControl({
  onChange,
  value,
}: {
  onChange: (value: EmotionPeriod) => void;
  value: EmotionPeriod;
}) {
  const options: Array<{ label: string; value: EmotionPeriod }> = [
    { label: "週", value: "week" },
    { label: "月", value: "month" },
    { label: "年", value: "year" },
  ];

  return (
    <View style={styles.periodControl}>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.periodOption,
              isSelected && styles.periodOptionSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.periodOptionText,
                isSelected && styles.periodOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DonutChart({
  colors,
  items,
  size,
}: {
  colors: string[];
  items: AnalysisItem[];
  size: number;
}) {
  const strokeWidth = size * 0.25;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (items.length === 0) {
    return (
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="#ebe5fb"
          strokeWidth={strokeWidth}
        />
      </Svg>
    );
  }

  return (
    <Svg height={size} width={size}>
      {items.map((item, index) => {
        const dashLength = item.ratio * circumference;
        const dashOffset = -offset;
        offset += dashLength;

        return (
          <Circle
            key={item.feeling}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            originX={size / 2}
            originY={size / 2}
            r={radius}
            rotation="-90"
            stroke={colors[index % colors.length]}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
          />
        );
      })}
    </Svg>
  );
}

function compactAnalysisItems(items: AnalysisItem[]) {
  if (items.length <= 4) return items;

  const visibleItems = items.slice(0, 3);
  const otherItems = items.slice(3);
  const otherCount = otherItems.reduce((total, item) => total + item.count, 0);
  const otherRatio = otherItems.reduce((total, item) => total + item.ratio, 0);

  return [
    ...visibleItems,
    { count: otherCount, feeling: "その他", ratio: otherRatio },
  ];
}

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  balanceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 17,
    marginTop: 13,
  },
  bottomNavigation: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  container: {
    backgroundColor: "#fbfaff",
    flex: 1,
    overflow: "hidden",
  },
  designImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  emptyLegend: {
    color: "#6d6a89",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },
  emptyLogCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e1daf8",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 18,
    shadowColor: "#7263a4",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 13,
  },
  emptyLogCopy: {
    flex: 1,
    marginLeft: 12,
  },
  emptyLogText: {
    color: "#74718c",
    fontSize: 12,
    marginTop: 3,
  },
  emptyLogTitle: {
    color: "#27246d",
    fontSize: 16,
    fontWeight: "900",
  },
  feeling: {
    color: "#25236e",
    fontSize: 16,
    fontWeight: "900",
  },
  insightCard: {
    backgroundColor: "#faf9ff",
    borderColor: "#ddd4f7",
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  insightHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  insightText: {
    color: "#292673",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 21,
    marginLeft: 34,
    marginTop: 4,
  },
  insightTitle: {
    color: "#292673",
    fontSize: 16,
    fontWeight: "900",
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendDot: {
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    borderWidth: 1,
    height: 13,
    width: 13,
  },
  legendFeeling: {
    color: "#292673",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  legendPercent: {
    color: "#292673",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
    width: 39,
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  logCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#ddd7f5",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    height: "25.4%",
    marginBottom: "2.8%",
    paddingHorizontal: 14,
    shadowColor: "#7263a4",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 13,
  },
  logCopy: {
    flex: 1,
    marginLeft: 9,
    minWidth: 0,
  },
  logMonsterFrame: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
    width: 50,
  },
  logsOverlay: {
    backgroundColor: "transparent",
    bottom: "10.2%",
    left: "4.9%",
    paddingHorizontal: 1,
    paddingTop: 4,
    position: "absolute",
    right: "4.9%",
    top: "57.2%",
    zIndex: 8,
  },
  logsTitle: {
    color: "#25236e",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: "4%",
    textAlign: "center",
  },
  note: {
    color: "#37347d",
    fontSize: 13,
    marginTop: 5,
  },
  periodControl: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderColor: "#d8d0f3",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    height: "4.25%",
    left: "22.5%",
    overflow: "hidden",
    position: "absolute",
    top: "11.25%",
    width: "55%",
    zIndex: 10,
  },
  periodOption: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  periodOptionSelected: {
    backgroundColor: "#b89aef",
    borderColor: "#a381e8",
    borderRadius: 12,
    borderWidth: 1,
  },
  periodOptionText: {
    color: "#292673",
    fontSize: 17,
    fontWeight: "900",
  },
  periodOptionTextSelected: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.82,
  },
  rangeOverlay: {
    alignItems: "center",
    backgroundColor: "transparent",
    height: "4.2%",
    justifyContent: "center",
    left: "26%",
    position: "absolute",
    top: "16.35%",
    width: "48%",
    zIndex: 9,
  },
  rangeText: {
    color: "#292673",
    fontSize: 19,
    fontWeight: "900",
  },
  summaryOverlay: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 20,
    borderWidth: 1,
    left: "10.2%",
    paddingHorizontal: "6.5%",
    paddingTop: "2.1%",
    position: "absolute",
    top: "21.3%",
    width: "79.7%",
    zIndex: 8,
  },
  summaryTitle: {
    color: "#292673",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  time: {
    color: "#7166ba",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
    marginRight: 1,
  },
});
