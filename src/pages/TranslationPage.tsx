
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Pause, Bookmark, BookmarkCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import SurahSelector from '@/components/SurahSelector';
import { useSurahDetail, useAudioPlayer, useBookmarks } from '@/services/quranApi';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

const TranslationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);
  
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const { surah, loading, error } = useSurahDetail(selectedSurah);
  const { fontSize, fontColor, showTranslation } = useSettings();
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
              <span className="arabic-text" style={{ color: fontColor }}>{surah.name}</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses • {surah.revelationType}
            </p>
            
            <div className="space-y-4 mt-6">
              {surah.ayahs.map((ayah) => (
                <div key={ayah.numberInSurah} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-7 h-7 flex items-center justify-center bg-quran-primary/10 dark:bg-quran-primary/20 rounded-full text-quran-primary dark:text-quran-secondary font-semibold text-xs mr-2">
                        {ayah.numberInSurah}
                      </div>
                      <button 
                        onClick={() => handleAyahClick(ayah.audioUrl || '', ayah.numberInSurah)} 
                        className="text-quran-primary dark:text-quran-secondary hover:opacity-80 transition-opacity"
                      >
                        {currentAyahNumber === ayah.numberInSurah && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleBookmarkToggle(ayah.numberInSurah)}
                      className="text-quran-secondary hover:opacity-80 transition-opacity"
                    >
                      {isBookmarked(surah.number, ayah.numberInSurah) ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  <p className="arabic-text text-right mb-2 leading-loose" 
                     style={{ fontSize: `${fontSize}px`, color: fontColor }}>
                    {ayah.text}
                  </p>
                  
                  {showTranslation && ayah.translation && (
                    <p className="text-gray-800 dark:text-gray-200" style={{ fontSize: `${fontSize - 2}px` }}>
                      {ayah.translation}
                    </p>
                  )}
                  
                  {currentAyahNumber === ayah.numberInSurah && isPlaying && (
                    <div className="mt-2">
                      <div className="audio-wave flex items-center">
                        <span className="h-2"></span>
                        <span className="h-3"></span>
                        <span className="h-4"></span>
                        <span className="h-5"></span>
                        <span className="h-3"></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default TranslationPage;
