
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ExternalLink, Mail, Globe } from "lucide-react";
import { getSafeExternalLinkProps } from "@/lib/utils";

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
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
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
        
        {website && (
          <div className="mt-2 flex items-center">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <a 
              {...getSafeExternalLinkProps({ url: website })}
              className="text-blue-600 hover:underline"
            >
              {website}
            </a>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-2 md:mt-0">
        {website && (
          <Button variant="outline" asChild size="sm">
            <a 
              {...getSafeExternalLinkProps({ url: website })}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
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
