
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ExternalLink, Mail } from "lucide-react";

interface BrandHeaderProps {
  name: string;
  verified: boolean;
  description: string | null;
  website: string | null;
  onContactClick: () => void;
}

const BrandHeader = ({
  name,
  verified,
  description,
  website,
  onContactClick
}: BrandHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{name}</h1>
          {verified && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <BadgeCheck className="h-4 w-4 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          {description || `View product information for ${name}`}
        </p>
      </div>
      
      <div className="flex gap-2">
        {website && (
          <Button variant="outline" asChild size="sm">
            <a 
              href={website} 
              target="_blank" 
              rel="nofollow noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Website
            </a>
          </Button>
        )}
        
        <Button 
          onClick={onContactClick}
          size="sm"
        >
          <Mail className="h-4 w-4 mr-2" />
          Contact Brand
        </Button>
      </div>
    </div>
  );
};

export default BrandHeader;
