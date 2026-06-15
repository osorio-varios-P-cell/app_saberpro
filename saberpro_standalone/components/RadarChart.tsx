import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { AREAS, AreaId } from "@/data/areas";

interface Props {
  scores: Record<AreaId, number>;
  size?: number;
}

export default function RadarChart({ scores, size = 220 }: Props) {
  const colors = useColors();
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = AREAS.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  function getPoint(i: number, r: number): [number, number] {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  const gridPolygons = levels.map((lvl) =>
    AREAS.map((_, i) => getPoint(i, maxR * lvl).join(",")).join(" ")
  );

  const dataPolygon = AREAS.map((a, i) =>
    getPoint(i, maxR * Math.min(1, scores[a.id] / 100 || 0)).join(",")
  ).join(" ");

  const labelPoints = AREAS.map((a, i) => {
    const [x, y] = getPoint(i, maxR + 22);
    return { x, y, name: a.shortName, color: a.color };
  });

  const axisLines = AREAS.map((_, i) => {
    const [x, y] = getPoint(i, maxR);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {gridPolygons.map((pts, i) => (
          <Polygon
            key={i}
            points={pts}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {axisLines.map((l, i) => (
          <Line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        <Polygon
          points={dataPolygon}
          fill="#E94560"
          fillOpacity={0.25}
          stroke="#E94560"
          strokeWidth={2}
        />
        {AREAS.map((a, i) => {
          const [x, y] = getPoint(i, maxR * Math.min(1, scores[a.id] / 100 || 0));
          return <Circle key={i} cx={x} cy={y} r={4} fill={a.color} />;
        })}
        {labelPoints.map((l, i) => (
          <SvgText
            key={i}
            x={l.x}
            y={l.y}
            fill={l.color}
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {l.name}
          </SvgText>
        ))}
      </Svg>

      <View style={styles.scoreRow}>
        {AREAS.map((a) => (
          <View key={a.id} style={styles.scoreItem}>
            <Text style={[styles.scoreNum, { color: a.color }]}>
              {Math.round(scores[a.id] || 0)}
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
              {a.shortName}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 12 },
  scoreRow: { flexDirection: "row", gap: 12 },
  scoreItem: { alignItems: "center" },
  scoreNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
