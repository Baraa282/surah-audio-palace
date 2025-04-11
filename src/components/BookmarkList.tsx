
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkX, ChevronRight } from 'lucide-react';
import { useAllSurahs, useSurahDetail, Surah, Ayah } from '@/services/quranApi';
import { useSettings } from '@/contexts/SettingsContext';

interface BookmarkItem {
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  englishName?: string;
  ayahText?: string;
  ayahTranslation?: string;
}

interface BookmarkListProps {
  bookmarks: {surahNumber: number, ayahNumber: number}[];
  onRemoveBookmark: (surahNumber: number, ayahNumber: number) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onRemoveBookmark }) => {
  const [bookmarkDetails, setBookmarkDetails] = useState<BookmarkItem[]>([]);
  const { surahs } = useAllSurahs();
  const { fontSize, fontColor, showTranslation } = useSettings();
  
  useEffect(() => {
    const fetchBookmarkDetails = async () => {
      if (!surahs.length || !bookmarks.length) return;
      
      const details: BookmarkItem[] = [];
      
      // Group bookmarks by surah to minimize API calls
      const surahGroups: Record<number, number[]> = {};
      bookmarks.forEach(bookmark => {
        if (!surahGroups[bookmark.surahNumber]) {
          surahGroups[bookmark.surahNumber] = [];
        }
        surahGroups[bookmark.surahNumber].push(bookmark.ayahNumber);
      });
      
      // Fetch details for each surah
      for (const surahNumber of Object.keys(surahGroups).map(Number)) {
        try {
          const surah = surahs.find(s => s.number === surahNumber);
          if (!surah) continue;
          
          const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
          const data = await response.json();
          
          // Fetch translation
          const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
          const translationData = await translationResponse.json();
          
          if (data.code === 200 && translationData.code === 200) {
            const ayahs = data.data.ayahs;
            const translationAyahs = translationData.data.ayahs;
            
            surahGroups[surahNumber].forEach(ayahNumber => {
              const ayah = ayahs.find((a: any) => a.numberInSurah === ayahNumber);
              const translationAyah = translationAyahs.find((a: any) => a.numberInSurah === ayahNumber);
              
              if (ayah && translationAyah) {
                details.push({
                  surahNumber,
                  ayahNumber,
                  surahName: surah.name,
                  englishName: surah.englishName,
                  ayahText: ayah.text,
                  ayahTranslation: translationAyah.text
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching details for surah ${surahNumber}:`, error);
        }
      }
      
      setBookmarkDetails(details);
    };
    
    fetchBookmarkDetails();
  }, [bookmarks, surahs]);
  
  if (!bookmarks.length) {
    return (
      <div className="text-center py-10">
        <div className="mb-4">
          <BookmarkX className="h-12 w-12 mx-auto text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No bookmarks yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start adding bookmarks by tapping the bookmark icon next to any Ayah.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {bookmarkDetails.map((bookmark) => (
        <div key={`${bookmark.surahNumber}-${bookmark.ayahNumber}`} className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold">
                {bookmark.englishName} ({bookmark.surahName})
              </h3>
              <p className="text-sm text-gray-500">
                Verse {bookmark.ayahNumber}
              </p>
            </div>
            <button
              onClick={() => onRemoveBookmark(bookmark.surahNumber, bookmark.ayahNumber)}
              className="text-red-500 hover:text-red-600 p-1"
              aria-label="Remove bookmark"
            >
              <BookmarkX className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-2">
            <p
              className="arabic-text text-right mb-2 leading-loose"
              style={{ 
                fontSize: `${fontSize}px`,
                color: fontColor
              }}
            >
              {bookmark.ayahText}
            </p>
            
            {showTranslation && bookmark.ayahTranslation && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                {bookmark.ayahTranslation}
              </p>
            )}
          </div>
          
          <div className="mt-4 text-right">
            <Link
              to={`/?surah=${bookmark.surahNumber}&ayah=${bookmark.ayahNumber}`}
              className="inline-flex items-center text-quran-primary dark:text-quran-secondary font-medium text-sm"
            >
              Go to Surah <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
