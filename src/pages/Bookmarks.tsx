
import React from 'react';
import Layout from '@/components/Layout';
import BookmarkList from '@/components/BookmarkList';
import { useBookmarks } from '@/services/quranApi';

const Bookmarks = () => {
  const { bookmarks, removeBookmark } = useBookmarks();
  
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Your Bookmarks</h1>
        <BookmarkList 
          bookmarks={bookmarks} 
          onRemoveBookmark={removeBookmark} 
        />
      </div>
    </Layout>
  );
};

export default Bookmarks;
