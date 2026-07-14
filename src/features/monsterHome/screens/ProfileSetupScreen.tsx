import { useMemo, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import {
  getProfileAvatarOption,
  ProfileAvatarId,
} from "../state/profile";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const birthdayWheelItemHeight = 44;
const birthdayWheelVisibleItems = 5;
const birthdayWheelPadding = birthdayWheelItemHeight * 2;
const birthdayWheelHeight = birthdayWheelItemHeight * birthdayWheelVisibleItems;

type ProfileSetupValue = {
  monsterName: string;
  profileAvatarId: ProfileAvatarId;
  profileImageUri: string;
  userBirthday: string;
};

type ProfileSetupScreenProps = {
  initialMonsterName: string;
  initialProfileAvatarId: ProfileAvatarId;
  initialProfileImageUri: string;
  initialUserBirthday: string;
  isEditing?: boolean;
  onBack?: () => void;
  onSubmit: (value: ProfileSetupValue) => void;
  theme?: MonsterTheme;
};

export function ProfileSetupScreen({
  initialMonsterName,
  initialProfileAvatarId,
  initialProfileImageUri,
  initialUserBirthday,
  isEditing = false,
  onBack,
  onSubmit,
  theme = monsterTheme,
}: ProfileSetupScreenProps) {
  const { height, width } = useWindowDimensions();
  const [monsterName, setMonsterName] = useState(initialMonsterName);
  const [profileAvatarId] = useState<ProfileAvatarId>(initialProfileAvatarId);
  const [profileImageUri, setProfileImageUri] = useState(initialProfileImageUri);
  const [isBirthdayPickerOpen, setIsBirthdayPickerOpen] = useState(false);
  const [birthYear, setBirthYear] = useState(
    parseBirthday(initialUserBirthday).year
  );
  const [birthMonth, setBirthMonth] = useState(
    parseBirthday(initialUserBirthday).month
  );
  const [birthDay, setBirthDay] = useState(
    parseBirthday(initialUserBirthday).day
  );
  const contentWidth = Math.min(width - 36, 430);
  const monsterSize = Math.min(contentWidth * 0.46, height * 0.22, 190);
  const selectedAvatar = getProfileAvatarOption(profileAvatarId);
  const trimmedMonsterName = monsterName.trim();
  const userBirthday = formatBirthday(birthYear, birthMonth, birthDay);
  const canSubmit = trimmedMonsterName.length > 0;
  const years = useMemo(() => buildYearOptions(), []);
  const days = useMemo(
    () => buildDayOptions(birthYear, birthMonth),
    [birthMonth, birthYear]
  );

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const submitProfile = () => {
    if (!canSubmit) return;

    onSubmit({
      monsterName: trimmedMonsterName.slice(0, 16),
      profileAvatarId,
      profileImageUri,
      userBirthday,
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardRoot}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <View style={styles.header}>
              <View style={styles.headerSide}>
                {onBack ? (
                  <Pressable
                    accessibilityLabel="戻る"
                    accessibilityRole="button"
                    onPress={onBack}
                    style={({ pressed }) => [
                      styles.headerButton,
                      {
                        backgroundColor: "rgba(255, 255, 255, 0.72)",
                        borderColor: theme.colors.lavenderTrack,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={28}
                      color={theme.colors.lavender}
                    />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.headerTextBlock}>
                <Text style={[styles.kicker, { color: theme.colors.lavender }]}>
                  {isEditing ? "プロフィール編集" : "はじめまして"}
                </Text>
                <Text style={styles.title}>
                  {isEditing ? "プロフィールを整える" : "きみとモンスターのこと"}
                </Text>
              </View>

              <View style={styles.headerSide} />
            </View>

            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.74)",
                  borderColor: theme.colors.lavenderTrack,
                },
                theme.shadow,
              ]}
            >
              <View style={styles.previewMonster}>
                <MonsterPreview size={monsterSize} />
              </View>
              <View
                style={[
                  styles.avatarPreview,
                  { backgroundColor: selectedAvatar.backgroundColor },
                ]}
              >
                {profileImageUri ? (
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.avatarPreviewImage}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      selectedAvatar.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={32}
                    color={selectedAvatar.color}
                  />
                )}
              </View>
            </View>

            <View style={styles.formBlock}>
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>モンスターのニックネーム</Text>
                <TextInput
                  autoCapitalize="none"
                  maxLength={16}
                  onChangeText={setMonsterName}
                  placeholder="例: もぐもん"
                  placeholderTextColor="#aaa2b8"
                  style={[
                    styles.input,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: theme.colors.lavenderTrack,
                    },
                  ]}
                  value={monsterName}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>あなたの誕生日</Text>
                <Pressable
                  accessibilityLabel="誕生日を選ぶ"
                  accessibilityRole="button"
                  onPress={() => setIsBirthdayPickerOpen(true)}
                  style={({ pressed }) => [
                    styles.selectInput,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: theme.colors.lavenderTrack,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.selectInputText}>{userBirthday}</Text>
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={23}
                    color={theme.colors.lavender}
                  />
                </Pressable>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>プロフィール写真</Text>
                <Pressable
                  accessibilityLabel="ギャラリーからプロフィール写真を選ぶ"
                  accessibilityRole="button"
                  onPress={pickProfileImage}
                  style={({ pressed }) => [
                    styles.photoPickerButton,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: theme.colors.lavenderTrack,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.photoThumb,
                      { backgroundColor: selectedAvatar.backgroundColor },
                    ]}
                  >
                    {profileImageUri ? (
                      <Image
                        source={{ uri: profileImageUri }}
                        style={styles.photoThumbImage}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={28}
                        color={theme.colors.lavender}
                      />
                    )}
                  </View>
                  <View style={styles.photoTextBlock}>
                    <Text style={styles.photoTitle}>
                      {profileImageUri ? "写真を変更" : "ギャラリーから選ぶ"}
                    </Text>
                    <Text style={styles.photoSubtitle}>
                      正方形に切り抜いてプロフィールに使います
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityLabel={isEditing ? "保存する" : "登録する"}
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={submitProfile}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: canSubmit
                    ? theme.colors.lavender
                    : theme.colors.lavenderTrack,
                },
                theme.shadow,
                pressed && canSubmit && styles.buttonPressed,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? "保存する" : "登録してはじめる"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsBirthdayPickerOpen(false)}
        transparent
        visible={isBirthdayPickerOpen}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.birthdayModal,
              {
                backgroundColor: theme.colors.white,
                borderColor: theme.colors.lavenderTrack,
              },
            ]}
          >
            <Text style={styles.modalTitle}>誕生日を選ぶ</Text>
            <View style={styles.pickerColumns}>
              <BirthdayColumn
                label="年"
                onSelect={(nextYear) => {
                  setBirthYear(nextYear);
                  setBirthDay((currentDay) =>
                    Math.min(currentDay, getDaysInMonth(nextYear, birthMonth))
                  );
                }}
                options={years}
                selectedValue={birthYear}
                theme={theme}
              />
              <BirthdayColumn
                label="月"
                onSelect={(nextMonth) => {
                  setBirthMonth(nextMonth);
                  setBirthDay((currentDay) =>
                    Math.min(currentDay, getDaysInMonth(birthYear, nextMonth))
                  );
                }}
                options={buildNumberOptions(1, 12)}
                selectedValue={birthMonth}
                theme={theme}
              />
              <BirthdayColumn
                label="日"
                onSelect={setBirthDay}
                options={days}
                selectedValue={birthDay}
                theme={theme}
              />
            </View>
            <Pressable
              accessibilityLabel="誕生日を決定"
              accessibilityRole="button"
              onPress={() => setIsBirthdayPickerOpen(false)}
              style={({ pressed }) => [
                styles.modalOkButton,
                { backgroundColor: theme.colors.lavender },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalOkButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BirthdayColumn({
  label,
  onSelect,
  options,
  selectedValue,
  theme,
}: {
  label: string;
  onSelect: (value: number) => void;
  options: number[];
  selectedValue: number;
  theme: MonsterTheme;
}) {
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, options.indexOf(selectedValue));

  const selectValueAtOffset = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = clamp(
      Math.round(event.nativeEvent.contentOffset.y / birthdayWheelItemHeight),
      0,
      options.length - 1
    );
    const nextValue = options[nextIndex];

    if (typeof nextValue === "number" && nextValue !== selectedValue) {
      onSelect(nextValue);
    }
  };

  const selectValue = (value: number, index: number) => {
    onSelect(value);
    listRef.current?.scrollToIndex({
      animated: true,
      index,
    });
  };

  return (
    <View style={styles.pickerColumn}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.wheelFrame}>
        <View
          pointerEvents="none"
          style={[
            styles.wheelSelection,
            {
              borderColor: theme.colors.lavenderTrack,
              top: birthdayWheelPadding,
            },
          ]}
        />
        <FlatList
        ref={listRef}
        contentContainerStyle={styles.pickerList}
        data={options}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          index,
          length: birthdayWheelItemHeight,
          offset: birthdayWheelItemHeight * index,
        })}
        initialScrollIndex={selectedIndex}
        keyExtractor={(value) => `${label}-${value}`}
        onMomentumScrollEnd={selectValueAtOffset}
        onScrollEndDrag={selectValueAtOffset}
        renderItem={({ item, index }) => {
          const isSelected = item === selectedValue;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => selectValue(item, index)}
              style={styles.pickerOption}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  isSelected && { color: theme.colors.lavender },
                  isSelected && styles.pickerOptionTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={birthdayWheelItemHeight}
      />
      </View>
    </View>
  );
}

function parseBirthday(birthday: string) {
  const [year, month, day] = birthday
    .split(".")
    .map((part) => Number(part.replace(/\D/g, "")));
  const today = new Date();
  const fallbackYear = today.getFullYear();
  const parsedYear = Number.isFinite(year) ? year : fallbackYear;
  const parsedMonth = Number.isFinite(month) ? clamp(month, 1, 12) : 1;
  const parsedDay = Number.isFinite(day)
    ? clamp(day, 1, getDaysInMonth(parsedYear, parsedMonth))
    : 1;

  return {
    day: parsedDay,
    month: parsedMonth,
    year: clamp(parsedYear, 1940, fallbackYear),
  };
}

function formatBirthday(year: number, month: number, day: number) {
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
    2,
    "0"
  )}`;
}

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1940 + 1 }, (_, index) =>
    currentYear - index
  );
}

function buildDayOptions(year: number, month: number) {
  return buildNumberOptions(1, getDaysInMonth(year, month));
}

function buildNumberOptions(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  avatarPreview: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 999,
    borderWidth: 2,
    bottom: 18,
    height: 64,
    justifyContent: "center",
    position: "absolute",
    right: 22,
    width: 64,
  },
  avatarPreviewImage: {
    borderRadius: 999,
    height: "100%",
    width: "100%",
  },
  birthdayModal: {
    borderRadius: 26,
    borderWidth: 1,
    maxWidth: 370,
    padding: 18,
    width: "100%",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    alignSelf: "center",
    gap: 18,
  },
  fieldBlock: {
    gap: 9,
  },
  formBlock: {
    gap: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerSide: {
    width: 46,
  },
  headerTextBlock: {
    alignItems: "center",
    flex: 1,
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    color: monsterTheme.colors.ink,
    fontSize: 18,
    fontWeight: "800",
    minHeight: 58,
    paddingHorizontal: 18,
  },
  keyboardRoot: {
    flex: 1,
  },
  kicker: {
    fontSize: 15,
    fontWeight: "900",
  },
  label: {
    color: monsterTheme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(34, 30, 62, 0.28)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalOkButton: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 52,
  },
  modalOkButtonText: {
    color: monsterTheme.colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  modalTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  photoPickerButton: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 74,
    padding: 10,
  },
  photoSubtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  photoTextBlock: {
    flex: 1,
  },
  photoThumb: {
    alignItems: "center",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    overflow: "hidden",
    width: 54,
  },
  photoThumbImage: {
    height: "100%",
    width: "100%",
  },
  photoTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  pickerColumn: {
    flex: 1,
  },
  pickerColumns: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  pickerLabel: {
    color: monsterTheme.colors.muted,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  pickerList: {
    paddingVertical: birthdayWheelPadding,
  },
  pickerOption: {
    alignItems: "center",
    height: birthdayWheelItemHeight,
    justifyContent: "center",
  },
  pickerOptionText: {
    color: "#b2a8c1",
    fontSize: 15,
    fontWeight: "900",
  },
  pickerOptionTextSelected: {
    fontSize: 20,
  },
  previewCard: {
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    minHeight: 220,
    overflow: "visible",
    paddingVertical: 20,
    position: "relative",
  },
  previewMonster: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 34,
    paddingTop: 24,
  },
  selectInput: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 18,
  },
  selectInputText: {
    color: monsterTheme.colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  submitButton: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 62,
  },
  submitButtonText: {
    color: monsterTheme.colors.white,
    fontSize: 21,
    fontWeight: "900",
  },
  title: {
    color: monsterTheme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  wheelFrame: {
    backgroundColor: "rgba(245, 239, 255, 0.72)",
    borderRadius: 18,
    height: birthdayWheelHeight,
    overflow: "hidden",
    position: "relative",
  },
  wheelSelection: {
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: birthdayWheelItemHeight,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
