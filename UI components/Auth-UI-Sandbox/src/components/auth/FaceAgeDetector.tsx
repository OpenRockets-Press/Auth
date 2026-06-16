import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import faceInstructionGif from '../../assets/face-instruction.gif';

interface FaceAgeDetectorProps {
  onComplete: (averageAge: number, isAdult: boolean) => void;
  title?: string;
  subtitle?: string;
}

export const FaceAgeDetector: React.FC<FaceAgeDetectorProps> = ({ 
  onComplete, 
  title = "Age Verification",
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

  if (cameraError) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <h3 className="ms-title" style={{ marginBottom: '16px' }}>{title}</h3>
        <p style={{ color: '#E81123', marginBottom: '24px' }}>{cameraError}</p>
        <button className="ms-button ms-button-secondary" onClick={startVideo}>Clear and retry this step</button>
      </div>
    );
  }

  if (!modelsLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div className="ms-loader-overlay">
          <div className="ms-loader-container">
            <div className="anim-dot dot1"></div><div className="anim-dot dot2"></div><div className="anim-dot dot3"></div><div className="anim-dot dot4"></div><div className="anim-dot dot5"></div>
          </div>
        </div>
        <p className="ms-description" style={{ marginTop: '16px' }}>Loading AI Models...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      
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
          Please turn: {captures[currentCaptureIndex]?.label}
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
          {isProcessing ? 'Analyzing...' : `Take ${captures[currentCaptureIndex]?.label} Photo`}
        </button>
      </div>
    </div>
  );
};
