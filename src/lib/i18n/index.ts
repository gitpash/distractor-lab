import { init, addMessages, locale } from "svelte-i18n";
import en from "./en.ts";
import ru from "./ru.ts";

// Register messages
addMessages("en", en);
addMessages("ru", ru);

const STORAGE_KEY = "gabor-lang";

// Determine initial locale: localStorage > navigator > 'en'
const getInitialLocale = (): "en" | "ru" => {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ru") return saved;
  }
  // Check navigator if available on client
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.startsWith("ru") ? "ru" : "en";
  }
  return "en";
};

init({
  fallbackLocale: "en",
  initialLocale: getInitialLocale(),
});

// Helper to persist language choice
export const setLanguage = (loc: "en" | "ru") => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, loc);
  }
  locale.set(loc);
};
