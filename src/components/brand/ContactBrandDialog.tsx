import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BrandProfile {
  id: string;
  name: string;
  website: string | null;
  contact_email: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandProfile: BrandProfile | null;
}

const ContactBrandDialog = ({ 
  open, 
  onOpenChange, 
  brandProfile 
}: ContactBrandDialogProps) => {
  const { toast } = useToast();
  
  const [contactForm, setContactForm] = useState({
    email: "",
    company: "",
    message: ""
  });
  
  const handleContactSubmit = async () => {
    if (!brandProfile?.id) {
      toast({
        title: "Cannot send message",
        description: "This brand hasn't been verified in our system yet.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contactForm.email || !contactForm.email.includes('@') || !contactForm.company || !contactForm.message) {
      toast({
        title: "Invalid form",
        description: "Please fill in all fields with valid information.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if email domain matches brand domain
    const emailDomain = contactForm.email.split('@')[1];
    let brandDomainMatch = false;
    
    if (brandProfile.website) {
      const brandDomain = brandProfile.website.replace('http://', '').replace('https://', '').split('/')[0];
      brandDomainMatch = emailDomain.includes(brandDomain) || brandDomain.includes(emailDomain);
    }
    
    try {
      const { data, error } = await supabase
        .from('brand_messages')
        .insert({
          brand_id: brandProfile.id,
          sender_email: contactForm.email,
          company_name: contactForm.company,
          message: contactForm.message
        });
      
      if (error) throw error;
      
      toast({
        title: "Message sent",
        description: brandDomainMatch 
          ? "Your message has been sent and will be reviewed by our team."
          : "Your message has been sent but may require extra verification as your email domain doesn't match the brand domain.",
      });
      
      onOpenChange(false);
      setContactForm({
        email: "",
        company: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending brand message:', error);
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact {brandProfile?.name}</DialogTitle>
          <DialogDescription>
            As a brand representative, you can send a message to our administrators.
            Please use your company email that matches your brand's domain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-email" className="text-right">
              Company Email
            </Label>
            <Input
              id="company-email"
              type="email"
              placeholder="your@company.com"
              className="col-span-3"
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-name" className="text-right">
              Company Name
            </Label>
            <Input
              id="company-name"
              placeholder="Your Company Ltd."
              className="col-span-3"
              value={contactForm.company}
              onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="message" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your relationship to this brand and any information you'd like to provide or update..."
              className="col-span-3"
              rows={5}
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
            />
          </div>
          
          <div className="col-span-4 text-sm text-muted-foreground text-center">
            <p>Using an email that matches your brand's domain will help us verify your identity faster.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContactSubmit}>
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactBrandDialog;
