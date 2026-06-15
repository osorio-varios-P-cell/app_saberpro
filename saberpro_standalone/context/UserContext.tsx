import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Calendario = "A" | "B";

export interface UserProfile {
  name: string;
  colegio: string;
  calendario: Calendario;
  examDate: string;
  onboardingComplete: boolean;
  diagnosticoComplete: boolean;
}

const DEFAULT_USER: UserProfile = {
  name: "",
  colegio: "",
  calendario: "A",
  examDate: "",
  onboardingComplete: false,
  diagnosticoComplete: false,
};

const STORAGE_KEY = "saberpro_user";

interface UserContextValue {
  user: UserProfile;
  isLoading: boolean;
  updateUser: (partial: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  completeDiagnostico: () => Promise<void>;
  resetUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: DEFAULT_USER,
  isLoading: true,
  updateUser: async () => {},
  completeOnboarding: async () => {},
  completeDiagnostico: async () => {},
  resetUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function saveUser(updated: UserProfile) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  async function updateUser(partial: Partial<UserProfile>) {
    const updated = { ...user, ...partial };
    await saveUser(updated);
  }

  async function completeOnboarding(data: Partial<UserProfile>) {
    const updated: UserProfile = {
      ...user,
      ...data,
      onboardingComplete: true,
    };
    await saveUser(updated);
  }

  async function completeDiagnostico() {
    await updateUser({ diagnosticoComplete: true });
  }

  async function resetUser() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(DEFAULT_USER);
  }

  return (
    <UserContext.Provider
      value={{ user, isLoading, updateUser, completeOnboarding, completeDiagnostico, resetUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
