
import React from 'react';
import { Play, Pause, Bookmark, BookmarkCheck } from 'lucide-react';
import { Ayah } from '@/services/quranApi';
import { useSettings } from '@/contexts/SettingsContext';

interface AyahListProps {
  ayahs: Ayah[];
  currentAyah: number | null;
  isPlaying: boolean;
  onAyahClick: (audioUrl: string, ayahNumber: number) => void;
  isBookmarked: (ayahNumber: number) => boolean;
  onBookmarkToggle: (ayahNumber: number) => void;
}

const AyahList: React.FC<AyahListProps> = ({ 
  ayahs, 
  currentAyah, 
  isPlaying, 
  onAyahClick,
  isBookmarked,
  onBookmarkToggle
}) => {
  const { fontSize, fontColor, showTranslation } = useSettings();
  
  const renderAudioWave = () => (
    <div className="audio-wave flex items-center mt-1">
      <span className="h-2"></span>
      <span className="h-3"></span>
      <span className="h-4"></span>
      <span className="h-5"></span>
      <span className="h-3"></span>
    </div>
  );

  return (
    <div className="space-y-4">
      {ayahs.map((ayah) => (
        <div 
          key={ayah.numberInSurah}
          className={`p-4 rounded-xl ${
            currentAyah === ayah.numberInSurah 
              ? 'bg-quran-primary/10 dark:bg-quran-primary/20 border-l-4 border-quran-primary dark:border-quran-secondary' 
              : 'bg-white dark:bg-quran-dark'
          } shadow-md relative transition-all`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-quran-primary/10 dark:bg-quran-primary/20 rounded-full text-quran-primary dark:text-quran-secondary font-semibold mr-2">
                {ayah.numberInSurah}
              </div>
              <button 
                onClick={() => onAyahClick(ayah.audioUrl || '', ayah.numberInSurah)} 
                className="text-quran-primary dark:text-quran-secondary hover:opacity-80 transition-opacity"
              >
                {currentAyah === ayah.numberInSurah && isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <button
              onClick={() => onBookmarkToggle(ayah.numberInSurah)}
              className="text-quran-secondary hover:opacity-80 transition-opacity"
            >
              {isBookmarked(ayah.numberInSurah) ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div>
            <p 
              className="arabic-text text-right mb-2 leading-loose" 
              style={{ 
                fontSize: `${fontSize}px`,
                color: fontColor
              }}
            >
              {ayah.text}
            </p>
            
            {showTranslation && ayah.translation && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                {ayah.translation}
              </p>
            )}
          </div>
          
          {currentAyah === ayah.numberInSurah && isPlaying && (
            <div className="mt-2">
              {renderAudioWave()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AyahList;
