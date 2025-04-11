
import React from 'react';
import { 
  Moon, 
  Sun, 
  Type, 
  Globe, 
  Volume2,
  Eye,
  EyeOff
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useSettings, 
  TRANSLATION_EDITIONS_LIST,
  RECITER_EDITIONS_LIST,
  COLOR_OPTIONS_LIST
} from '@/contexts/SettingsContext';

const Settings = () => {
  const { 
    fontSize, 
    setFontSize,
    fontColor,
    setFontColor,
    isDarkMode,
    toggleDarkMode,
    showTranslation,
    toggleTranslation,
    translationEdition,
    setTranslationEdition,
    reciterEdition,
    setReciterEdition
  } = useSettings();
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <Label htmlFor="theme-mode">Dark Mode</Label>
              </div>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
          
          {/* Font Size */}
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-5 w-5" />
              <Label>Font Size: {fontSize}px</Label>
            </div>
            <Slider
              value={[fontSize]}
              min={14}
              max={30}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="my-4"
            />
            <div className="flex justify-between text-sm">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
          
          {/* Font Color */}
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-5 w-5" />
              <Label>Font Color</Label>
            </div>
            <div className="flex justify-between gap-2 mt-2">
              {COLOR_OPTIONS_LIST.map((color) => (
                <button
                  key={color}
                  onClick={() => setFontColor(color)}
                  className={`w-10 h-10 rounded-full ${
                    fontColor === color ? 'ring-2 ring-quran-secondary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
          </div>
          
          {/* Translation Toggle */}
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showTranslation ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                <Label htmlFor="show-translation">Show Translation</Label>
              </div>
              <Switch
                id="show-translation"
                checked={showTranslation}
                onCheckedChange={toggleTranslation}
              />
            </div>
          </div>
          
          {/* Translation Selection */}
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5" />
              <Label>Translation</Label>
            </div>
            <Select value={translationEdition} onValueChange={setTranslationEdition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select translation" />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATION_EDITIONS_LIST.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Reciter Selection */}
          <div className="bg-white dark:bg-quran-dark rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="h-5 w-5" />
              <Label>Reciter</Label>
            </div>
            <Select value={reciterEdition} onValueChange={setReciterEdition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select reciter" />
              </SelectTrigger>
              <SelectContent>
                {RECITER_EDITIONS_LIST.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
