import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Question } from "@/data/questions";
import { useColors } from "@/hooks/useColors";

interface Props {
  question: Question;
  selectedIndex: number | null;
  onAnswer: (index: number) => void;
  showExplanation: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const LABELS = ["A", "B", "C", "D"];

function OptionButton({
  label,
  text,
  index,
  selectedIndex,
  correctIndex,
  showExplanation,
  onPress,
}: {
  label: string;
  text: string;
  index: number;
  selectedIndex: number | null;
  correctIndex: number;
  showExplanation: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const isSelected = selectedIndex === index;
  const isCorrect = index === correctIndex;

  let bgColor = colors.card;
  let borderColor = colors.border;
  let textColor = colors.foreground;
  let labelBg = colors.secondary;
  let labelColor = colors.mutedForeground;

  if (showExplanation && isCorrect) {
    bgColor = "#1a4a2e";
    borderColor = "#27AE60";
    textColor = "#FFFFFF";
    labelBg = "#27AE60";
    labelColor = "#FFFFFF";
  } else if (showExplanation && isSelected && !isCorrect) {
    bgColor = "#4a1a1a";
    borderColor = "#E94560";
    textColor = "#FFFFFF";
    labelBg = "#E94560";
    labelColor = "#FFFFFF";
  } else if (isSelected) {
    borderColor = colors.primary;
    labelBg = colors.primary;
    labelColor = colors.primaryForeground;
  }

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={selectedIndex !== null}
        activeOpacity={0.85}
        style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
      >
        <View style={[styles.label, { backgroundColor: labelBg }]}>
          <Text style={[styles.labelText, { color: labelColor }]}>{label}</Text>
        </View>
        <Text style={[styles.optionText, { color: textColor }]}>{text}</Text>
        {showExplanation && isCorrect && (
          <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
        )}
        {showExplanation && isSelected && !isCorrect && (
          <Ionicons name="close-circle" size={20} color="#E94560" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function QuestionCard({
  question,
  selectedIndex,
  onAnswer,
  showExplanation,
  questionNumber,
  totalQuestions,
}: Props) {
  const colors = useColors();

  async function handleAnswer(index: number) {
    if (selectedIndex !== null) return;
    const correct = index === question.correctIndex;
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    onAnswer(index);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.counter, { color: colors.mutedForeground }]}>
        Pregunta {questionNumber} de {totalQuestions}
      </Text>

      <Text style={[styles.questionText, { color: colors.foreground }]}>
        {question.question}
      </Text>

      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            label={LABELS[i]}
            text={opt}
            index={i}
            selectedIndex={selectedIndex}
            correctIndex={question.correctIndex}
            showExplanation={showExplanation}
            onPress={() => handleAnswer(i)}
          />
        ))}
      </View>

      {showExplanation && (
        <View style={[styles.explanation, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={18} color={colors.accent} style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.explanationText, { color: colors.mutedForeground }]}>
            {question.explanation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  counter: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  questionText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  options: { gap: 10 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  label: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  explanation: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  explanationText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
