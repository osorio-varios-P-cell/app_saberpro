import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  streak: number;
  maxStreak: number;
}

export default function StreakWidget({ streak, maxStreak }: Props) {
  const colors = useColors();
  const flameColor = streak > 0 ? "#FF6B35" : colors.mutedForeground;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="flame" size={28} color={flameColor} />
      <View style={styles.info}>
        <Text style={[styles.streak, { color: colors.foreground }]}>
          {streak} {streak === 1 ? "día" : "días"}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Racha actual
        </Text>
      </View>
      <View style={styles.max}>
        <Text style={[styles.maxNum, { color: colors.accent }]}>{maxStreak}</Text>
        <Text style={[styles.maxLabel, { color: colors.mutedForeground }]}>máx.</Text>
      </View>
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
  streak: { fontSize: 18, fontFamily: "Inter_700Bold" },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
  max: { alignItems: "center" },
  maxNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  maxLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
