import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceAgeDetectorProps {
  onComplete: (averageAge: number, isAdult: boolean) => void;
  title?: string;
  subtitle?: string;
}

export const FaceAgeDetector: React.FC<FaceAgeDetectorProps> = ({ 
  onComplete, 
  title = "Age Verification",
  subtitle = "Please follow the instructions on screen"
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
        <h3 className="ms-title">{title}</h3>
        <p style={{ color: '#E81123', marginTop: '16px' }}>{cameraError}</p>
        <button className="ms-button" onClick={startVideo} style={{ marginTop: '16px' }}>Retry Camera</button>
      </div>
    );
  }

  if (!modelsLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div className="ms-loader-overlay" style={{ position: 'relative', background: 'transparent' }}>
          <div className="ms-loading-dots">
            <div className="ms-dot"></div><div className="ms-dot"></div><div className="ms-dot"></div>
          </div>
        </div>
        <p style={{ marginTop: '16px', fontSize: '15px' }}>Loading AI Models...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h3 className="ms-title" style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h3>
      <p className="ms-subtitle" style={{ marginBottom: '16px' }}>{subtitle}</p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} 
        />
        
        {isProcessing && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>Processing...</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '16px' }}>
          Current Task: Capture {captures[currentCaptureIndex].label}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '8px' }}>
          {captures.map((cap, idx) => (
            <div key={idx} style={{ 
              flex: 1, 
              padding: '8px', 
              background: cap.age ? '#dff6dd' : (idx === currentCaptureIndex ? '#deecf9' : '#f3f2f1'),
              border: idx === currentCaptureIndex ? '2px solid #0078d4' : '1px solid transparent',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div>{cap.label}</div>
              {cap.age && <div style={{ color: '#107c10', fontWeight: 'bold' }}>✓ Done</div>}
            </div>
          ))}
        </div>

        <button 
          className="ms-button ms-button-primary" 
          onClick={captureAndDetect}
          disabled={isProcessing}
          style={{ width: '100%', padding: '12px' }}
        >
          {isProcessing ? 'Analyzing...' : `Take ${captures[currentCaptureIndex].label} Photo`}
        </button>
      </div>
    </div>
  );
};
