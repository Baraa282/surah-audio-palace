
import { useState, useEffect, useRef } from 'react';
import { Ayah } from '../types/quranTypes';

// Custom hook for audio recitation
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

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
    
    // Try to handle autoplay restrictions by letting user interact first
    document.addEventListener('click', initializeAudio, { once: true });
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      document.removeEventListener('click', initializeAudio);
    };
  }, []);
  
  // Function to initialize audio after user interaction
  const initializeAudio = () => {
    if (audioRef.current) {
      // Create a short silent audio to initialize the audio context
      audioRef.current.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Immediately pause the silent audio
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          })
          .catch(err => {
            console.log("Audio context couldn't be initialized:", err);
            // Don't show error for initialization
          });
      }
    }
  };

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
      
      // Ensure audio isn't muted
      audioRef.current.muted = false;
      
      // Set up event handlers
      audioRef.current.onplay = () => {
        setIsPlaying(true);
        setCurrentAyahNumber(ayahNumber);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentAyahNumber(null);
      };
      
      // For iOS, we need to ensure volume is set
      audioRef.current.volume = 1.0;
      
      // Load the audio first
      audioRef.current.load();
      
      // Use a timeout to ensure the audio has time to load before playing
      setTimeout(() => {
        if (audioRef.current) {
          // For mobile devices, we need user interaction
          const userInteracted = document.documentElement.classList.contains('user-interacted');
          
          if (!userInteracted) {
            document.documentElement.classList.add('user-interacted');
          }
          
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Failed to play audio:', err);
              setIsPlaying(false);
              setCurrentAyahNumber(null);
              
              if (err.name === 'NotSupportedError') {
                setAudioError('Your browser blocked autoplay. Please tap the play button again or try a different reciter.');
              } else if (err.name === 'AbortError') {
                setAudioError('Audio playback was aborted. Please try again.');
              } else if (err.name === 'NotAllowedError') {
                // This is common on mobile devices without user interaction
                setAudioError('Audio autoplay is not allowed by your browser. Please tap the play button again.');
              } else {
                setAudioError('Audio playback failed. This might be due to browser restrictions. Try clicking again or use a different reciter.');
              }
            });
          }
        }
      }, 300); // Increased timeout to ensure audio is loaded
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
          
          // Ensure we have a valid audio URL
          if (!ayah.audioUrl) {
            console.error('Missing audio URL for ayah:', ayah.numberInSurah);
            currentIndex++;
            playNextAyah();
            return;
          }
          
          audioRef.current.src = ayah.audioUrl;
          audioRef.current.volume = 1.0;
          audioRef.current.muted = false;
          
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
          
          // Load the audio first
          audioRef.current.load();
          
          // Use a timeout to ensure the audio has time to load
          setTimeout(() => {
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise.catch(err => {
                  console.error('Failed to play surah audio:', err);
                  
                  if (err.name === 'NotSupportedError') {
                    setAudioError('Your browser blocked autoplay. Please tap the play button again or try a different reciter.');
                  } else if (err.name === 'NotAllowedError') {
                    setAudioError('Audio autoplay is not allowed by your browser. Please tap the play button after page load.');
                  } else {
                    setAudioError('Audio playback failed. This might be due to browser restrictions.');
                  }
                  
                  currentIndex++;
                  playNextAyah();
                });
              }
            }
          }, 300);
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

  // Added function to toggle mute state
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return {
    isPlaying,
    currentAyahNumber,
    playAyah,
    stopAudio,
    playSurah,
    audioError,
    isMuted,
    toggleMute
  };
};
