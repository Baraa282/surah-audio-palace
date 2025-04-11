
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  GalleryVertical, 
  PlayCircle,
  Bookmark,
  Search
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface LayoutProps {
  children: React.ReactNode;
  onPlayClick?: () => void;
  isPlaying?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onPlayClick, isPlaying }) => {
  const location = useLocation();
  const { isDarkMode } = useSettings();
  
  const navItems = [
    { 
      id: 'settings',
      path: '/settings',
      icon: <Settings className="w-6 h-6" />,
      label: 'Settings'
    },
    { 
      id: 'translation',
      path: '/translation',
      icon: <GalleryVertical className="w-6 h-6" />,
      label: 'Translation'
    },
    { 
      id: 'play',
      path: '#',
      icon: <PlayCircle className={`w-8 h-8 ${isPlaying ? 'text-quran-secondary' : ''}`} />,
      label: 'Play',
      special: true,
      onClick: onPlayClick
    },
    { 
      id: 'bookmarks',
      path: '/bookmarks',
      icon: <Bookmark className="w-6 h-6" />,
      label: 'Bookmarks'
    },
    { 
      id: 'search',
      path: '/search',
      icon: <Search className="w-6 h-6" />,
      label: 'Search'
    },
  ];

  const getActiveClass = (path: string) => {
    const isActive = path !== '#' && location.pathname === path;
    return isActive ? 'text-quran-primary dark:text-quran-secondary' : 'text-gray-500';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="pattern-bg min-h-screen pb-16 relative">
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        
        {/* Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-quran-dark border-t border-gray-200 dark:border-gray-800 z-10">
          <div className="max-w-screen-lg mx-auto">
            <div className="flex items-center justify-around">
              {navItems.map((item) => (
                <div key={item.id} className="flex-1">
                  {item.special ? (
                    <button 
                      onClick={item.onClick} 
                      className="flex flex-col items-center justify-center w-full py-2 focus:outline-none"
                    >
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-quran-primary text-white dark:bg-quran-secondary dark:text-quran-dark -mt-5 shadow-lg">
                        {item.icon}
                      </div>
                      <span className="text-xs mt-1 text-gray-500">{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex flex-col items-center py-2 ${getActiveClass(item.path)}`}
                    >
                      {item.icon}
                      <span className="text-xs mt-1">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
