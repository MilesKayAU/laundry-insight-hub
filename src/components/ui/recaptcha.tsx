
import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  className?: string;
}

const Recaptcha: React.FC<RecaptchaProps> = ({ onChange, className }) => {
  return (
    <div className={className}>
      <ReCAPTCHA
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key in production
        onChange={onChange}
        size="normal"
      />
      <p className="text-xs text-muted-foreground mt-1">
        This site is protected by reCAPTCHA to prevent spam submissions.
      </p>
    </div>
  );
};

export default Recaptcha;
