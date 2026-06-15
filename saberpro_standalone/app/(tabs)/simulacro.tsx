import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { AREAS } from "@/data/areas";
import { useColors } from "@/hooks/useColors";

export default function SimulacroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress } = useStudy();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;

  const lastSim = progress.simulacros[progress.simulacros.length - 1];
  const bestScore = progress.simulacros.reduce((best, s) => Math.max(best, s.score), 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (isWeb ? 34 : insets.bottom) + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Simulacros</Text>
      <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>
        Practica con condiciones similares al examen real.
      </Text>

      {/* Simulacro Express */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/practica/[area]", params: { area: "matematicas", mode: "simulacro" } })}
        style={[styles.mainCard, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
      >
        <View style={styles.mainCardTop}>
          <Ionicons name="flash" size={28} color="#FFFFFF" />
          <View style={[styles.badge, { backgroundColor: "#ffffff33" }]}>
            <Text style={styles.badgeText}>POPULAR</Text>
          </View>
        </View>
        <Text style={styles.mainCardTitle}>Simulacro Express</Text>
        <Text style={styles.mainCardSub}>50 preguntas · 45 minutos · Una área</Text>
        <View style={styles.mainCardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="help-circle" size={14} color="#ffffffaa" />
            <Text style={styles.detailText}>50 preguntas</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={14} color="#ffffffaa" />
            <Text style={styles.detailText}>45 min</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="star" size={14} color="#ffffffaa" />
            <Text style={styles.detailText}>+200 XP</Text>
          </View>
        </View>
        <View style={styles.startRow}>
          <Text style={styles.startText}>Iniciar simulacro</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Area quick practice */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Práctica por área</Text>
      <View style={styles.areaGrid}>
        {AREAS.map((area) => (
          <TouchableOpacity
            key={area.id}
            onPress={() => router.push({ pathname: "/practica/[area]", params: { area: area.id } })}
            style={[styles.areaBtn, { backgroundColor: area.color + "22", borderColor: area.color + "44" }]}
            activeOpacity={0.8}
          >
            <Ionicons name={area.icon as any} size={20} color={area.color} />
            <Text style={[styles.areaBtnText, { color: area.color }]}>{area.shortName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Historial</Text>
      {progress.simulacros.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="document-text-outline" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sin simulacros aún</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Completa tu primer simulacro para ver tu historial y puntaje proyectado.
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.bestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="trophy" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bestLabel, { color: colors.mutedForeground }]}>Mejor puntaje</Text>
              <Text style={[styles.bestScore, { color: colors.accent }]}>{bestScore} / 500</Text>
            </View>
            <Text style={[styles.simCount, { color: colors.mutedForeground }]}>
              {progress.simulacros.length} completados
            </Text>
          </View>
          {progress.simulacros.slice(-3).reverse().map((s, i) => (
            <View key={i} style={[styles.histRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.histScore, { backgroundColor: s.score >= 300 ? "#27AE6022" : "#E9456022" }]}>
                <Text style={[styles.histScoreNum, { color: s.score >= 300 ? "#27AE60" : "#E94560" }]}>
                  {s.score}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.histDate, { color: colors.mutedForeground }]}>{s.date}</Text>
                <Text style={[styles.histDetail, { color: colors.foreground }]}>
                  {s.correct}/{s.totalQuestions} correctas
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  screenTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  screenSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -8 },
  mainCard: { padding: 22, borderRadius: 20, gap: 10 },
  mainCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  mainCardTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold" },
  mainCardSub: { color: "#ffffffbb", fontSize: 14, fontFamily: "Inter_400Regular" },
  mainCardDetails: { flexDirection: "row", gap: 16, marginTop: 4 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { color: "#ffffffaa", fontSize: 13, fontFamily: "Inter_500Medium" },
  startRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  startText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  areaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  areaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  areaBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyBox: {
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  bestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bestLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  bestScore: { fontSize: 22, fontFamily: "Inter_700Bold" },
  simCount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  histScore: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  histScoreNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  histDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  histDetail: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
