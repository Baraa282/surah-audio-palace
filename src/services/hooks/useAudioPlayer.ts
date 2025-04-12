
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
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Set up global error handler
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
        setIsPlaying(false);
        setAudioError('Unable to play audio. Please try a different reciter or check your connection.');
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Function to check if the browser supports the audio format
  const checkAudioCompatibility = () => {
    const audio = document.createElement('audio');
    return !!audio.canPlayType('audio/mpeg');
  };

  const playAyah = (audioUrl: string, ayahNumber: number) => {
    // Check if audio is supported first
    if (!checkAudioCompatibility()) {
      setAudioError('Your browser does not support audio playback. Please try a different browser.');
      return;
    }
    
    // If already playing the same ayah, stop it
    if (isPlaying && currentAyahNumber === ayahNumber && audioRef.current) {
      stopAudio();
      return;
    }
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    try {
      // Reset error state
      setAudioError(null);
      
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
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentAyahNumber(null);
      };
      
      // Load and play with proper error handling
      audioRef.current.load();
      
      // Use a timeout to ensure the audio has time to load before playing
      setTimeout(() => {
        if (audioRef.current) {
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Failed to play audio:', err);
              setIsPlaying(false);
              setCurrentAyahNumber(null);
              setAudioError('Audio playback failed. This might be due to browser restrictions. Try clicking again or use a different reciter.');
            });
          }
        }
      }, 100);
    } catch (err) {
      console.error('Audio playback error:', err);
      setAudioError('Audio playback failed. This could be a browser restriction or network issue.');
      setIsPlaying(false);
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
    // Check if audio is supported first
    if (!checkAudioCompatibility()) {
      setAudioError('Your browser does not support audio playback. Please try a different browser.');
      return;
    }
    
    if (ayahs.length === 0) return;
    
    // Reset error state
    setAudioError(null);
    
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
            setAudioError('Error playing audio. Please try a different reciter.');
            currentIndex++;
            playNextAyah();
          };
          
          setCurrentAyahNumber(ayah.numberInSurah);
          setIsPlaying(true);
          
          // Load and play with better error handling
          audioRef.current.load();
          
          // Use a timeout to ensure the audio has time to load
          setTimeout(() => {
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise.catch(err => {
                  console.error('Failed to play surah audio:', err);
                  setAudioError('Audio playback failed. This might be due to browser restrictions.');
                  currentIndex++;
                  playNextAyah();
                });
              }
            }
          }, 100);
        } catch (err) {
          console.error('Error in playSurah:', err);
          setAudioError('Error playing surah. Please try again later.');
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
