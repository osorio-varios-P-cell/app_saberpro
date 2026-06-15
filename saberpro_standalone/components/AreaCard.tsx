import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Area } from "@/data/areas";
import { useColors } from "@/hooks/useColors";

interface Props {
  area: Area;
  answered: number;
  correct: number;
  onPress: () => void;
}

export default function AreaCard({ area, answered, correct, onPress }: Props) {
  const colors = useColors();
  const accuracy = answered > 0 ? correct / answered : 0;
  const pct = Math.round(accuracy * 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: area.color + "22" }]}>
        <Ionicons name={area.icon as any} size={22} color={area.color} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{area.name}</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>{area.description}</Text>

        <View style={styles.barRow}>
          <View style={[styles.barBg, { backgroundColor: colors.border }]}>
            <View
              style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: area.color }]}
            />
          </View>
          <Text style={[styles.pct, { color: area.color }]}>{pct}%</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.count, { color: colors.foreground }]}>{answered}</Text>
        <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>preg.</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  barBg: { flex: 1, height: 5, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  pct: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 30, textAlign: "right" },
  right: { alignItems: "center" },
  count: { fontSize: 18, fontFamily: "Inter_700Bold" },
  countLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
