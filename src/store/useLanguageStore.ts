import { create } from 'zustand';
import { Language, translations } from '../utils/translations';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  t: (key) => {
    const lang = get().language;
    return translations[lang][key] || translations['en'][key] || key;
  },
}));
