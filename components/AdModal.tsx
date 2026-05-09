import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose }) => {
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Animation states
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // FIX: Replaced `NodeJS.Timeout` with `ReturnType<typeof setInterval>` to correctly type the timer ID in a browser environment and resolve the "Cannot find namespace 'NodeJS'" error.
    let countdownTimer: ReturnType<typeof setInterval>;
    if (isOpen) {
      setIsRendered(true);
      const animationTimer = setTimeout(() => setIsShowing(true), 20);

      setCanClose(false);
      setCountdown(5);
      
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start video playback
      videoRef.current?.play().catch(error => {
        console.log("Video autoplay was prevented:", error);
      });

      return () => {
        clearTimeout(animationTimer);
        clearInterval(countdownTimer);
      };
    } else {
        setIsShowing(false);
        const animationTimer = setTimeout(() => setIsRendered(false), 300);
        return () => clearTimeout(animationTimer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleClose = () => {
    videoRef.current?.pause();
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isShowing ? 'bg-opacity-80' : 'bg-opacity-0 pointer-events-none'}`} aria-modal="true" role="dialog">
        <div className={`bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl transform transition-all duration-300 ease-out relative aspect-video flex flex-col items-center justify-center ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            
            <div className="absolute top-2 right-2 z-20">
              {canClose ? (
                <button 
                    onClick={handleClose} 
                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Close ad"
                >
                    <X size={24} />
                </button>
              ) : (
                <span className="px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                  You can skip in {countdown}...
                </span>
              )}
            </div>

            <video 
              ref={videoRef}
              src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
              className="w-full h-full object-contain rounded-lg"
              muted
              playsInline
              loop
            >
              Your browser does not support the video tag.
            </video>
            
            <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded text-xs">
              Advertisement
            </div>
        </div>
    </div>
  );
};

export default AdModal;