"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Persona {
  userId: string;
  label: string;
  usage: string[];
  blurb: string;
}

/** Demo shoppers — must match the usage_profile seeded on USER001–USER003. */
export const PERSONAS: Persona[] = [
  {
    userId: "USER001",
    label: "Office / Casual",
    usage: ["web browsing", "video streaming", "office work"],
    blurb: "Light, everyday use — email, video, office work.",
  },
  {
    userId: "USER002",
    label: "Gamer / Power user",
    usage: ["AAA gaming", "video editing", "streaming"],
    blurb: "Demands high performance — gaming, editing, rendering.",
  },
  {
    userId: "USER003",
    label: "Student",
    usage: ["note-taking", "research", "budget-conscious"],
    blurb: "Budget-conscious — notes, research, light study.",
  },
];

const STORAGE_KEY = "relife_user_id";

interface PersonaCtx {
  userId: string;
  persona: Persona;
  setUserId: (id: string) => void;
}

const PersonaContext = createContext<PersonaCtx | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string>(PERSONAS[0].userId);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && PERSONAS.some((p) => p.userId === saved)) {
        setUserIdState(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function setUserId(id: string) {
    setUserIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }

  const persona =
    PERSONAS.find((p) => p.userId === userId) ?? PERSONAS[0];

  return (
    <PersonaContext.Provider value={{ userId, persona, setUserId }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaCtx {
  const ctx = useContext(PersonaContext);
  // Safe fallback if ever used outside the provider.
  if (!ctx) return { userId: PERSONAS[0].userId, persona: PERSONAS[0], setUserId: () => {} };
  return ctx;
}
