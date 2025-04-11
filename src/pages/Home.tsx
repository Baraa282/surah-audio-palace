
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import SurahSelector from '@/components/SurahSelector';
import SurahInfo from '@/components/SurahInfo';
import AyahList from '@/components/AyahList';
import { 
  useSurahDetail, 
  useAudioPlayer,
  useBookmarks 
} from '@/services/quranApi';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);
  const initialAyah = parseInt(searchParams.get('ayah') || '0', 10);
  
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const { surah, loading, error } = useSurahDetail(selectedSurah);
  const { 
    isPlaying, 
    currentAyahNumber, 
    playAyah, 
    stopAudio,
    playSurah 
  } = useAudioPlayer();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();
  
  useEffect(() => {
    // If there's an initial ayah in the URL, scroll to it
    if (initialAyah > 0 && surah && !loading) {
      const ayahElement = document.getElementById(`ayah-${initialAyah}`);
      if (ayahElement) {
        ayahElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialAyah, surah, loading]);
  
  const handleSurahChange = (surahNumber: number) => {
    stopAudio();
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
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Surah...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
          Error loading Surah. Please try again.
        </div>
      ) : surah ? (
        <>
          <SurahInfo surah={surah} />
          <AyahList 
            ayahs={surah.ayahs} 
            currentAyah={currentAyahNumber}
            isPlaying={isPlaying}
            onAyahClick={handleAyahClick}
            isBookmarked={(ayahNumber) => isBookmarked(surah.number, ayahNumber)}
            onBookmarkToggle={handleBookmarkToggle}
          />
        </>
      ) : null}
    </Layout>
  );
};

export default Home;
