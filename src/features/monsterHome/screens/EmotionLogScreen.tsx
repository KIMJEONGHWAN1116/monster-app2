import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { BottomTabBar } from "../components/BottomTabBar";
import { DressedMonsterPreview } from "../components/DressedMonsterPreview";
import { SoundPressable as Pressable } from "../components/SoundPressable";
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

const roomBackground = require("../../../assets/images/shop/shop-room-background.png");

const chartColors = ["#61cdbb", "#eb8fbb", "#779ee9", "#a888e7"];
const anxietyFeelings = new Set(["不安", "心配", "こわい"]);
const angerFeelings = new Set(["イライラ", "怒り", "くやしい"]);

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
  const chartSize = Math.min(126, artboardWidth * 0.31);
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
        .slice(0, 6),
    [periodLogs]
  );
  const primaryFeeling = analysisItems[0]?.feeling ?? "モヤモヤ";
  const periodLabel =
    period === "week" ? "今週" : period === "month" ? "今月" : "今年";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={roomBackground}
          style={styles.backgroundImage}
        />
        <View pointerEvents="none" style={styles.backgroundWash} />

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              color="#7657d9"
              name="notebook-heart-outline"
              size={25}
            />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>モヤモヤ記録</Text>
            <Text style={styles.headerSubtitle}>気持ちの流れを、やさしく振り返る</Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeValue}>{logs.length}</Text>
            <Text style={styles.totalBadgeLabel}>記録</Text>
          </View>
        </View>

        <PeriodControl onChange={setPeriod} value={period} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.rangeRow}>
            <View style={styles.rangeLine} />
            <View style={styles.rangePill}>
              <MaterialCommunityIcons
                color="#7657d9"
                name="calendar-blank-outline"
                size={15}
              />
              <Text numberOfLines={1} style={styles.rangeText}>
                {getPeriodRangeLabel(period)}
              </Text>
            </View>
            <View style={styles.rangeLine} />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIconMint}>
                <MaterialCommunityIcons
                  color="#389f90"
                  name="chart-donut"
                  size={22}
                />
              </View>
              <View style={styles.sectionHeadingCopy}>
                <Text style={styles.sectionEyebrow}>{periodLabel}の記録</Text>
                <Text style={styles.sectionTitle}>こころのバランス</Text>
              </View>
              <View style={styles.periodCount}>
                <Text style={styles.periodCountValue}>{periodLogs.length}</Text>
                <Text style={styles.periodCountUnit}>件</Text>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <View
                style={[
                  styles.chartWrap,
                  { height: chartSize, width: chartSize },
                ]}
              >
                <DonutChart
                  colors={chartColors}
                  items={analysisItems}
                  size={chartSize}
                />
                <View pointerEvents="none" style={styles.chartCenter}>
                  <Text style={styles.chartCenterValue}>{periodLogs.length}</Text>
                  <Text style={styles.chartCenterLabel}>もぐ</Text>
                </View>
              </View>

              <View style={styles.legend}>
                {analysisItems.length === 0 ? (
                  <View style={styles.emptyLegend}>
                    <MaterialCommunityIcons
                      color="#a698cf"
                      name="chart-timeline-variant-shimmer"
                      size={23}
                    />
                    <Text style={styles.emptyLegendText}>
                      もぐもぐすると、ここに気持ちのバランスが現れます。
                    </Text>
                  </View>
                ) : (
                  analysisItems.map((item, index) => (
                    <View key={item.feeling} style={styles.legendItem}>
                      <View style={styles.legendLabelRow}>
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
                      <View style={styles.legendTrack}>
                        <View
                          style={[
                            styles.legendFill,
                            {
                              backgroundColor:
                                chartColors[index % chartColors.length],
                              width: `${Math.max(8, item.ratio * 100)}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <MaterialCommunityIcons
                  color="#8d6ddc"
                  name="lightbulb-on-outline"
                  size={21}
                />
              </View>
              <View style={styles.insightCopy}>
                <Text style={styles.insightTitle}>小さな気づき</Text>
                <Text style={styles.insightText}>
                  {periodLogs.length === 0
                    ? "まだ記録はありません。吐き出せた気持ちを、ここで一緒に振り返れます。"
                    : `${periodLabel}は「${primaryFeeling}」が少し多めでした。言葉にできたことを大切にしましょう。`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionGap} />

          <View style={styles.logsSection}>
            <View style={styles.logsHeading}>
              <View style={styles.logsTitleRow}>
                <View style={styles.sectionIconPink}>
                  <MaterialCommunityIcons
                    color="#d6689f"
                    name="heart-box-outline"
                    size={22}
                  />
                </View>
                <View>
                  <Text style={styles.sectionEyebrow}>新しい順</Text>
                  <Text style={styles.sectionTitle}>最近の記録</Text>
                </View>
              </View>
              {recentLogs.length > 0 && (
                <Text style={styles.recentCount}>最新 {recentLogs.length}件</Text>
              )}
            </View>

            {recentLogs.length === 0 ? (
              <View style={styles.emptyLogCard}>
                <View style={styles.emptyLogIcon}>
                  <MaterialCommunityIcons
                    color="#9a83d6"
                    name="notebook-heart-outline"
                    size={29}
                  />
                </View>
                <View style={styles.emptyLogCopy}>
                  <Text style={styles.emptyLogTitle}>まだ記録がありません</Text>
                  <Text style={styles.emptyLogText}>
                    モヤモヤを食べてもらうと、この期間の記録が残ります。
                  </Text>
                </View>
              </View>
            ) : (
              recentLogs.map((log) => {
                const palette = getFeelingPalette(log.feeling);

                return (
                  <View key={log.id} style={styles.logCard}>
                    <View
                      style={[
                        styles.logAccent,
                        { backgroundColor: palette.accent },
                      ]}
                    />
                    <View
                      style={[
                        styles.logMonsterFrame,
                        { backgroundColor: palette.soft },
                      ]}
                    >
                      <DressedMonsterPreview
                        evolutionVisual={currentEvolution?.visual}
                        roomItemPlacements={roomItemPlacements}
                        size={50}
                      />
                    </View>
                    <View style={styles.logCopy}>
                      <View style={styles.logTopRow}>
                        <Text numberOfLines={1} style={styles.feeling}>
                          {log.feeling}
                        </Text>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: palette.soft },
                          ]}
                        >
                          <View
                            style={[
                              styles.typeDot,
                              { backgroundColor: palette.accent },
                            ]}
                          />
                          <Text
                            style={[
                              styles.typeText,
                              { color: palette.text },
                            ]}
                          >
                            {palette.label}
                          </Text>
                        </View>
                      </View>
                      <Text numberOfLines={2} style={styles.note}>
                        {log.note}
                      </Text>
                    </View>
                    <View style={styles.timeWrap}>
                      <MaterialCommunityIcons
                        color="#9388bd"
                        name="clock-outline"
                        size={13}
                      />
                      <Text style={styles.time}>{formatLogTime(log.createdAt)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

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
    { label: "今週", value: "week" },
    { label: "今月", value: "month" },
    { label: "今年", value: "year" },
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
  const strokeWidth = size * 0.2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Svg height={size} width={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        r={radius}
        stroke="#ece7f7"
        strokeWidth={strokeWidth}
      />
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

function getFeelingPalette(feeling: string) {
  if (anxietyFeelings.has(feeling)) {
    return {
      accent: "#55c7b6",
      label: "不安タイプ",
      soft: "#e7f8f5",
      text: "#308f82",
    };
  }

  if (angerFeelings.has(feeling)) {
    return {
      accent: "#ea88ae",
      label: "怒りタイプ",
      soft: "#fff0f5",
      text: "#c35e88",
    };
  }

  return {
    accent: "#789fe9",
    label: "悲しみタイプ",
    soft: "#edf3ff",
    text: "#587dc4",
  };
}

const cardShadow = {
  elevation: 5,
  shadowColor: "#6f5ba3",
  shadowOffset: { height: 7, width: 0 },
  shadowOpacity: 0.11,
  shadowRadius: 16,
};

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    opacity: 0.62,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  backgroundWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(250, 248, 255, 0.46)",
  },
  balanceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    marginTop: 24,
  },
  bottomNavigation: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  chartCenter: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  chartCenterLabel: {
    color: "#8e86aa",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
  },
  chartCenterValue: {
    color: "#302a76",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
  },
  chartWrap: {
    flexShrink: 0,
    position: "relative",
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  emptyLegend: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  emptyLegendText: {
    color: "#716c89",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 8,
  },
  emptyLogCard: {
    ...cardShadow,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(218, 209, 245, 0.9)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 104,
    paddingHorizontal: 18,
  },
  emptyLogCopy: {
    flex: 1,
    marginLeft: 13,
  },
  emptyLogIcon: {
    alignItems: "center",
    backgroundColor: "#f1ebff",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  emptyLogText: {
    color: "#74718c",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  emptyLogTitle: {
    color: "#27246d",
    fontSize: 16,
    fontWeight: "900",
  },
  feeling: {
    color: "#282371",
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 20,
    paddingTop: 5,
    zIndex: 5,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "rgba(242, 236, 255, 0.92)",
    borderColor: "rgba(211, 198, 244, 0.92)",
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerSubtitle: {
    color: "#817a9e",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 3,
  },
  headerTitle: {
    color: "#282371",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  insightCopy: {
    flex: 1,
    marginLeft: 11,
  },
  insightIcon: {
    alignItems: "center",
    backgroundColor: "#f1ebff",
    borderRadius: 13,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  insightRow: {
    alignItems: "flex-start",
    borderTopColor: "#ece7f7",
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 24,
    paddingTop: 18,
  },
  insightText: {
    color: "#5f5a78",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 4,
  },
  insightTitle: {
    color: "#302a76",
    fontSize: 14,
    fontWeight: "900",
  },
  legend: {
    flex: 1,
    gap: 10,
    minHeight: 105,
  },
  legendDot: {
    borderColor: "rgba(255,255,255,0.95)",
    borderRadius: 999,
    borderWidth: 1,
    height: 11,
    width: 11,
  },
  legendFeeling: {
    color: "#373175",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  legendFill: {
    borderRadius: 999,
    height: "100%",
  },
  legendItem: {
    gap: 4,
  },
  legendLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  legendPercent: {
    color: "#373175",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    width: 34,
  },
  legendTrack: {
    backgroundColor: "#eeeaf7",
    borderRadius: 999,
    height: 4,
    marginLeft: 18,
    overflow: "hidden",
  },
  logAccent: {
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 5,
  },
  logCard: {
    ...cardShadow,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(221, 215, 245, 0.94)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 13,
    minHeight: 92,
    overflow: "hidden",
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 13,
    paddingTop: 14,
    position: "relative",
  },
  logCopy: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
  },
  logMonsterFrame: {
    alignItems: "center",
    borderRadius: 17,
    height: 58,
    justifyContent: "center",
    overflow: "hidden",
    width: 58,
  },
  logsHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  logsSection: {
    width: "100%",
  },
  logsTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  logTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  note: {
    color: "#5f5b78",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  periodControl: {
    ...cardShadow,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(214, 204, 241, 0.92)",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    height: 48,
    padding: 4,
    width: "91%",
    zIndex: 6,
  },
  periodCount: {
    alignItems: "baseline",
    backgroundColor: "#f2edff",
    borderColor: "#e1d7fa",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  periodCountUnit: {
    color: "#786fa0",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 2,
  },
  periodCountValue: {
    color: "#7557d1",
    fontSize: 17,
    fontWeight: "900",
  },
  periodOption: {
    alignItems: "center",
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
  },
  periodOptionSelected: {
    backgroundColor: "#a989e7",
    shadowColor: "#7254bd",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  periodOptionText: {
    color: "#6f698a",
    fontSize: 14,
    fontWeight: "900",
  },
  periodOptionTextSelected: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
  rangeLine: {
    backgroundColor: "rgba(199, 187, 230, 0.72)",
    flex: 1,
    height: 1,
  },
  rangePill: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderColor: "rgba(219, 210, 243, 0.9)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    maxWidth: "60%",
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  rangeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 5,
  },
  rangeText: {
    color: "#554b8d",
    fontSize: 12,
    fontWeight: "900",
  },
  recentCount: {
    color: "#8a82a5",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 5,
  },
  scrollContent: {
    paddingBottom: 126,
    paddingHorizontal: 18,
    paddingTop: 17,
  },
  scrollView: {
    flex: 1,
    zIndex: 3,
  },
  sectionEyebrow: {
    color: "#9187af",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 2,
  },
  sectionGap: {
    height: 28,
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
  },
  sectionHeadingCopy: {
    flex: 1,
    marginLeft: 11,
  },
  sectionIconMint: {
    alignItems: "center",
    backgroundColor: "#e4f8f4",
    borderRadius: 14,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  sectionIconPink: {
    alignItems: "center",
    backgroundColor: "#fff0f7",
    borderRadius: 14,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  sectionTitle: {
    color: "#29246f",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  summaryCard: {
    ...cardShadow,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(217, 208, 243, 0.95)",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 19,
    paddingVertical: 20,
  },
  time: {
    color: "#8d84ae",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 3,
  },
  timeWrap: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 6,
  },
  totalBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(216, 205, 242, 0.94)",
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 46,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  totalBadgeLabel: {
    color: "#8a82a5",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 1,
  },
  totalBadgeValue: {
    color: "#6f52c8",
    fontSize: 16,
    fontWeight: "900",
  },
  typeBadge: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  typeDot: {
    borderRadius: 999,
    height: 6,
    marginRight: 4,
    width: 6,
  },
  typeText: {
    fontSize: 9,
    fontWeight: "900",
  },
});
