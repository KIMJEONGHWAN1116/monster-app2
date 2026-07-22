import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { ProfileAvatarId } from "../state/profile";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const profileSetupDesign = require("../../../assets/images/designs/profile-setup-design.png");
const launchSilhouette = require("../../../assets/images/launch/launch-silhouette.png");

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
  const { width } = useWindowDimensions();
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
  const artboardWidth = Math.min(width, 430);
  const silhouetteSize = artboardWidth * 0.48;
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
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={profileSetupDesign}
          style={styles.designImage}
        />

        {onBack ? (
          <Pressable
            accessibilityLabel="戻る"
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialCommunityIcons
              color={theme.colors.lavender}
              name="chevron-left"
              size={29}
            />
          </Pressable>
        ) : null}

        <View
          pointerEvents="none"
          style={[
            styles.silhouetteSlot,
            { height: silhouetteSize, width: silhouetteSize },
          ]}
        >
          <Image
            resizeMode="contain"
            source={launchSilhouette}
            style={styles.fillImage}
          />
        </View>

        <Pressable
          accessibilityLabel="ギャラリーからプロフィール写真を選ぶ"
          accessibilityRole="button"
          onPress={pickProfileImage}
          style={({ pressed }) => [
            styles.photoCircleHotspot,
            pressed && styles.buttonPressed,
          ]}
        >
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.photoFallback}>
              <MaterialCommunityIcons
                color="#8d79d9"
                name="account"
                size={58}
              />
            </View>
          )}
        </Pressable>

        <TextInput
          accessibilityLabel="モンスターのニックネーム"
          autoCapitalize="none"
          maxLength={16}
          onChangeText={setMonsterName}
          placeholder="もぐちゃん"
          placeholderTextColor="#aaa2b8"
          returnKeyType="done"
          style={styles.nameInput}
          value={monsterName}
        />

        <Pressable
          accessibilityLabel="誕生日を選ぶ"
          accessibilityRole="button"
          onPress={() => setIsBirthdayPickerOpen(true)}
          style={({ pressed }) => [
            styles.birthdayControl,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.birthdayText}>
            {birthYear} 年　 {birthMonth} 月　 {birthDay} 日
          </Text>
          <MaterialCommunityIcons
            color={theme.colors.lavender}
            name="calendar-month-outline"
            size={24}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="ギャラリーからプロフィール写真を選ぶ"
          accessibilityRole="button"
          onPress={pickProfileImage}
          style={({ pressed }) => [
            styles.galleryHotspot,
            pressed && styles.buttonPressed,
          ]}
        >
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              style={styles.galleryThumb}
            />
          ) : (
            <View style={styles.galleryFallback}>
              <MaterialCommunityIcons
                color="#8d79d9"
                name="account"
                size={25}
              />
            </View>
          )}
        </Pressable>

        <Pressable
          accessibilityLabel={isEditing ? "保存する" : "登録する"}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submitProfile}
          style={({ pressed }) => [
            styles.submitHotspot,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.buttonPressed,
          ]}
        >
          {isEditing ? <Text style={styles.submitText}>保存する</Text> : null}
        </Pressable>
      </View>

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
    listRef.current?.scrollToIndex({ animated: true, index });
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
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "#dfd3f7",
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    left: "5.5%",
    position: "absolute",
    top: "4.5%",
    width: 44,
    zIndex: 20,
  },
  birthdayControl: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 18,
    flexDirection: "row",
    height: "6.5%",
    justifyContent: "space-between",
    left: "8.6%",
    paddingHorizontal: 22,
    position: "absolute",
    top: "58.8%",
    width: "82%",
    zIndex: 10,
  },
  birthdayModal: {
    borderRadius: 26,
    borderWidth: 1,
    maxWidth: 370,
    padding: 18,
    width: "100%",
  },
  birthdayText: {
    color: "#191d69",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  container: {
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
  fillImage: {
    height: "100%",
    width: "100%",
  },
  galleryFallback: {
    alignItems: "center",
    backgroundColor: "#eee9fb",
    borderRadius: 999,
    height: "71%",
    justifyContent: "center",
    marginLeft: "4.5%",
    width: "13.5%",
  },
  galleryHotspot: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    height: "7.6%",
    left: "8.6%",
    position: "absolute",
    top: "71.8%",
    width: "82%",
    zIndex: 10,
  },
  galleryThumb: {
    borderRadius: 999,
    height: "71%",
    marginLeft: "4.5%",
    width: "13.5%",
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
  nameInput: {
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 18,
    color: "#191d69",
    fontSize: 21,
    fontWeight: "900",
    height: "6.4%",
    left: "8.6%",
    letterSpacing: 0,
    paddingHorizontal: 22,
    position: "absolute",
    top: "45.9%",
    width: "82%",
    zIndex: 10,
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
  photoCircleHotspot: {
    borderRadius: 999,
    height: "17.6%",
    left: "39.1%",
    overflow: "hidden",
    position: "absolute",
    top: "17.5%",
    width: "37.2%",
    zIndex: 9,
  },
  photoFallback: {
    alignItems: "center",
    backgroundColor: "#eee9fb",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  profileImage: {
    height: "100%",
    width: "100%",
  },
  silhouetteSlot: {
    left: "7.5%",
    opacity: 0.76,
    position: "absolute",
    top: "18.8%",
    zIndex: 8,
  },
  submitDisabled: {
    backgroundColor: "rgba(226, 217, 244, 0.9)",
  },
  submitHotspot: {
    alignItems: "center",
    borderRadius: 999,
    height: "7.8%",
    justifyContent: "center",
    left: "10.5%",
    position: "absolute",
    top: "82.7%",
    width: "79%",
    zIndex: 12,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
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
