import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AreaId } from "@/data/areas";

export interface AreaProgress {
  answered: number;
  correct: number;
}

export interface StudyProgress {
  xp: number;
  level: number;
  streak: number;
  maxStreak: number;
  lastStudyDate: string;
  badges: string[];
  areaProgress: Record<AreaId, AreaProgress>;
  simulacros: SimulacroResult[];
}

export interface SimulacroResult {
  date: string;
  score: number;
  areaScores: Record<AreaId, number>;
  totalQuestions: number;
  correct: number;
}

const DEFAULT_AREA: AreaProgress = { answered: 0, correct: 0 };

const DEFAULT_PROGRESS: StudyProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  lastStudyDate: "",
  badges: [],
  areaProgress: {
    matematicas: { ...DEFAULT_AREA },
    lectura: { ...DEFAULT_AREA },
    ciencias: { ...DEFAULT_AREA },
    sociales: { ...DEFAULT_AREA },
    ingles: { ...DEFAULT_AREA },
  },
  simulacros: [],
};

const STORAGE_KEY = "saberpro_progress";
const XP_PER_CORRECT = 10;
const XP_PER_WRONG = 2;
const XP_PER_SESSION = 50;
const XP_PER_SIMULACRO = 200;
const XP_PER_LEVEL = 500;

interface StudyContextValue {
  progress: StudyProgress;
  isLoading: boolean;
  addAnswer: (area: AreaId, correct: boolean) => void;
  finishSession: (area: AreaId, correct: number, total: number) => Promise<void>;
  finishSimulacro: (result: SimulacroResult) => Promise<void>;
  completeDiagnostico: (areaScores: Record<AreaId, number>) => Promise<void>;
  hasBadge: (id: string) => boolean;
  getAreaAccuracy: (area: AreaId) => number;
  getEstimatedScore: () => number;
}

const StudyContext = createContext<StudyContextValue>({
  progress: DEFAULT_PROGRESS,
  isLoading: true,
  addAnswer: () => {},
  finishSession: async () => {},
  finishSimulacro: async () => {},
  completeDiagnostico: async () => {},
  hasBadge: () => false,
  getAreaAccuracy: () => 0,
  getEstimatedScore: () => 0,
});

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<StudyProgress>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as StudyProgress;
        setProgress({
          ...DEFAULT_PROGRESS,
          ...saved,
          areaProgress: { ...DEFAULT_PROGRESS.areaProgress, ...saved.areaProgress },
        });
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function save(updated: StudyProgress) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProgress(updated);
  }

  function computeStreak(current: StudyProgress): number {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (current.lastStudyDate === today) return current.streak;
    if (current.lastStudyDate === yesterday) return current.streak + 1;
    return 1;
  }

  function computeBadges(p: StudyProgress): string[] {
    const badges = [...p.badges];
    const add = (id: string) => { if (!badges.includes(id)) badges.push(id); };

    if (p.streak >= 3) add("streak_3");
    if (p.streak >= 7) add("streak_7");
    if (p.streak >= 14) add("streak_14");
    if (p.streak >= 30) add("streak_30");
    if (p.areaProgress.matematicas.answered >= 50) add("mat_master");
    if (p.areaProgress.lectura.answered >= 50) add("lc_master");
    if (p.areaProgress.ciencias.answered >= 50) add("cn_master");
    if (p.areaProgress.sociales.answered >= 50) add("sc_master");
    if (p.areaProgress.ingles.answered >= 50) add("ing_master");
    if (p.xp >= 1000) add("xp_1000");
    if (p.xp >= 5000) add("xp_5000");
    if (p.simulacros.length >= 1) add("first_sim");
    if (p.simulacros.some((s) => s.score >= 300)) add("score_300");
    if (p.simulacros.some((s) => s.score >= 400)) add("score_400");
    const areas: AreaId[] = ["matematicas", "lectura", "ciencias", "sociales", "ingles"];
    if (areas.some((a) => {
      const ap = p.areaProgress[a];
      return ap.answered >= 5 && ap.correct / ap.answered >= 1;
    })) add("perfect_area");
    return badges;
  }

  const addAnswer = useCallback((area: AreaId, correct: boolean) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        areaProgress: {
          ...prev.areaProgress,
          [area]: {
            answered: prev.areaProgress[area].answered + 1,
            correct: prev.areaProgress[area].correct + (correct ? 1 : 0),
          },
        },
        xp: prev.xp + (correct ? XP_PER_CORRECT : XP_PER_WRONG),
      };
      updated.level = Math.floor(updated.xp / XP_PER_LEVEL) + 1;
      return updated;
    });
  }, []);

  async function finishSession(area: AreaId, correct: number, total: number) {
    setProgress((prev) => {
      const streak = computeStreak(prev);
      const updated: StudyProgress = {
        ...prev,
        xp: prev.xp + XP_PER_SESSION,
        streak,
        maxStreak: Math.max(prev.maxStreak, streak),
        lastStudyDate: new Date().toDateString(),
        areaProgress: {
          ...prev.areaProgress,
          [area]: {
            answered: prev.areaProgress[area].answered + total,
            correct: prev.areaProgress[area].correct + correct,
          },
        },
      };
      updated.level = Math.floor(updated.xp / XP_PER_LEVEL) + 1;
      updated.badges = computeBadges(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  async function finishSimulacro(result: SimulacroResult) {
    setProgress((prev) => {
      const streak = computeStreak(prev);
      const updated: StudyProgress = {
        ...prev,
        xp: prev.xp + XP_PER_SIMULACRO,
        streak,
        maxStreak: Math.max(prev.maxStreak, streak),
        lastStudyDate: new Date().toDateString(),
        simulacros: [...prev.simulacros, result],
      };
      updated.level = Math.floor(updated.xp / XP_PER_LEVEL) + 1;
      updated.badges = computeBadges(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  async function completeDiagnostico(areaScores: Record<AreaId, number>) {
    setProgress((prev) => {
      const newAreaProgress = { ...prev.areaProgress };
      (Object.keys(areaScores) as AreaId[]).forEach((area) => {
        newAreaProgress[area] = {
          answered: prev.areaProgress[area].answered + 3,
          correct: prev.areaProgress[area].correct + Math.round(areaScores[area] * 3),
        };
      });
      const updated: StudyProgress = {
        ...prev,
        xp: prev.xp + 100,
        areaProgress: newAreaProgress,
        badges: prev.badges.includes("diagnostico")
          ? prev.badges
          : [...prev.badges, "diagnostico"],
      };
      updated.level = Math.floor(updated.xp / XP_PER_LEVEL) + 1;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function hasBadge(id: string): boolean {
    return progress.badges.includes(id);
  }

  function getAreaAccuracy(area: AreaId): number {
    const ap = progress.areaProgress[area];
    if (ap.answered === 0) return 0;
    return ap.correct / ap.answered;
  }

  function getEstimatedScore(): number {
    const areas: AreaId[] = ["matematicas", "lectura", "ciencias", "sociales", "ingles"];
    const total = areas.reduce((sum, area) => sum + getAreaAccuracy(area) * 100, 0);
    return Math.round(total);
  }

  return (
    <StudyContext.Provider
      value={{ progress, isLoading, addAnswer, finishSession, finishSimulacro, completeDiagnostico, hasBadge, getAreaAccuracy, getEstimatedScore }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  return useContext(StudyContext);
}
