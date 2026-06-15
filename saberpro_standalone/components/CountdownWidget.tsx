import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  examDate: string;
}

export default function CountdownWidget({ examDate }: Props) {
  const colors = useColors();

  const daysLeft = useMemo(() => {
    if (!examDate) return null;
    const exam = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [examDate]);

  if (!examDate || daysLeft === null) return null;

  const urgency = daysLeft <= 30 ? "#E94560" : daysLeft <= 60 ? "#F5A623" : "#27AE60";

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="calendar" size={24} color={urgency} />
      <View style={styles.info}>
        <Text style={[styles.days, { color: urgency }]}>
          {daysLeft > 0 ? `${daysLeft} días` : daysLeft === 0 ? "¡Hoy!" : "Ya pasó"}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Para el ICFES
        </Text>
      </View>
      {daysLeft > 0 && (
        <Text style={[styles.emoji, { color: urgency }]}>
          {daysLeft <= 14 ? "!" : daysLeft <= 30 ? "💪" : "📚"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    flex: 1,
  },
  info: { flex: 1 },
  days: { fontSize: 18, fontFamily: "Inter_700Bold" },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
  emoji: { fontSize: 20 },
});
