import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { voiceService } from '../services/api';

export const useVoice = (language: string = 'en-IN') => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Chrome loads Google voices asynchronously. This event ensures they are available
    const loadVoices = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    };
    
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Stop recording and send audio to Groq Whisper API
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Start recording using MediaRecorder (Universal browser support)
  const startListening = useCallback(async () => {
    // If already listening, stop recording to finalize and transcribe
    if (isListening) {
      stopListening();
      return;
    }

    // Cancel any ongoing TTS before listening
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to Web Speech API if getUserMedia is unavailable
      fallbackSpeechRecognition();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported mimeType
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Tap again when finished speaking");
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        // Stop microphone hardware stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 1000) {
          // Empty or too short audio (< 1KB)
          return;
        }

        setIsTranscribing(true);
        const transToast = toast.loading("Transcribing with Groq Whisper AI...");

        try {
          // Extract language code prefix ('hi', 'or', 'en')
          const langCode = language.split('-')[0] || 'en';
          const text = await voiceService.transcribeAudio(audioBlob, langCode);

          toast.dismiss(transToast);
          if (text && text.trim()) {
            setTranscript(text);
            toast.success("Voice recognized!");
          } else {
            toast.info("No speech detected. Please try speaking again.");
          }
        } catch (error: any) {
          toast.dismiss(transToast);
          console.error("Groq Whisper error, falling back to Web Speech:", error);
          toast.error("Cloud STT issue. Falling back to browser speech...");
          fallbackSpeechRecognition();
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250); // Slice in 250ms chunks
    } catch (err: any) {
      console.error("Microphone access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error("Microphone permission denied. Please allow microphone in browser settings.");
      } else {
        fallbackSpeechRecognition();
      }
    }
  }, [isListening, language, stopListening]);

  // Fallback to browser SpeechRecognition if MediaRecorder/Cloud is blocked
  const fallbackSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening (Browser mode)...");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      toast.success("Voice received!");
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast.error(`Voice error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  }, [language]);

  // Text-To-Speech (TTS)
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      toast.error("Your browser doesn't support speech synthesis.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 

    // Find best regional voice
    const voices = window.speechSynthesis.getVoices();
    const preferredKeywords = [
      "Google Telugu",
      "Google Hindi",
      "Google English (India)",
      "Telugu",
      "Neural",
      "Heera",
      "Kalpana",
      "Natural",
      "synthesis.voice.hi-IN",
      "synthesis.voice.te-IN"
    ];

    let selectedVoice = null;
    for (const keyword of preferredKeywords) {
      selectedVoice = voices.find(v => v.name.includes(keyword) || v.name.toLowerCase().includes(keyword.toLowerCase()));
      if (selectedVoice) break;
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('te') || v.lang.startsWith('hi') || v.lang.startsWith('en-IN') || v.lang.startsWith('or'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { isListening, isTranscribing, transcript, setTranscript, startListening, stopListening, speak, stopSpeaking };
};
