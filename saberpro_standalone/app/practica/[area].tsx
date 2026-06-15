import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudy } from "@/context/StudyContext";
import { getArea, AreaId } from "@/data/areas";
import { getRandomQuestions } from "@/data/questions";
import { useColors } from "@/hooks/useColors";
import QuestionCard from "@/components/QuestionCard";

const SESSION_SIZE = 10;
const TIME_PER_QUESTION = 30;

export default function PracticaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { area: areaParam } = useLocalSearchParams<{ area: string }>();
  const { addAnswer, finishSession } = useStudy();

  const areaId = (areaParam ?? "matematicas") as AreaId;
  const area = getArea(areaId);

  const questions = useMemo(() => getRandomQuestions(areaId, SESSION_SIZE), [areaId]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExpl, setShowExpl] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [totalXP, setTotalXP] = useState(0);

  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[current];

  function startTimer() {
    setTimeLeft(TIME_PER_QUESTION);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIME_PER_QUESTION * 1000,
      useNativeDriver: false,
    }).start();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (selected === null) {
            handleAnswer(-1);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (!finished) startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, finished]);

  const handleAnswer = useCallback(
    async (idx: number) => {
      if (selected !== null) return;
      if (timerRef.current) clearInterval(timerRef.current);
      const correct = idx === question.correctIndex;
      setSelected(idx);
      setShowExpl(true);
      setSessionAnswers((prev) => [...prev, correct]);
      addAnswer(areaId, correct);
      const xpGain = correct ? 10 : 2;
      setTotalXP((x) => x + xpGain);
    },
    [selected, question, areaId, addAnswer]
  );

  async function handleNext() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExpl(false);
    } else {
      const correct = sessionAnswers.filter(Boolean).length;
      await finishSession(areaId, correct, questions.length);
      setFinished(true);
    }
  }

  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ["#E94560", "#F5A623", "#27AE60"],
  });

  if (finished) {
    const correct = sessionAnswers.filter(Boolean).length;
    const pct = Math.round((correct / questions.length) * 100);
    let grade = "Necesitas repasar";
    if (pct >= 80) grade = "Excelente";
    else if (pct >= 60) grade = "Buen trabajo";
    else if (pct >= 40) grade = "Sigue practicando";

    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={[
            styles.resultContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={[styles.resultHeader, { borderColor: area.color }]}>
            <View style={[styles.areaIconLg, { backgroundColor: area.color + "22" }]}>
              <Ionicons name={area.icon as any} size={32} color={area.color} />
            </View>
            <Text style={[styles.resultGrade, { color: area.color }]}>{grade}</Text>
            <Text style={[styles.resultScore, { color: colors.foreground }]}>
              {correct} / {questions.length}
            </Text>
            <Text style={[styles.resultPct, { color: colors.mutedForeground }]}>
              {pct}% de acierto
            </Text>
          </View>

          <View style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={[styles.xpEarned, { color: colors.accent }]}>+{totalXP + 50} XP ganados</Text>
            <Text style={[styles.xpSub, { color: colors.mutedForeground }]}>sesión completada</Text>
          </View>

          {questions.map((q, i) => (
            <View key={q.id} style={[styles.reviewRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.reviewIcon, {
                backgroundColor: sessionAnswers[i] ? "#27AE6022" : "#E9456022"
              }]}>
                <Ionicons
                  name={sessionAnswers[i] ? "checkmark" : "close"}
                  size={16}
                  color={sessionAnswers[i] ? "#27AE60" : "#E94560"}
                />
              </View>
              <Text style={[styles.reviewQ, { color: colors.mutedForeground }]} numberOfLines={2}>
                {q.question}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.resultFooter, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.doneBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.doneBtnText, { color: colors.foreground }]}>Ver áreas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setFinished(false);
              setCurrent(0);
              setSelected(null);
              setShowExpl(false);
              setSessionAnswers([]);
              setTotalXP(0);
            }}
            style={[styles.againBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.againBtnText}>Otra sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={[styles.areaPill, { backgroundColor: area.color + "22" }]}>
            <Ionicons name={area.icon as any} size={14} color={area.color} />
            <Text style={[styles.areaPillText, { color: area.color }]}>{area.shortName}</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timeLeft <= 10 ? "#E94560" : colors.foreground }]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Timer bar */}
        <Animated.View
          style={[styles.timerBar, { width: timerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }) as any, backgroundColor: timerColor }]}
        />

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i < sessionAnswers.length
                      ? sessionAnswers[i] ? "#27AE60" : "#E94560"
                      : i === current ? area.color : colors.border,
                  width: i === current ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
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
        <View style={[styles.nextBar, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <View style={styles.xpRow}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={[styles.xpText, { color: colors.accent }]}>
              {sessionAnswers[sessionAnswers.length - 1] ? "+10 XP" : "+2 XP"}
            </Text>
          </View>
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
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  areaPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  areaPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  timerBox: { minWidth: 40, alignItems: "flex-end" },
  timerNum: { fontSize: 15, fontFamily: "Inter_700Bold" },
  timerBar: { height: 3, borderRadius: 2 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { height: 8, borderRadius: 4 },
  body: { padding: 20, gap: 16 },
  nextBar: { paddingHorizontal: 20, paddingTop: 10, gap: 8 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "center" },
  xpText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  nextBtn: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  resultContent: { padding: 20, gap: 14 },
  resultHeader: {
    alignItems: "center",
    gap: 8,
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
  },
  areaIconLg: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  resultGrade: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  resultScore: { fontSize: 42, fontFamily: "Inter_700Bold" },
  resultPct: { fontSize: 14, fontFamily: "Inter_400Regular" },
  xpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  xpEarned: { fontSize: 16, fontFamily: "Inter_700Bold" },
  xpSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  reviewIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  reviewQ: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  resultFooter: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  doneBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  doneBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  againBtn: {
    flex: 2,
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  againBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
