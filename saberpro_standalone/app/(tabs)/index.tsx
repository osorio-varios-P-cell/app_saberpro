import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { useUser } from "@/context/UserContext";
import { AREAS, AreaId } from "@/data/areas";
import { useColors } from "@/hooks/useColors";
import CountdownWidget from "@/components/CountdownWidget";
import StreakWidget from "@/components/StreakWidget";
import XPBar from "@/components/XPBar";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { progress, isLoading: studyLoading } = useStudy();

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (!userLoading && !user.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [userLoading, user.onboardingComplete]);

  if (userLoading || studyLoading) return null;

  const topAreas = AREAS.map((a) => ({
    area: a,
    accuracy: progress.areaProgress[a.id].answered > 0
      ? progress.areaProgress[a.id].correct / progress.areaProgress[a.id].answered
      : 0,
    answered: progress.areaProgress[a.id].answered,
  })).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  const topInset = isWeb ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (isWeb ? 34 : insets.bottom) + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Hola, {user.name || "estudiante"} 👋
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            ¡A estudiar!
          </Text>
        </View>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoTxt}>SP</Text>
        </View>
      </View>

      {/* XP Bar */}
      <XPBar xp={progress.xp} level={progress.level} />

      {/* Streak + Countdown */}
      <View style={styles.rowWidgets}>
        <StreakWidget streak={progress.streak} maxStreak={progress.maxStreak} />
        {user.examDate ? (
          <CountdownWidget examDate={user.examDate} />
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/perfil")}
            style={[styles.addDateBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.addDateText, { color: colors.mutedForeground }]}>
              Agregar fecha del ICFES
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Today's plan */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Plan de hoy</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/practicar")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todo →</Text>
        </TouchableOpacity>
      </View>

      {topAreas.map(({ area, accuracy, answered }) => (
        <TouchableOpacity
          key={area.id}
          onPress={() => router.push({ pathname: "/practica/[area]", params: { area: area.id } })}
          style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <View style={[styles.planIcon, { backgroundColor: area.color + "22" }]}>
            <Ionicons name={area.icon as any} size={20} color={area.color} />
          </View>
          <View style={styles.planInfo}>
            <Text style={[styles.planName, { color: colors.foreground }]}>{area.name}</Text>
            <Text style={[styles.planSub, { color: colors.mutedForeground }]}>
              {answered === 0 ? "Sin práctica aún" : `${Math.round(accuracy * 100)}% acierto · ${answered} preguntas`}
            </Text>
          </View>
          <View style={[styles.practiceBtn, { backgroundColor: area.color }]}>
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      ))}

      {/* Quick simulacro */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/simulacro")}
        style={[styles.simCard, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
      >
        <Ionicons name="document-text" size={24} color="#FFFFFF" />
        <View style={styles.simInfo}>
          <Text style={styles.simTitle}>Simulacro Express</Text>
          <Text style={styles.simSub}>10 preguntas · 10 minutos</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: colors.foreground }]}>Mis estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {Object.values(progress.areaProgress).reduce((s, a) => s + a.answered, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Preguntas</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.accent }]}>
              {progress.simulacros.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Simulacros</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: "#27AE60" }]}>
              {progress.badges.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Logros</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginTop: 2 },
  logoBadge: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoTxt: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  rowWidgets: { flexDirection: "row", gap: 12 },
  addDateBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  addDateText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_500Medium" },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  planIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  planInfo: { flex: 1 },
  planName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  planSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  practiceBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  simCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  simInfo: { flex: 1 },
  simTitle: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  simSub: { color: "#ffffffbb", fontSize: 13, fontFamily: "Inter_400Regular" },
  statsCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 14 },
  statsTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: 1, height: 36 },
});
