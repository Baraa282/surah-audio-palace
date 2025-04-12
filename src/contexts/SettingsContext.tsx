
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  fontColor: string;
  setFontColor: (color: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showTranslation: boolean;
  toggleTranslation: () => void;
  translationEdition: string;
  setTranslationEdition: (edition: string) => void;
  reciterEdition: string;
  setReciterEdition: (edition: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

const COLOR_OPTIONS = [
  '#000000', // Default black (changed from #333333 for better visibility)
  '#0A5F38', // Primary green
  '#B68D40', // Gold
  '#1E656D', // Teal
  '#7D3C98', // Purple
];

const TRANSLATION_EDITIONS = [
  { id: 'en.asad', name: 'Muhammad Asad' },
  { id: 'en.pickthall', name: 'Pickthall' },
  { id: 'en.yusufali', name: 'Yusuf Ali' },
  { id: 'en.sahih', name: 'Sahih International' },
  { id: 'en.clearquran', name: 'Dr. Mustafa Khattab' },
  { id: 'en.ahmedali', name: 'Ahmed Ali' },
  { id: 'en.arberry', name: 'A.J. Arberry' },
  { id: 'en.maududi', name: 'Abul Ala Maududi' },
  { id: 'en.hilali', name: 'Hilali & Khan' },
  { id: 'fr.hamidullah', name: 'Hamidullah (French)' },
  { id: 'de.aburida', name: 'Abu Rida (German)' },
  { id: 'es.bornez', name: 'Bornez (Spanish)' },
  { id: 'ru.kuliev', name: 'Kuliev (Russian)' },
  { id: 'tr.ates', name: 'Suleyman Ates (Turkish)' },
  { id: 'id.indonesian', name: 'Indonesian' },
  { id: 'ur.jalandhry', name: 'Jalandhry (Urdu)' },
  { id: 'zh.jian', name: 'Ma Jian (Chinese)' },
];

const RECITER_EDITIONS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdulbasit', name: 'Abdul Basit' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahmaan As-Sudais' },
  { id: 'ar.ahmedajamy', name: 'Ahmed Al-Ajamy' },
  { id: 'ar.alminshawi', name: 'Mohammad Al-Minshawi' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.husarymujawwad', name: 'Mahmoud Khalil Al-Husary (Mujawwad)' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify' },
  { id: 'ar.ibrahimakhbar', name: 'Ibrahim Akhdar' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub' },
  { id: 'ar.muhammadjibreel', name: 'Muhammad Jibreel' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree' },
  { id: 'ar.rifai', name: 'Hani Ar-Rifai' },
  { id: 'ar.tablawy', name: 'Mohammad al Tablaway' },
  { id: 'ar.aymanswoaid', name: 'Ayman Sowaid' },
];

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  // Load settings from localStorage or use defaults
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('quran-font-size');
    return saved ? parseInt(saved, 10) : 18;
  });
  
  const [fontColor, setFontColor] = useState(() => {
    const saved = localStorage.getItem('quran-font-color');
    return saved || COLOR_OPTIONS[0];
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('quran-dark-mode');
    return saved ? saved === 'true' : false;
  });
  
  const [showTranslation, setShowTranslation] = useState(() => {
    const saved = localStorage.getItem('quran-show-translation');
    return saved ? saved === 'true' : true;
  });
  
  const [translationEdition, setTranslationEdition] = useState(() => {
    const saved = localStorage.getItem('quran-translation-edition');
    return saved || TRANSLATION_EDITIONS[0].id;
  });
  
  const [reciterEdition, setReciterEdition] = useState(() => {
    const saved = localStorage.getItem('quran-reciter-edition');
    return saved || RECITER_EDITIONS[0].id;
  });
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('quran-font-size', fontSize.toString());
  }, [fontSize]);
  
  useEffect(() => {
    localStorage.setItem('quran-font-color', fontColor);
  }, [fontColor]);
  
  useEffect(() => {
    localStorage.setItem('quran-dark-mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    localStorage.setItem('quran-show-translation', showTranslation.toString());
  }, [showTranslation]);
  
  useEffect(() => {
    localStorage.setItem('quran-translation-edition', translationEdition);
  }, [translationEdition]);
  
  useEffect(() => {
    localStorage.setItem('quran-reciter-edition', reciterEdition);
  }, [reciterEdition]);
  
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleTranslation = () => setShowTranslation(!showTranslation);
  
  const value = {
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    isDarkMode,
    toggleDarkMode,
    showTranslation,
    toggleTranslation,
    translationEdition,
    setTranslationEdition,
    reciterEdition,
    setReciterEdition,
  };
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const TRANSLATION_EDITIONS_LIST = TRANSLATION_EDITIONS;
export const RECITER_EDITIONS_LIST = RECITER_EDITIONS;
export const COLOR_OPTIONS_LIST = COLOR_OPTIONS;
