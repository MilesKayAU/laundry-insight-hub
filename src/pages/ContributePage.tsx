
import { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Upload, Image, FileText, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractText } from "@/lib/textExtractor";

// PVA-related keywords to search for in extracted text
const PVA_KEYWORDS = [
  "polyvinyl alcohol",
  "pva",
  "pvoh",
  "vinyl alcohol polymer",
  "ethenol homopolymer",
];

const DEFAULT_PVA_STATUS = "Unknown";

const ContributePage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdsFileInputRef = useRef<HTMLInputElement>(null);
  
  const [productImage, setProductImage] = useState<File | null>(null);
  const [sdsFile, setSdsFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [pvaStatus, setPvaStatus] = useState<string>(DEFAULT_PVA_STATUS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSDSProcessing, setIsSDSProcessing] = useState<boolean>(false);
  
  // Form fields
  const [brand, setBrand] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [pvaPercentage, setPvaPercentage] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Check if form is valid
  const isFormValid = brand && productName && productType && productImage;

  // Function to handle product image upload
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setProductImage(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Process the image for text extraction
    setIsProcessing(true);
    try {
      const text = await extractText(file);
      setExtractedText(text);
      
      // Search for PVA keywords in the extracted text
      const found = PVA_KEYWORDS.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      setFoundKeywords(found);
      
      if (found.length > 0) {
        setPvaStatus("Contains PVA");
        toast({
          title: "PVA Detected",
          description: "We found possible PVA-related ingredients in this product.",
          variant: "destructive",
        });
      } else {
        setPvaStatus("No PVA Detected");
        toast({
          title: "No PVA Detected",
          description: "No PVA-related ingredients were detected in the image.",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error processing image",
        description: "We couldn't extract text from this image. Please try a clearer image or enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle SDS file upload
  const handleSDSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes("pdf") && !file.type.includes("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      });
      return;
    }

    setSdsFile(file);
    
    // If it's an image, process it for text extraction
    if (file.type.includes("image/")) {
      setIsSDSProcessing(true);
      try {
        const text = await extractText(file);
        
        // Append to existing extracted text
        setExtractedText(prevText => prevText ? `${prevText}\n\n--- From SDS ---\n${text}` : text);
        
        // Search for PVA keywords in the extracted text
        const found = PVA_KEYWORDS.filter(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Add any new keywords found
        setFoundKeywords(prevKeywords => {
          const newKeywords = found.filter(keyword => !prevKeywords.includes(keyword));
          return [...prevKeywords, ...newKeywords];
        });
        
        if (found.length > 0) {
          setPvaStatus("Contains PVA");
          toast({
            title: "PVA Detected in SDS",
            description: "We found possible PVA-related ingredients in the SDS document.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error processing SDS image:", error);
        toast({
          title: "Error processing SDS image",
          description: "We couldn't extract text from this SDS image. Please try a clearer image.",
          variant: "destructive",
        });
      } finally {
        setIsSDSProcessing(false);
      }
    } else {
      // For PDFs, we just store the file - actual processing would need backend integration
      toast({
        title: "SDS Uploaded",
        description: "Your SDS file has been uploaded.",
      });
    }
  };

  // Function to handle form submission
  const handleSubmit = () => {
    if (!isFormValid) {
      toast({
        title: "Please fill out all required fields",
        description: "Brand, product name, product type, and product image are required.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send this data to your backend
    // For this prototype, we'll just show a success message
    
    // Log the submission data for debugging
    const submissionData = {
      brand,
      name: productName,
      type: productType,
      pvaPercentage: pvaPercentage ? parseFloat(pvaPercentage) : null,
      pvaStatus,
      extractedText,
      foundKeywords,
      hasSDSFile: !!sdsFile,
      additionalNotes
    };
    
    console.log("Submission data:", submissionData);
    
    toast({
      title: "Submission Successful",
      description: "Thank you for your contribution to the PVA-Free database.",
    });
    
    // Reset form
    setBrand("");
    setProductName("");
    setProductType("");
    setPvaPercentage("");
    setAdditionalNotes("");
    setProductImage(null);
    setSdsFile(null);
    setImagePreview(null);
    setExtractedText("");
    setFoundKeywords([]);
    setPvaStatus(DEFAULT_PVA_STATUS);
  };

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3 text-science-800">Contribute to Our Database</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us build a comprehensive database of laundry products by sharing ingredient 
            information. Your contributions help others make informed choices.
          </p>
        </div>
        
        <Card className="science-card">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Fill out the details about the laundry product you want to add to our database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="brand" 
                  placeholder="e.g., Tide" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="productName" 
                  placeholder="e.g., Free & Clear Laundry Sheets" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type <span className="text-destructive">*</span></Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger id="productType">
                  <SelectValue placeholder="Select Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laundry_sheets">Laundry Sheets</SelectItem>
                  <SelectItem value="laundry_pods">Laundry Pods/Pacs</SelectItem>
                  <SelectItem value="liquid_detergent">Liquid Detergent</SelectItem>
                  <SelectItem value="powder_detergent">Powder Detergent</SelectItem>
                  <SelectItem value="dryer_sheets">Dryer Sheets</SelectItem>
                  <SelectItem value="fabric_softener">Fabric Softener</SelectItem>
                  <SelectItem value="stain_remover">Stain Remover</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pvaPercentage">PVA Percentage (if known)</Label>
              <Input 
                id="pvaPercentage" 
                type="number" 
                min="0" 
                max="100" 
                placeholder="e.g., 15"
                value={pvaPercentage}
                onChange={(e) => setPvaPercentage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea 
                id="additionalNotes" 
                placeholder="Add any other relevant information about the product..." 
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="h-24"
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Product Image <span className="text-destructive">*</span></Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-science-50 transition-colors border-science-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img 
                          src={imagePreview} 
                          alt="Product Preview" 
                          className="max-h-40 mx-auto rounded-md"
                        />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 text-science-500 mx-auto" />
                        <p className="text-sm font-medium text-science-700">Upload Product Image</p>
                        <p className="text-xs text-gray-500">
                          Upload a clear image of the product packaging showing ingredients.
                        </p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleProductImageUpload} 
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Safety Data Sheet (Optional)</Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-science-50 transition-colors border-science-200"
                    onClick={() => sdsFileInputRef.current?.click()}
                  >
                    {sdsFile ? (
                      <div className="space-y-2">
                        <FileText className="h-10 w-10 text-science-500 mx-auto" />
                        <p className="text-sm font-medium text-science-700">{sdsFile.name}</p>
                        <p className="text-xs text-gray-500">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="h-10 w-10 text-science-500 mx-auto" />
                        <p className="text-sm font-medium text-science-700">Upload SDS Document</p>
                        <p className="text-xs text-gray-500">
                          Optionally upload a Safety Data Sheet if available.
                        </p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={sdsFileInputRef} 
                    onChange={handleSDSUpload} 
                    accept="application/pdf,image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-science-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Image className="h-5 w-5 text-science-600 mr-2" />
                    <Label className="font-medium">Text Extraction Status</Label>
                  </div>
                  
                  {isProcessing || isSDSProcessing ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 text-science-500 animate-spin" />
                      <span className="ml-2 text-sm text-science-700">
                        Processing {isSDSProcessing ? "SDS" : "product image"}...
                      </span>
                    </div>
                  ) : extractedText ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Label className="text-sm">PVA Status:</Label>
                        <div className="ml-2">
                          {pvaStatus === "Contains PVA" ? (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                              <span className="text-sm font-medium text-destructive">Contains PVA</span>
                            </div>
                          ) : pvaStatus === "No PVA Detected" ? (
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-science-600 mr-1" />
                              <span className="text-sm font-medium text-science-600">No PVA Detected</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unknown</span>
                          )}
                        </div>
                      </div>
                      
                      {foundKeywords.length > 0 && (
                        <div>
                          <Label className="text-sm block mb-1">Detected PVA keywords:</Label>
                          <div className="text-xs bg-gray-100 p-2 rounded">
                            {foundKeywords.join(", ")}
                          </div>
                        </div>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Extracted Text
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Extracted Text</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="mt-2 bg-gray-100 p-3 rounded max-h-80 overflow-y-auto text-xs font-mono">
                                {extractedText || "No text extracted"}
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      Upload a product image to automatically extract ingredient information.
                    </p>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-science-600" />
                    <span>Important Notes</span>
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ensure the ingredients list is clearly visible in the image</li>
                    <li>• Higher resolution images yield better text extraction results</li>
                    <li>• All submissions are reviewed by our team before being added to the database</li>
                    <li>• Personal information is not stored with your submission</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
            <Button 
              className="bg-science-600 hover:bg-science-700"
              onClick={handleSubmit}
              disabled={!isFormValid || isProcessing || isSDSProcessing}
            >
              Submit Contribution
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ContributePage;
