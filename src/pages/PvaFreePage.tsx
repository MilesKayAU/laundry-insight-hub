
import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Search } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { getProductSubmissions } from "@/lib/textExtractor";

const PvaFreePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all approved products with 0% PVA (pvaStatus is 'verified-free')
  const pvaFreeProducts = getProductSubmissions().filter(
    product => product.approved && product.pvaStatus === 'verified-free'
  );

  // Filter products based on search term
  const filteredProducts = pvaFreeProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <div className="inline-block bg-green-50 rounded-full px-4 py-2 mb-4">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            0% PVA Products
          </Badge>
        </div>
        <h1 className="text-4xl font-bold mb-4">Verified PVA-Free Products</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These products have been verified to contain zero polyvinyl alcohol (PVA).
          Our verification process includes ingredient analysis and manufacturer confirmation.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for PVA-free products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col h-full">
              {product.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {product.type}
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    0% PVA
                  </Badge>
                </div>
                <CardTitle className="mt-2">{product.name}</CardTitle>
                <CardDescription>{product.brand}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {product.description && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto mb-2 text-muted-foreground">
                        Show details
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {product.videoUrl && (
                  <div className="my-2">
                    <iframe
                      width="100%"
                      height="180"
                      src={product.videoUrl}
                      title={`${product.name} video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-md"
                    ></iframe>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {product.websiteUrl && (
                  <Button variant="outline" size="sm" className="flex gap-2 items-center" asChild>
                    <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No PVA-free products found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any products matching your search criteria.
          </p>
          {searchTerm ? (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/contribute">
                Contribute a product
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PvaFreePage;
