import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { BottomTabBar } from "../components/BottomTabBar";
import { PageHeader } from "../components/PageHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import {
  countLogsByFeeling,
  EmotionLogEntry,
  EmotionPeriod,
  filterLogsByPeriod,
  formatLogTime,
  getPeriodRangeLabel,
  groupLogsByDay,
} from "../state/emotionLog";
import { MainTabKey } from "../state/navigation";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type EmotionLogScreenProps = {
  activeTab: MainTabKey;
  logs: EmotionLogEntry[];
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function EmotionLogScreen({
  activeTab,
  logs,
  onMogumoguPress,
  onTabPress,
  theme = monsterTheme,
}: EmotionLogScreenProps) {
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<EmotionPeriod>("week");
  const contentWidth = Math.min(width - 24, 430);
  const chartColors = [
    theme.colors.lavender,
    theme.colors.lavenderSoft,
    "#c09df7",
    "#b694f0",
    "#bea5ef",
  ];
  const periodLogs = useMemo(
    () => filterLogsByPeriod(logs, period),
    [logs, period]
  );
  const groupedLogs = groupLogsByDay(periodLogs);
  const analysisItems = countLogsByFeeling(periodLogs).slice(0, 5);
  const primaryFeeling = analysisItems[0]?.feeling ?? "モヤモヤ";
  const periodLabel = period === "week" ? "今週" : period === "month" ? "今月" : "今年";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <PageHeader align="left" theme={theme} title="モヤモヤ記録" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <SegmentedControl
            onChange={setPeriod}
            options={[
              { label: "週", value: "week" },
              { label: "月", value: "month" },
              { label: "年", value: "year" },
            ]}
            theme={theme}
            value={period}
          />

          <Text style={styles.rangeLabel}>{getPeriodRangeLabel(period)}</Text>

          <View style={[styles.summaryCard, theme.shadow]}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryEyebrow}>{periodLabel}のバランス</Text>
                <Text style={styles.summaryTitle}>
                  {periodLogs.length === 0
                    ? "まだ静かです"
                    : `「${primaryFeeling}」多め`}
                </Text>
              </View>
              <View
                style={[
                  styles.logCountBadge,
                  { backgroundColor: theme.colors.lavenderPale },
                ]}
              >
                <Text
                  style={[styles.logCount, { color: theme.colors.lavender }]}
                >
                  {periodLogs.length}
                </Text>
                <Text
                  style={[styles.logCountLabel, { color: theme.colors.lavender }]}
                >
                  件
                </Text>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <DonutChart
                colors={chartColors}
                items={analysisItems}
                trackColor={theme.colors.lavenderTrack}
              />

              <View style={styles.legend}>
                {analysisItems.length === 0 ? (
                  <Text style={styles.emptyLegend}>
                    モヤモヤを食べてもらうと、ここに比率が出ます。
                  </Text>
                ) : (
                  analysisItems.map((item, index) => (
                    <View key={item.feeling} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: chartColors[index % chartColors.length] },
                        ]}
                      />
                      <Text style={styles.legendLabel}>{item.feeling}</Text>
                      <Text style={styles.legendPercent}>
                        {Math.round(item.ratio * 100)}%
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View
              style={[
                styles.insightBox,
                { backgroundColor: theme.colors.lavenderPale },
              ]}
            >
              <Text style={styles.insightTitle}>気づき</Text>
              <Text style={styles.insightText}>
                {periodLogs.length === 0
                  ? "記録が増えると、モンスターが気持ちの傾向を一緒に見つけます。"
                  : `${periodLabel}は「${primaryFeeling}」が少し目立っています。吐き出せたことを、まず大切にしましょう。`}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{periodLabel}のログ</Text>

          {groupedLogs.length === 0 ? (
            <View style={[styles.emptyCard, theme.shadow]}>
              <Text style={styles.emptyTitle}>まだ記録がありません</Text>
              <Text style={styles.emptyText}>
                この期間にモヤモヤを食べてもらうと、ここに残ります。
              </Text>
            </View>
          ) : (
            groupedLogs.map((group) => (
              <View key={group.label} style={styles.group}>
                <Text style={styles.groupTitle}>{group.label}</Text>

                {group.logs.map((log) => (
                  <View key={log.id} style={[styles.logCard, theme.shadow]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.feeling}>{log.feeling}</Text>
                      <Text style={styles.time}>{formatLogTime(log.createdAt)}</Text>
                    </View>
                    <Text style={styles.note}>{log.note}</Text>
                    <Text style={styles.monsterMessage}>
                      モンスターが「{log.feeling}」を食べてくれました。
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomTabBar
        activeTab={activeTab}
        onMogumoguPress={onMogumoguPress}
        onTabPress={onTabPress}
        theme={theme}
      />
    </SafeAreaView>
  );
}

function DonutChart({
  colors,
  items,
  trackColor,
}: {
  colors: string[];
  items: ReturnType<typeof countLogsByFeeling>;
  trackColor: string;
}) {
  const size = 132;
  const strokeWidth = 30;
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
          stroke={trackColor}
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

const styles = StyleSheet.create({
  balanceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    marginTop: 20,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
  },
  emptyLegend: {
    color: monsterTheme.colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: monsterTheme.colors.white,
    borderRadius: 18,
    marginTop: 28,
    padding: 24,
  },
  emptyText: {
    color: monsterTheme.colors.muted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 8,
  },
  emptyTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  feeling: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "900",
  },
  group: {
    marginTop: 22,
  },
  groupTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 14,
  },
  insightBox: {
    borderRadius: 18,
    marginTop: 20,
    padding: 16,
  },
  insightText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 8,
  },
  insightTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  legend: {
    flex: 1,
    gap: 9,
  },
  legendDot: {
    borderRadius: 999,
    height: 17,
    width: 17,
  },
  legendLabel: {
    color: "#222222",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  legendPercent: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "800",
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  logCard: {
    backgroundColor: monsterTheme.colors.white,
    borderRadius: 16,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  monsterMessage: {
    color: "#353846",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 4,
  },
  note: {
    color: "#353846",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 12,
  },
  logCount: {
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 27,
  },
  logCountBadge: {
    alignItems: "center",
    borderRadius: 18,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  logCountLabel: {
    fontSize: 11,
    fontWeight: "900",
  },
  rangeLabel: {
    color: "#333333",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 18,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 28,
  },
  summaryCard: {
    backgroundColor: monsterTheme.colors.white,
    borderRadius: 24,
    padding: 20,
  },
  summaryEyebrow: {
    color: monsterTheme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  time: {
    color: "#5a5a62",
    fontSize: 15,
    fontWeight: "900",
  },
});
