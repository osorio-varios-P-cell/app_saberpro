import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { useUser } from "@/context/UserContext";
import { BADGES } from "@/data/badges";
import { useColors } from "@/hooks/useColors";
import BadgeCard from "@/components/BadgeCard";

export default function PerfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser, resetUser } = useUser();
  const { progress } = useStudy();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;

  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(user.examDate);

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "SP";

  async function handleSaveDate() {
    await updateUser({ examDate: newDate });
    setEditingDate(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleReset() {
    Alert.alert(
      "Reiniciar cuenta",
      "¿Estás seguro? Se borrarán todos tus datos y progreso.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: async () => {
            await resetUser();
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (isWeb ? 34 : insets.bottom) + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.foreground }]}>
          {user.name || "Estudiante"}
        </Text>
        {user.colegio ? (
          <Text style={[styles.userSchool, { color: colors.mutedForeground }]}>
            {user.colegio}
          </Text>
        ) : null}
        <View style={[styles.calPill, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.calText, { color: colors.foreground }]}>
            Calendario {user.calendario}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{progress.level}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Nivel</Text>
        </View>
        <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.accent }]}>{progress.xp.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP Total</Text>
        </View>
        <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#FF6B35" }]}>{progress.maxStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Racha máx.</Text>
        </View>
      </View>

      {/* Exam date */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={18} color={colors.accent} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fecha del ICFES</Text>
        </View>
        {editingDate ? (
          <View style={styles.dateEdit}>
            <TextInput
              value={newDate}
              onChangeText={setNewDate}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.dateInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              keyboardType="numbers-and-punctuation"
            />
            <View style={styles.dateButtons}>
              <TouchableOpacity
                onPress={() => setEditingDate(false)}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDate}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingDate(true)} style={styles.dateRow}>
            <Text style={[styles.dateValue, { color: user.examDate ? colors.foreground : colors.mutedForeground }]}>
              {user.examDate || "No configurada"}
            </Text>
            <Ionicons name="pencil" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Badges */}
      <Text style={[styles.badgesTitle, { color: colors.foreground }]}>Logros</Text>
      <Text style={[styles.badgesSub, { color: colors.mutedForeground }]}>
        {progress.badges.length} de {BADGES.length} desbloqueados
      </Text>
      <View style={styles.badgeGrid}>
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={progress.badges.includes(badge.id)}
          />
        ))}
      </View>

      {/* Reset */}
      <TouchableOpacity
        onPress={handleReset}
        style={[styles.resetBtn, { borderColor: colors.destructive }]}
      >
        <Ionicons name="trash-outline" size={16} color={colors.destructive} />
        <Text style={[styles.resetText, { color: colors.destructive }]}>Reiniciar progreso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18 },
  avatarSection: { alignItems: "center", gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 30, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  userSchool: { fontSize: 14, fontFamily: "Inter_400Regular" },
  calPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  calText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statsCard: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  statDiv: { width: 1, height: 32 },
  section: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateValue: { fontSize: 15, fontFamily: "Inter_500Medium" },
  dateEdit: { gap: 10 },
  dateInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  dateButtons: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  saveText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  badgesTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  badgesSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-start" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  resetText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
