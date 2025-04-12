
import { useState, useEffect, useRef } from 'react';
import { Ayah } from '../types/quranTypes';

// Custom hook for audio recitation
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    // Create audio element once on mount to avoid recreation issues
    audioRef.current = new Audio();
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const playAyah = (audioUrl: string, ayahNumber: number) => {
    // If already playing the same ayah, stop it
    if (isPlaying && currentAyahNumber === ayahNumber && audioRef.current) {
      stopAudio();
      return;
    }
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    try {
      // Stop any current playback
      if (audioRef.current.src) {
        audioRef.current.pause();
      }
      
      // Set new source
      audioRef.current.src = audioUrl;
      
      // Set up event handlers
      audioRef.current.onplay = () => {
        setIsPlaying(true);
        setCurrentAyahNumber(ayahNumber);
        setAudioError(null);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentAyahNumber(null);
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Error playing audio', e);
        setIsPlaying(false);
        setCurrentAyahNumber(null);
        setAudioError('Unable to play audio. Please try a different reciter.');
      };
      
      // Load and play
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      
      // Handle play promise rejection (common in browsers that restrict autoplay)
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Failed to play audio:', err);
          setAudioError('Playback failed. Please try clicking again or try a different reciter.');
        });
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      setAudioError('Audio playback is not supported in this browser or environment.');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Reset current time to allow replaying
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAyahNumber(null);
    }
  };

  const playSurah = (ayahs: Ayah[]) => {
    if (ayahs.length === 0) return;
    
    let currentIndex = 0;
    
    const playNextAyah = () => {
      if (currentIndex < ayahs.length) {
        const ayah = ayahs[currentIndex];
        
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        try {
          // Stop any current playback
          if (audioRef.current.src) {
            audioRef.current.pause();
          }
          
          audioRef.current.src = ayah.audioUrl || '';
          
          audioRef.current.onended = () => {
            currentIndex++;
            playNextAyah();
          };
          
          audioRef.current.onerror = () => {
            console.error('Error playing ayah:', ayah.numberInSurah);
            currentIndex++;
            playNextAyah();
          };
          
          setCurrentAyahNumber(ayah.numberInSurah);
          setIsPlaying(true);
          
          // Load and play
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Failed to play surah audio:', err);
              currentIndex++;
              playNextAyah();
            });
          }
        } catch (err) {
          console.error('Error in playSurah:', err);
          currentIndex++;
          playNextAyah();
        }
      } else {
        setIsPlaying(false);
        setCurrentAyahNumber(null);
      }
    };
    
    playNextAyah();
  };

  return {
    isPlaying,
    currentAyahNumber,
    playAyah,
    stopAudio,
    playSurah,
    audioError
  };
};
