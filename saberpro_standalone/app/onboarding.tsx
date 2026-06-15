import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendario, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

const STEPS = 3;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useUser();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [colegio, setColegio] = useState("");
  const [calendario, setCalendario] = useState<Calendario>("A");
  const [examDate, setExamDate] = useState("");

  const isIOS = Platform.OS === "ios";

  async function next() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      await completeOnboarding({ name, colegio, calendario, examDate });
      router.replace("/diagnostico");
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  const canNext =
    step === 0 ? name.trim().length >= 2
    : step === 1 ? true
    : examDate.length >= 8;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={isIOS ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Brand */}
        <View style={styles.brand}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>SABERPRO</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Tu camino al 500 comienza aquí
          </Text>
        </View>

        {/* Step indicators */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i <= step ? colors.primary : colors.border },
                i === step && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Step 0: Name */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              ¿Cómo te llamas?
            </Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Así personalizamos tu experiencia de estudio.
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              autoFocus
            />
            <TextInput
              value={colegio}
              onChangeText={setColegio}
              placeholder="Tu colegio (opcional)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            />
          </View>
        )}

        {/* Step 1: Calendar */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              ¿Qué calendario?
            </Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Esto nos ayuda a saber cuándo es tu examen ICFES.
            </Text>
            <View style={styles.calRow}>
              {(["A", "B"] as Calendario[]).map((cal) => (
                <TouchableOpacity
                  key={cal}
                  onPress={() => setCalendario(cal)}
                  style={[
                    styles.calBtn,
                    {
                      backgroundColor:
                        calendario === cal ? colors.primary : colors.card,
                      borderColor:
                        calendario === cal ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.calLetter, { color: calendario === cal ? "#fff" : colors.foreground }]}>
                    {cal}
                  </Text>
                  <Text style={[styles.calDesc, { color: calendario === cal ? "#ffffffbb" : colors.mutedForeground }]}>
                    {cal === "A" ? "Agosto" : "Marzo"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="information-circle" size={16} color={colors.accent} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Calendario A: grados 11° · Calendario B: validación y adultos
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: Exam date */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              ¿Cuándo es tu ICFES?
            </Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Activaremos una cuenta regresiva motivacional.
            </Text>
            <TextInput
              value={examDate}
              onChangeText={setExamDate}
              placeholder="AAAA-MM-DD (ej: 2025-08-10)"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              keyboardType="numbers-and-punctuation"
            />
            <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="calendar" size={16} color={colors.accent} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Calendario A 2025: ~10 de agosto · Calendario B 2026: ~8 de marzo
              </Text>
            </View>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
              Puedes omitir esto y configurarlo después en tu perfil.
            </Text>
            <TouchableOpacity onPress={() => setExamDate("2025-08-10")}>
              <Text style={[styles.skipLink, { color: colors.primary }]}>
                Usar fecha Cal. A 2025 →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Nav buttons */}
        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity
              onPress={back}
              style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={next}
            disabled={!canNext}
            style={[styles.nextBtn, { backgroundColor: canNext ? colors.primary : colors.border, flex: step > 0 ? 1 : undefined }]}
          >
            <Text style={[styles.nextText, { color: canNext ? "#FFFFFF" : colors.mutedForeground }]}>
              {step < STEPS - 1 ? "Continuar" : "¡Empezar!"}
            </Text>
            <Ionicons name={step < STEPS - 1 ? "arrow-forward" : "rocket"} size={18} color={canNext ? "#FFFFFF" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 28 },
  brand: { alignItems: "center", gap: 8 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFFFFF", fontSize: 32, fontFamily: "Inter_700Bold" },
  appName: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  stepContent: { gap: 16 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  stepSub: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  input: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  calRow: { flexDirection: "row", gap: 12 },
  calBtn: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 6,
  },
  calLetter: { fontSize: 32, fontFamily: "Inter_700Bold" },
  calDesc: { fontSize: 14, fontFamily: "Inter_500Medium" },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  skipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  skipLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  navRow: { flexDirection: "row", gap: 12 },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flexDirection: "row",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    minWidth: 180,
  },
  nextText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
