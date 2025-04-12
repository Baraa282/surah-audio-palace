
import { useState, useEffect } from 'react';
import { Surah, SurahDetail, Ayah } from '../types/quranTypes';

// Custom hook to fetch all Surahs
export const useAllSurahs = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        
        if (data.code === 200 && data.status === 'OK') {
          setSurahs(data.data);
        } else {
          setError('Failed to fetch Surahs');
        }
      } catch (err) {
        setError('Error connecting to the Quran API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  return { surahs, loading, error };
};

// Custom hook to fetch a specific Surah with its Ayahs
export const useSurahDetail = (surahNumber: number, translationEdition: string = 'en.asad', reciterEdition: string = 'ar.alafasy') => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahDetail = async () => {
      try {
        setLoading(true);
        
        // Fetch Surah in Arabic with the selected reciter
        const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterEdition}`);
        const arabicData = await arabicResponse.json();
        
        // Fetch translation
        const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationEdition}`);
        const translationData = await translationResponse.json();
        
        if (arabicData.code === 200 && translationData.code === 200) {
          // Get the base audio URL for the selected reciter
          const reciterBaseUrl = `https://cdn.islamic.network/quran/audio/128/${reciterEdition.replace('ar.', '')}`;
          
          // Combine Arabic text with translation
          const combinedAyahs = arabicData.data.ayahs.map((ayah: Ayah, index: number) => ({
            ...ayah,
            translation: translationData.data.ayahs[index].text,
            audioUrl: `${reciterBaseUrl}/${ayah.number}.mp3`
          }));
          
          setSurah({
            ...arabicData.data,
            ayahs: combinedAyahs
          });
        } else {
          setError('Failed to fetch Surah details');
        }
      } catch (err) {
        setError('Error connecting to the Quran API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (surahNumber > 0) {
      fetchSurahDetail();
    }
  }, [surahNumber, translationEdition, reciterEdition]);

  return { surah, loading, error };
};
