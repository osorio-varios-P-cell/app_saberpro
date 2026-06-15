import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  xp: number;
  level: number;
}

const XP_PER_LEVEL = 500;

export default function XPBar({ xp, level }: Props) {
  const colors = useColors();
  const xpInLevel = xp % XP_PER_LEVEL;
  const pct = xpInLevel / XP_PER_LEVEL;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.levelText}>Nv. {level}</Text>
        </View>
        <Text style={[styles.xpText, { color: colors.mutedForeground }]}>
          {xpInLevel} / {XP_PER_LEVEL} XP
        </Text>
        <Text style={[styles.totalXP, { color: colors.accent }]}>
          {xp.toLocaleString()} XP total
        </Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[styles.barFill, { width, backgroundColor: colors.accent }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  xpText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  totalXP: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  barBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
});
