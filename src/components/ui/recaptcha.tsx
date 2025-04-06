
import React, { useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  className?: string;
}

const Recaptcha: React.FC<RecaptchaProps> = ({ onChange, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Short delay to ensure DOM is fully rendered before showing recaptcha
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // For debugging
  useEffect(() => {
    console.log("Recaptcha component mounted, isLoaded:", isLoaded);
  }, [isLoaded]);

  return (
    <div className={`recaptcha-wrapper ${className || ''}`}>
      {isLoaded && (
        <>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // This is Google's test key - replace with your actual site key in production
            onChange={(token) => {
              console.log("reCAPTCHA token received:", token ? "valid" : "null");
              onChange(token);
            }}
            size="normal"
            className="recaptcha-container"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This site is protected by reCAPTCHA to prevent spam submissions.
          </p>
        </>
      )}
      {!isLoaded && (
        <div className="h-[78px] w-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading verification...</p>
        </div>
      )}
    </div>
  );
};

export default Recaptcha;
