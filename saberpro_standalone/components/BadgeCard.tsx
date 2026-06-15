import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Badge } from "@/data/badges";
import { useColors } from "@/hooks/useColors";

interface Props {
  badge: Badge;
  earned: boolean;
}

export default function BadgeCard({ badge, earned }: Props) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: earned ? colors.card : colors.secondary,
          borderColor: earned ? badge.color + "55" : colors.border,
          opacity: earned ? 1 : 0.45,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: badge.color + (earned ? "22" : "11") }]}>
        <Ionicons name={badge.icon as any} size={22} color={earned ? badge.color : colors.mutedForeground} />
      </View>
      <Text style={[styles.name, { color: earned ? colors.foreground : colors.mutedForeground }]}>
        {badge.name}
      </Text>
      <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
        {badge.description}
      </Text>
      {earned && (
        <View style={[styles.earnedDot, { backgroundColor: badge.color }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    width: "30%",
    minWidth: 100,
    position: "relative",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  desc: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  earnedDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
