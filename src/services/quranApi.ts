
import { useState, useEffect, useRef } from 'react';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  translation?: string;
  audioUrl?: string;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

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

// Custom hook for audio recitation
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    // Create audio element once on mount to avoid recreation issues
    audioRef.current = new Audio();
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const playAyah = (audioUrl: string, ayahNumber: number) => {
    // If already playing the same ayah, stop it
    if (isPlaying && currentAyahNumber === ayahNumber && audioRef.current) {
      stopAudio();
      return;
    }
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    try {
      // Stop any current playback
      if (audioRef.current.src) {
        audioRef.current.pause();
      }
      
      // Set new source
      audioRef.current.src = audioUrl;
      
      // Set up event handlers
      audioRef.current.onplay = () => {
        setIsPlaying(true);
        setCurrentAyahNumber(ayahNumber);
        setAudioError(null);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentAyahNumber(null);
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Error playing audio', e);
        setIsPlaying(false);
        setCurrentAyahNumber(null);
        setAudioError('Unable to play audio. Please try a different reciter.');
      };
      
      // Load and play
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      
      // Handle play promise rejection (common in browsers that restrict autoplay)
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Failed to play audio:', err);
          setAudioError('Playback failed. Please try clicking again or try a different reciter.');
        });
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      setAudioError('Audio playback is not supported in this browser or environment.');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Reset current time to allow replaying
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAyahNumber(null);
    }
  };

  const playSurah = (ayahs: Ayah[]) => {
    if (ayahs.length === 0) return;
    
    let currentIndex = 0;
    
    const playNextAyah = () => {
      if (currentIndex < ayahs.length) {
        const ayah = ayahs[currentIndex];
        
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        try {
          // Stop any current playback
          if (audioRef.current.src) {
            audioRef.current.pause();
          }
          
          audioRef.current.src = ayah.audioUrl || '';
          
          audioRef.current.onended = () => {
            currentIndex++;
            playNextAyah();
          };
          
          audioRef.current.onerror = () => {
            console.error('Error playing ayah:', ayah.numberInSurah);
            currentIndex++;
            playNextAyah();
          };
          
          setCurrentAyahNumber(ayah.numberInSurah);
          setIsPlaying(true);
          
          // Load and play
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Failed to play surah audio:', err);
              currentIndex++;
              playNextAyah();
            });
          }
        } catch (err) {
          console.error('Error in playSurah:', err);
          currentIndex++;
          playNextAyah();
        }
      } else {
        setIsPlaying(false);
        setCurrentAyahNumber(null);
      }
    };
    
    playNextAyah();
  };

  return {
    isPlaying,
    currentAyahNumber,
    playAyah,
    stopAudio,
    playSurah,
    audioError
  };
};

// Function to get bookmarked Ayahs
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<{surahNumber: number, ayahNumber: number}[]>([]);
  
  useEffect(() => {
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('quran-bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
        setBookmarks([]);
      }
    }
  }, []);
  
  const addBookmark = (surahNumber: number, ayahNumber: number) => {
    const newBookmarks = [...bookmarks, { surahNumber, ayahNumber }];
    setBookmarks(newBookmarks);
    localStorage.setItem('quran-bookmarks', JSON.stringify(newBookmarks));
  };
  
  const removeBookmark = (surahNumber: number, ayahNumber: number) => {
    const newBookmarks = bookmarks.filter(
      bookmark => !(bookmark.surahNumber === surahNumber && bookmark.ayahNumber === ayahNumber)
    );
    setBookmarks(newBookmarks);
    localStorage.setItem('quran-bookmarks', JSON.stringify(newBookmarks));
  };
  
  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarks.some(
      bookmark => bookmark.surahNumber === surahNumber && bookmark.ayahNumber === ayahNumber
    );
  };
  
  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
};
