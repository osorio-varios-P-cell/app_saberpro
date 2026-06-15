import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { AREAS } from "@/data/areas";
import { useColors } from "@/hooks/useColors";
import AreaCard from "@/components/AreaCard";

export default function PracticarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress } = useStudy();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;

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
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Practicar</Text>
      <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>
        Elige un área para practicar. Cada sesión tiene 10 preguntas.
      </Text>

      {/* Overall accuracy banner */}
      <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.bannerStat}>
          <Text style={[styles.bannerNum, { color: colors.primary }]}>{totalAnswered}</Text>
          <Text style={[styles.bannerLabel, { color: colors.mutedForeground }]}>preguntas totales</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.bannerStat}>
          <Text style={[styles.bannerNum, { color: colors.accent }]}>{overallAcc}%</Text>
          <Text style={[styles.bannerLabel, { color: colors.mutedForeground }]}>promedio</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.bannerStat}>
          <Text style={[styles.bannerNum, { color: "#27AE60" }]}>{totalCorrect}</Text>
          <Text style={[styles.bannerLabel, { color: colors.mutedForeground }]}>correctas</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Áreas del ICFES</Text>
        <View style={[styles.tipPill, { backgroundColor: colors.secondary }]}>
          <Ionicons name="bulb" size={12} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>10 preguntas / sesión</Text>
        </View>
      </View>

      {AREAS.map((area) => (
        <AreaCard
          key={area.id}
          area={area}
          answered={progress.areaProgress[area.id].answered}
          correct={progress.areaProgress[area.id].correct}
          onPress={() =>
            router.push({ pathname: "/practica/[area]", params: { area: area.id } })
          }
        />
      ))}

      <View style={[styles.tipBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Ionicons name="information-circle" size={18} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.tipTitle, { color: colors.foreground }]}>
            Repetición espaciada (SRS)
          </Text>
          <Text style={[styles.tipDesc, { color: colors.mutedForeground }]}>
            El sistema selecciona las preguntas que más necesitas repasar para maximizar tu retención.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  screenTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  screenSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -8 },
  banner: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  bannerStat: { flex: 1, alignItems: "center" },
  bannerNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  bannerLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  divider: { width: 1, height: 30 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  tipPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tipText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  tipBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  tipDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
