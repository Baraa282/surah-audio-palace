
import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAllSurahs, Surah } from '@/services/quranApi';

interface SurahSelectorProps {
  onSurahSelect: (surahNumber: number) => void;
  selectedSurah?: number;
}

const SurahSelector: React.FC<SurahSelectorProps> = ({ onSurahSelect, selectedSurah }) => {
  const { surahs, loading, error } = useAllSurahs();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSelect = (value: string) => {
    onSurahSelect(parseInt(value, 10));
  };
  
  const filteredSurahs = searchTerm.trim() !== '' 
    ? surahs.filter(surah => 
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.number.toString().includes(searchTerm)
      )
    : surahs;
  
  return (
    <div className="w-full mb-6">
      <div className="flex items-center mb-3">
        <h2 className="text-xl font-semibold">Select Surah</h2>
      </div>
      
      <Select onValueChange={handleSelect} defaultValue={selectedSurah?.toString()}>
        <SelectTrigger className="w-full bg-white dark:bg-quran-dark border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <SelectValue placeholder="Select a Surah" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Surahs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-2">Loading Surahs...</div>
          ) : error ? (
            <div className="text-center py-2 text-red-500">Error loading Surahs</div>
          ) : (
            filteredSurahs.map((surah) => (
              <SelectItem key={surah.number} value={surah.number.toString()}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{surah.number}. {surah.englishName}</span>
                  <span className="text-sm text-gray-500 arabic-text">{surah.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SurahSelector;
