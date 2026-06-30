import { Pressable, StyleSheet, Text, View } from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

type SegmentedControlProps<T extends string> = {
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  theme?: MonsterTheme;
  value: T;
};

export function SegmentedControl<T extends string>({
  onChange,
  options,
  theme = monsterTheme,
  value,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "rgba(255, 255, 255, 0.78)",
          borderColor: theme.colors.lavenderTrack,
        },
        theme.shadow,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            aria-selected={selected}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.item,
              selected && {
                backgroundColor: theme.colors.lavenderPale,
                borderColor: "rgba(255, 255, 255, 0.76)",
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                selected && {
                  color: theme.colors.lavender,
                  fontWeight: "900",
                },
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

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    padding: 5,
    width: "100%",
  },
  item: {
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  label: {
    color: "#2c2c35",
    fontSize: 16,
    fontWeight: "700",
  },
});
