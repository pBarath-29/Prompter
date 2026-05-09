import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

// Polyfill for browsers that use webkitSpeechRecognition
// FIX: Cast window to `any` to access non-standard properties and rename variable to avoid shadowing the `SpeechRecognition` type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
}

interface UseSpeechRecognitionOptions {
    // FIX: Correctly type `onResult` to accept a React state setter function.
    onResult?: Dispatch<SetStateAction<string>>;
}

const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // FIX: Using `any` for the ref type because the instance can be from a non-standard API.
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.error("Browser doesn't support SpeechRecognition.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
      if (options.onResult && finalTranscript) {
          // FIX: This call is now correctly typed after updating `UseSpeechRecognitionOptions`.
          options.onResult(prev => prev + finalTranscript);
      }
    };
    
    recognition.onend = () => {
        if (recognitionRef.current) { // only reset if we are still intending to listen
             setIsListening(false);
        }
    };

    recognitionRef.current = recognition;
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognitionAPI,
  };
};

export default useSpeechRecognition;
