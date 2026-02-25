import { create } from "zustand";
import type { ThemeMode } from "@/constants/theme";

interface AppState {
  selectedCategory: "all" | "crypto" | "ai";
  theme: ThemeMode;
  readArticleIds: Set<string>;
  setCategory: (category: "all" | "crypto" | "ai") => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  markAsRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCategory: "all",
  theme: "dark",
  readArticleIds: new Set(),

  setCategory: (category) => set({ selectedCategory: category }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    })),

  markAsRead: (id) =>
    set((state) => {
      const updated = new Set(state.readArticleIds);
      updated.add(id);
      return { readArticleIds: updated };
    }),
}));
