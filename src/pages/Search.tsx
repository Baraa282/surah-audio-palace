
import React, { useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAllSurahs } from '@/services/quranApi';

interface SearchResult {
  surahNumber: number;
  surahName: string;
  englishName: string;
  matches: {
    ayahNumber: number;
    text: string;
    matchType: 'name' | 'content' | 'number';
  }[];
}

const Search = () => {
  const { surahs, loading: loadingSurahs } = useAllSurahs();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  
  const handleSearch = async () => {
    if (!searchQuery.trim() || loadingSurahs) return;
    
    setSearching(true);
    setNoResults(false);
    
    // First, search through surah names
    const nameMatches = surahs.filter(surah => 
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Check if query is a number (Surah number or Ayah number)
    const isNumber = !isNaN(parseInt(searchQuery, 10));
    let numberMatches: any[] = [];
    
    if (isNumber) {
      const num = parseInt(searchQuery, 10);
      numberMatches = surahs.filter(surah => 
        surah.number === num || (num <= surah.numberOfAyahs)
      );
    }
    
    // Combine and deduplicate results
    const initialResults = [...new Set([...nameMatches, ...numberMatches])];
    
    const searchResults: SearchResult[] = [];
    
    // For each potential surah, check for content matches
    for (const surah of initialResults) {
      try {
        // We don't need to search content for exact surah number matches
        const isExactSurahMatch = surah.number.toString() === searchQuery;
        
        const matches = [];
        
        // Add surah name match
        if (
          surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          matches.push({
            ayahNumber: 1, // Default to first ayah for name matches
            text: `${surah.englishName} (${surah.englishNameTranslation})`,
            matchType: 'name' as const
          });
        }
        
        // Add number match if this is an exact surah number
        if (isExactSurahMatch) {
          matches.push({
            ayahNumber: 1,
            text: `Surah ${surah.number}`,
            matchType: 'number' as const
          });
        }
        
        // Add ayah number match if the search is a number within range
        if (isNumber && !isExactSurahMatch) {
          const ayahNum = parseInt(searchQuery, 10);
          if (ayahNum > 0 && ayahNum <= surah.numberOfAyahs) {
            matches.push({
              ayahNumber: ayahNum,
              text: `Ayah ${ayahNum}`,
              matchType: 'number' as const
            });
          }
        }
        
        // If we have matches, add this surah to results
        if (matches.length > 0) {
          searchResults.push({
            surahNumber: surah.number,
            surahName: surah.name,
            englishName: surah.englishName,
            matches
          });
        }
      } catch (error) {
        console.error(`Error searching Surah ${surah.number}:`, error);
      }
    }
    
    setResults(searchResults);
    setNoResults(searchResults.length === 0);
    setSearching(false);
  };
  
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Search Quran</h1>
        
        <div className="mb-6">
          <div className="relative flex items-center">
            <Input
              type="search"
              placeholder="Search by surah name, number or ayah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-16"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button 
              onClick={handleSearch}
              className="absolute right-0 rounded-l-none bg-quran-primary hover:bg-quran-primary/90"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Search by Surah name, number, or Ayah number
          </p>
        </div>
        
        {loadingSurahs ? (
          <div className="text-center py-6">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Loading Quran data...</p>
          </div>
        ) : searching ? (
          <div className="text-center py-6">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Searching...</p>
          </div>
        ) : noResults ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <SearchIcon className="h-8 w-8 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">No results found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try searching for different terms or check your spelling
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.surahNumber} className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    {result.englishName} ({result.surahName})
                  </h3>
                  <span className="text-sm text-gray-500">
                    Surah {result.surahNumber}
                  </span>
                </div>
                
                <div className="space-y-2 mt-3">
                  {result.matches.map((match, idx) => (
                    <div key={idx} className="border-l-2 border-quran-primary pl-3 py-1">
                      <Link
                        to={`/?surah=${result.surahNumber}&ayah=${match.ayahNumber}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-quran-primary dark:text-quran-secondary font-medium">
                              {match.matchType === 'name' 
                                ? 'Surah Name Match' 
                                : match.matchType === 'content' 
                                  ? 'Content Match' 
                                  : 'Number Match'}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {match.text}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {match.matchType === 'name' ? 'View Surah' : `Go to Ayah ${match.ayahNumber}`}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default Search;
