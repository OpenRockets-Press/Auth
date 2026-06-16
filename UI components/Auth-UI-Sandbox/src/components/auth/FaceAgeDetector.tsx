import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import faceInstructionGif from '../../assets/face-instruction.gif';

interface FaceAgeDetectorProps {
  onComplete: (averageAge: number, isAdult: boolean) => void;
  title?: string;
  subtitle?: React.ReactNode;
}

export const FaceAgeDetector: React.FC<FaceAgeDetectorProps> = ({ 
  onComplete, 
  title = "Identity Verification",
  subtitle = "Please position your face as shown in the animation"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [captures, setCaptures] = useState<{ label: string; age: number | null }[]>([
    { label: 'Front Face', age: null },
    { label: 'Left Side', age: null },
    { label: 'Right Side', age: null }
  ]);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setCaptures(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.ageGenderNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (e) {
        console.error("Error loading face-api models", e);
        setCameraError("Failed to load AI models. Please refresh.");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  const startVideo = () => {
    setCameraError('');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera error:", err);
        setCameraError("Camera access denied or unavailable.");
      });
  };

  const captureAndDetect = async () => {
    if (!videoRef.current) return;
    
    setIsProcessing(true);
    setCameraError('');

    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withAgeAndGender();

      if (!detection) {
        setCameraError("No face detected. Please make sure your face is clearly visible.");
        setIsProcessing(false);
        return;
      }

      const estimatedAge = detection.age;
      
      const updatedCaptures = [...captures];
      updatedCaptures[currentCaptureIndex].age = estimatedAge;
      setCaptures(updatedCaptures);

      if (currentCaptureIndex < 2) {
        setCurrentCaptureIndex(prev => prev + 1);
      } else {
        // All 3 done
        const totalAge = updatedCaptures.reduce((sum, cap) => sum + (cap.age || 0), 0);
        const averageAge = totalAge / 3;
        const isAdult = averageAge >= 18;
        
        // Stop camera
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }

        onComplete(averageAge, isAdult);
      }
    } catch (e) {
      console.error(e);
      setCameraError("Error processing image.");
    }

    setIsProcessing(false);
  };

  const [loadingText, setLoadingText] = useState('This feature uses AI...');
  
  useEffect(() => {
    if (modelsLoaded) return;
    const timer = setInterval(() => {
      setLoadingText(prev => 
        prev === 'This feature uses AI...' ? 'Processing, please wait...' : 'This feature uses AI...'
      );
    }, 2000);
    return () => clearInterval(timer);
  }, [modelsLoaded]);

  if (cameraError) {
    return (
      <div style={{ textAlign: 'left', padding: '24px 0' }}>
        <h3 className="ms-title" style={{ marginBottom: '16px' }}>{title}</h3>
        <p style={{ color: '#E81123', marginBottom: '24px' }}>{cameraError}</p>
        <button className="ms-button ms-button-secondary" onClick={startVideo}>Clear and retry this step</button>
      </div>
    );
  }

  if (!modelsLoaded) {
    return (
      <div style={{ textAlign: 'left', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <style>{`
          .local-ai-loader {
            position: absolute;
            top: -68px;
            left: -44px;
            right: -44px;
            height: 4px;
            background-color: transparent;
            z-index: 10;
          }
          @media (max-width: 480px) {
            .local-ai-loader {
              top: -32px;
              left: -24px;
              right: -24px;
            }
          }
        `}</style>
        <div className="local-ai-loader">
          <div className="ms-loader-container">
            <div className="anim-dot dot1"></div><div className="anim-dot dot2"></div><div className="anim-dot dot3"></div><div className="anim-dot dot4"></div><div className="anim-dot dot5"></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.5s ease' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
          </svg>
          <p className="ms-description" style={{ fontSize: '16px', fontWeight: 600, margin: 0, transition: 'opacity 0.3s ease' }}>
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  const getNaturalInstruction = (index: number, label: string) => {
    if (!label) return '';
    const lowerLabel = label.toLowerCase();
    if (index === 0) return `Okay, first turn the ${lowerLabel}`;
    if (index === 1) return `Then, let's get the ${lowerLabel}`;
    return `Finally, let's get the ${lowerLabel}`;
  };

  const getNaturalButtonText = (label: string) => {
    if (!label) return 'Take Photo';
    const lowerLabel = label.toLowerCase();
    return `Take ${lowerLabel} photo`;
  };

  return (
    <div style={{ textAlign: 'left', animation: 'fadeIn 0.8s ease' }}>
      
      {isProcessing && (
        <div className="ms-loader-overlay">
          <div className="ms-loader-container">
            <div className="anim-dot dot1"></div><div className="anim-dot dot2"></div><div className="anim-dot dot3"></div><div className="anim-dot dot4"></div><div className="anim-dot dot5"></div>
          </div>
        </div>
      )}

      <h3 className="ms-title" style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h3>
      <p className="ms-description" style={{ marginBottom: '16px' }}>{subtitle}</p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', background: '#000', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--ms-border)' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} 
        />
        
        {/* Instruction Overlay on Video */}
        <div style={{
          position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 16px', borderRadius: '24px',
          fontWeight: 'bold', zIndex: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: '14px'
        }}>
          {getNaturalInstruction(currentCaptureIndex, captures[currentCaptureIndex]?.label)}
        </div>

        {/* GIF Overlay */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          pointerEvents: 'none', zIndex: 2 
        }}>
          <img 
            src={faceInstructionGif} 
            alt="Face alignment instruction" 
            style={{ 
              height: '50%', opacity: 0.5, 
              transform: captures[currentCaptureIndex]?.label === 'Front Face' ? 'scale(1.2)' : captures[currentCaptureIndex]?.label === 'Left Side' ? 'scale(1.0)' : 'scale(1.0) rotateY(180deg)',
              transition: 'transform 0.5s ease'
            }} 
          />
        </div>
        
        {isProcessing && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>Processing...</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '8px' }}>
          {captures.map((cap, idx) => (
            <div key={idx} style={{ 
              flex: 1, 
              padding: '8px', 
              background: cap.age ? '#dff6dd' : (idx === currentCaptureIndex ? 'rgba(0, 103, 184, 0.1)' : 'rgba(0,0,0,0.02)'),
              border: idx === currentCaptureIndex ? '2px solid var(--theme-primary)' : '1px solid var(--ms-border)',
              borderRadius: '4px',
              fontSize: '13px',
              color: 'var(--ms-text)'
            }}>
              <div>{cap.label}</div>
              {cap.age && <div style={{ color: '#107c10', fontWeight: 'bold', marginTop: '4px' }}>✓ Done</div>}
            </div>
          ))}
        </div>

        <button 
          className="ms-button ms-button-primary" 
          onClick={captureAndDetect}
          disabled={isProcessing}
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          {isProcessing ? 'Analyzing...' : getNaturalButtonText(captures[currentCaptureIndex]?.label)}
        </button>
      </div>
    </div>
  );
};

export default FaceAgeDetector;
