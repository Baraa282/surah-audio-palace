
import { useState, useEffect } from 'react';
import { Bookmark } from '../types/quranTypes';

// Function to get bookmarked Ayahs
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
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
