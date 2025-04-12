
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Pause, Bookmark, BookmarkCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import SurahSelector from '@/components/SurahSelector';
import { useSurahDetail, useAudioPlayer, useBookmarks } from '@/services/quranApi';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import AyahList from '@/components/AyahList';

const TranslationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);
  
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const { translationEdition, reciterEdition } = useSettings();
  const { surah, loading, error } = useSurahDetail(selectedSurah, translationEdition, reciterEdition);
  const { isPlaying, currentAyahNumber, playAyah, stopAudio, playSurah } = useAudioPlayer();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();
  
  const handleSurahChange = (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setSearchParams({ surah: surahNumber.toString() });
  };
  
  const handleAyahClick = (audioUrl: string, ayahNumber: number) => {
    if (isPlaying && currentAyahNumber === ayahNumber) {
      stopAudio();
    } else {
      playAyah(audioUrl, ayahNumber);
    }
  };
  
  const handlePlaySurah = () => {
    if (surah) {
      if (isPlaying) {
        stopAudio();
        toast({
          title: "Playback stopped",
          description: `Stopped playing Surah ${surah.englishName}`,
        });
      } else {
        playSurah(surah.ayahs);
        toast({
          title: "Playing Surah",
          description: `Now playing Surah ${surah.englishName}`,
        });
      }
    }
  };
  
  const handleBookmarkToggle = (ayahNumber: number) => {
    if (!surah) return;
    
    if (isBookmarked(surah.number, ayahNumber)) {
      removeBookmark(surah.number, ayahNumber);
      toast({
        title: "Bookmark removed",
        description: `Removed Surah ${surah.englishName}, Verse ${ayahNumber} from bookmarks`,
      });
    } else {
      addBookmark(surah.number, ayahNumber);
      toast({
        title: "Bookmark added",
        description: `Added Surah ${surah.englishName}, Verse ${ayahNumber} to bookmarks`,
      });
    }
  };
  
  return (
    <Layout onPlayClick={handlePlaySurah} isPlaying={isPlaying}>
      <div>
        <h1 className="text-2xl font-bold mb-6">Translations</h1>
        
        <SurahSelector onSurahSelect={handleSurahChange} selectedSurah={selectedSurah} />
        
        {loading ? (
          <div className="text-center py-10">
            <div className="flex justify-center">
              <div className="audio-wave flex items-center">
                <span className="h-8"></span>
                <span className="h-12"></span>
                <span className="h-16"></span>
                <span className="h-12"></span>
                <span className="h-8"></span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Translation...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
            Error loading translation. Please try again.
          </div>
        ) : surah ? (
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md mb-4">
            <h2 className="text-xl font-bold mb-2 flex justify-between">
              <span>{surah.englishName}</span>
              <span className="arabic-text">{surah.name}</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses • {surah.revelationType}
            </p>
            
            <AyahList 
              ayahs={surah.ayahs}
              currentAyah={currentAyahNumber}
              isPlaying={isPlaying}
              onAyahClick={handleAyahClick}
              isBookmarked={(ayahNumber) => isBookmarked(surah.number, ayahNumber)}
              onBookmarkToggle={handleBookmarkToggle}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default TranslationPage;
