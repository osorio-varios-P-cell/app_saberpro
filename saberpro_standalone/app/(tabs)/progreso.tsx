import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { useUser } from "@/context/UserContext";
import { AREAS, AreaId } from "@/data/areas";
import { useColors } from "@/hooks/useColors";
import RadarChart from "@/components/RadarChart";
import XPBar from "@/components/XPBar";

export default function ProgresoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress } = useStudy();
  const { user } = useUser();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;

  const radarScores: Record<AreaId, number> = {
    matematicas: 0, lectura: 0, ciencias: 0, sociales: 0, ingles: 0,
  };
  AREAS.forEach((a) => {
    const ap = progress.areaProgress[a.id];
    radarScores[a.id] = ap.answered > 0 ? (ap.correct / ap.answered) * 100 : 0;
  });

  const estimatedScore = Math.round(
    Object.values(radarScores).reduce((s, v) => s + v, 0)
  );

  const totalAnswered = Object.values(progress.areaProgress).reduce((s, a) => s + a.answered, 0);
  const totalCorrect = Object.values(progress.areaProgress).reduce((s, a) => s + a.correct, 0);
  const overallAcc = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (isWeb ? 34 : insets.bottom) + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Progreso</Text>

      {/* Estimated score */}
      <View style={[styles.scoreCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.scoreLabel}>Puntaje estimado</Text>
        <Text style={styles.scoreValue}>{estimatedScore}</Text>
        <Text style={styles.scoreMax}>de 500 puntos</Text>
        <Text style={styles.scoreSub}>
          Basado en tu desempeño actual · {totalAnswered} preguntas respondidas
        </Text>
      </View>

      {/* XP + Level */}
      <XPBar xp={progress.xp} level={progress.level} />

      {/* Streak info */}
      <View style={[styles.row, { gap: 12 }]}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="flame" size={22} color="#FF6B35" />
          <Text style={[styles.infoNum, { color: colors.foreground }]}>{progress.streak}</Text>
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>días racha</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="checkmark-circle" size={22} color="#27AE60" />
          <Text style={[styles.infoNum, { color: colors.foreground }]}>{overallAcc}%</Text>
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>acierto global</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="trophy" size={22} color={colors.accent} />
          <Text style={[styles.infoNum, { color: colors.foreground }]}>{progress.badges.length}</Text>
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>logros</Text>
        </View>
      </View>

      {/* Radar chart */}
      <View style={[styles.radarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mapa de competencias</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Nivel de dominio por área del ICFES
        </Text>
        {totalAnswered > 0 ? (
          <RadarChart scores={radarScores} />
        ) : (
          <View style={styles.emptyRadar}>
            <Ionicons name="analytics-outline" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Responde preguntas para ver tu mapa de competencias
            </Text>
          </View>
        )}
      </View>

      {/* Area breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Detalle por área</Text>
      {AREAS.map((area) => {
        const ap = progress.areaProgress[area.id];
        const acc = ap.answered > 0 ? (ap.correct / ap.answered) * 100 : 0;
        return (
          <View key={area.id} style={[styles.areaRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.areaIcon, { backgroundColor: area.color + "22" }]}>
              <Ionicons name={area.icon as any} size={18} color={area.color} />
            </View>
            <View style={styles.areaInfo}>
              <View style={styles.areaHeader}>
                <Text style={[styles.areaName, { color: colors.foreground }]}>{area.name}</Text>
                <Text style={[styles.areaPct, { color: area.color }]}>{Math.round(acc)}%</Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View
                  style={[styles.barFill, { width: `${acc}%` as any, backgroundColor: area.color }]}
                />
              </View>
              <Text style={[styles.areaStats, { color: colors.mutedForeground }]}>
                {ap.correct}/{ap.answered} correctas
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  screenTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  scoreCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  scoreLabel: { color: "#ffffffbb", fontSize: 14, fontFamily: "Inter_500Medium" },
  scoreValue: { color: "#FFFFFF", fontSize: 56, fontFamily: "Inter_700Bold" },
  scoreMax: { color: "#ffffffbb", fontSize: 16, fontFamily: "Inter_400Regular" },
  scoreSub: { color: "#ffffff88", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
  row: { flexDirection: "row" },
  infoCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  infoNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  radarCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 10, alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyRadar: { alignItems: "center", gap: 10, padding: 20 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  areaIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  areaInfo: { flex: 1, gap: 5 },
  areaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  areaPct: { fontSize: 14, fontFamily: "Inter_700Bold" },
  barBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  areaStats: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
