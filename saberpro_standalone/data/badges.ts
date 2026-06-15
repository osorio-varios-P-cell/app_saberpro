export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: Badge[] = [
  { id: "streak_3", name: "Constante", description: "3 días seguidos", icon: "flame", color: "#FF6B35" },
  { id: "streak_7", name: "Dedicado", description: "7 días seguidos", icon: "flame", color: "#FF4500" },
  { id: "streak_14", name: "Imparable", description: "14 días seguidos", icon: "flame", color: "#E94560" },
  { id: "streak_30", name: "Leyenda", description: "30 días seguidos", icon: "trophy", color: "#F5A623" },
  { id: "mat_master", name: "Matemático", description: "50 preguntas de Matemáticas", icon: "calculator", color: "#4C9BE8" },
  { id: "lc_master", name: "Lector Élite", description: "50 preguntas de Lectura", icon: "book", color: "#9B59B6" },
  { id: "cn_master", name: "Científico", description: "50 preguntas de Ciencias", icon: "flask", color: "#27AE60" },
  { id: "sc_master", name: "Ciudadano", description: "50 preguntas de Sociales", icon: "globe", color: "#F5A623" },
  { id: "ing_master", name: "English Pro", description: "50 preguntas de Inglés", icon: "chatbubbles", color: "#E94560" },
  { id: "first_sim", name: "Primer Simulacro", description: "Completa tu primer simulacro", icon: "trophy", color: "#F5A623" },
  { id: "score_300", name: "Candidato", description: "300+ puntos en simulacro", icon: "star", color: "#4C9BE8" },
  { id: "score_400", name: "Avanzado", description: "400+ puntos en simulacro", icon: "star", color: "#9B59B6" },
  { id: "perfect_area", name: "Perfección", description: "100% correcto en un área", icon: "checkmark-circle", color: "#F5A623" },
  { id: "xp_1000", name: "Explorador", description: "Acumula 1.000 XP", icon: "sparkles", color: "#27AE60" },
  { id: "xp_5000", name: "Experto", description: "Acumula 5.000 XP", icon: "sparkles", color: "#E94560" },
  { id: "diagnostico", name: "Diagnóstico", description: "Completa el diagnóstico inicial", icon: "analytics", color: "#4C9BE8" },
];

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
