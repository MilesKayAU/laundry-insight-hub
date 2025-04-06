
import React, { useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  className?: string;
}

const Recaptcha: React.FC<RecaptchaProps> = ({ onChange, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Ensure recaptcha is visible after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className={`recaptcha-wrapper ${className || ''}`}>
      {isVisible && (
        <>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // This is Google's test key - replace with your actual site key in production
            onChange={onChange}
            size="normal"
            className="recaptcha-container" // Adding a class for better styling/debugging
          />
          <p className="text-xs text-muted-foreground mt-1">
            This site is protected by reCAPTCHA to prevent spam submissions.
          </p>
        </>
      )}
    </div>
  );
};

export default Recaptcha;
