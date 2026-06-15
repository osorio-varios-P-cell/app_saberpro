import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { useUser } from "@/context/UserContext";
import { AREAS, AreaId } from "@/data/areas";
import { getDiagnosticQuestions } from "@/data/questions";
import { useColors } from "@/hooks/useColors";
import QuestionCard from "@/components/QuestionCard";

export default function DiagnosticoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeDiagnostico: markUser } = useUser();
  const { completeDiagnostico: saveProgress } = useStudy();

  const questions = useMemo(() => getDiagnosticQuestions(), []);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExpl, setShowExpl] = useState(false);
  const [answers, setAnswers] = useState<{ area: AreaId; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = questions[current];
  const progress = (current + 1) / questions.length;

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    const correct = idx === question.correctIndex;
    setSelected(idx);
    setShowExpl(true);
    setAnswers((prev) => [...prev, { area: question.area, correct }]);
  }

  async function handleNext() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExpl(false);
    } else {
      setFinished(true);
    }
  }

  async function handleFinish() {
    setSaving(true);
    const areaScores: Record<AreaId, number> = {
      matematicas: 0, lectura: 0, ciencias: 0, sociales: 0, ingles: 0,
    };
    const areaCounts: Record<AreaId, number> = {
      matematicas: 0, lectura: 0, ciencias: 0, sociales: 0, ingles: 0,
    };
    answers.forEach(({ area, correct }) => {
      if (correct) areaScores[area]++;
      areaCounts[area]++;
    });
    const normalizedScores = Object.fromEntries(
      (Object.entries(areaScores) as [AreaId, number][]).map(([k, v]) => [
        k,
        areaCounts[k] > 0 ? v / areaCounts[k] : 0,
      ])
    ) as Record<AreaId, number>;

    await Promise.all([markUser(), saveProgress(normalizedScores)]);
    setSaving(false);
    router.replace("/(tabs)");
  }

  if (finished) {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = Math.round((correct / total) * 100);

    const areaStats = AREAS.map((a) => {
      const areaAnswers = answers.filter((ans) => ans.area === a.id);
      const c = areaAnswers.filter((ans) => ans.correct).length;
      return { area: a, correct: c, total: areaAnswers.length };
    });

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[styles.resultContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.resultHeader}>
          <View style={[styles.scoreCircle, { borderColor: colors.primary }]}>
            <Text style={[styles.scoreNum, { color: colors.primary }]}>{pct}%</Text>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>aciertos</Text>
          </View>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>
            Diagnóstico completado
          </Text>
          <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
            {correct} de {total} respuestas correctas. Tu plan de estudio ha sido generado.
          </Text>
        </View>

        <View style={styles.areaList}>
          {areaStats.map(({ area, correct: c, total: t }) => (
            <View key={area.id} style={[styles.areaRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.areaIcon, { backgroundColor: area.color + "22" }]}>
                <Ionicons name={area.icon as any} size={18} color={area.color} />
              </View>
              <Text style={[styles.areaName, { color: colors.foreground }]}>{area.shortName}</Text>
              <View style={[styles.areaBar, { backgroundColor: colors.border }]}>
                <View
                  style={[styles.areaFill, {
                    width: t > 0 ? `${(c / t) * 100}%` as any : "0%",
                    backgroundColor: area.color,
                  }]}
                />
              </View>
              <Text style={[styles.areaScore, { color: area.color }]}>{c}/{t}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleFinish}
          disabled={saving}
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.startBtnText}>Ver mi plan de estudio</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoTxt}>SP</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Diagnóstico Inicial</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{current + 1}/{questions.length}</Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primary }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.areaPill, { backgroundColor: AREAS.find((a) => a.id === question.area)?.color + "22" }]}>
          <Text style={[styles.areaPillText, { color: AREAS.find((a) => a.id === question.area)?.color }]}>
            {AREAS.find((a) => a.id === question.area)?.name}
          </Text>
        </View>

        <QuestionCard
          question={question}
          selectedIndex={selected}
          onAnswer={handleAnswer}
          showExplanation={showExpl}
          questionNumber={current + 1}
          totalQuestions={questions.length}
        />
      </ScrollView>

      {selected !== null && (
        <View style={[styles.nextRow, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleNext} style={[styles.nextBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.nextBtnText}>
              {current < questions.length - 1 ? "Siguiente" : "Ver resultados"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBadge: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  logoTxt: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  progressBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  body: { padding: 20, gap: 16 },
  areaPill: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  areaPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  nextRow: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 0 },
  nextBtn: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  resultContent: { padding: 24, gap: 24 },
  resultHeader: { alignItems: "center", gap: 12 },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 28, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  areaList: { gap: 10 },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  areaIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  areaName: { fontSize: 13, fontFamily: "Inter_600SemiBold", minWidth: 36 },
  areaBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  areaFill: { height: "100%", borderRadius: 3 },
  areaScore: { fontSize: 13, fontFamily: "Inter_700Bold", minWidth: 28, textAlign: "right" },
  startBtn: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startBtnText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter_700Bold" },
});
