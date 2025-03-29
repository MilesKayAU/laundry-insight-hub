import { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FileUp, FileText, CheckCircle, AlertCircle, AlertTriangle, Ban, CircleCheck } from "lucide-react";
import { 
  extractTextFromImage, 
  extractTextFromPDF, 
  findKeywordsInText, 
  PVA_KEYWORDS,
  determinePvaStatus,
  PvaStatus,
  saveProductSubmission,
  getVerifiedBrands,
  ProductSubmission
} from "@/lib/textExtractor";
import { mockAdminSettings } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const ContributePage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"Laundry Sheet" | "Laundry Pod">("Laundry Sheet");
  const [pvaPercentage, setPvaPercentage] = useState("");
  const [uploadType, setUploadType] = useState("image");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pvaStatus, setPvaStatus] = useState<PvaStatus | null>(null);
  const [verifiedBrands, setVerifiedBrands] = useState<string[]>([]);

  useEffect(() => {
    const savedVerifiedBrands = getVerifiedBrands();
    setVerifiedBrands([...savedVerifiedBrands, "EcoClean", "GreenWash", "NaturalFresh"]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (uploadType === "image" && !selectedFile.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      } else if (uploadType === "pdf" && selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type", 
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setExtractedText("");
      setFoundKeywords([]);
      setPvaStatus(null);
      
      simulateUpload(selectedFile);
    }
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleAnalyzeFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      let extractedTextData;
      
      if (uploadType === "image") {
        extractedTextData = await extractTextFromImage(file);
      } else {
        extractedTextData = await extractTextFromPDF(file);
      }
      
      setExtractedText(extractedTextData.text);
      
      const keywords = findKeywordsInText(
        extractedTextData.text, 
        PVA_KEYWORDS
      );
      
      setFoundKeywords(keywords);
      
      const status = determinePvaStatus(keywords, verifiedBrands, brand);
      setPvaStatus(status);
      
      if (keywords.length > 0) {
        toast({
          title: "Analysis complete",
          description: `Found ${keywords.length} PVA-related keywords: ${keywords.join(", ")}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Analysis complete",
          description: "No PVA-related keywords found in the document",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !productName || !productType) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "No file uploaded",
        description: "Please upload an image or PDF file",
        variant: "destructive"
      });
      return;
    }

    if (!pvaStatus) {
      toast({
        title: "Analysis required",
        description: "Please analyze the file for PVA content first",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const newSubmission: ProductSubmission = {
      id: `sub_${Date.now()}`,
      brand,
      name: productName,
      type: productType,
      pvaPercentage: pvaPercentage ? pvaPercentage : null,
      pvaStatus,
      extractedText,
      foundKeywords,
      approved: false,
      submittedAt: new Date().toISOString()
    };
    
    saveProductSubmission(newSubmission);
    
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Submission successful",
        description: "Your contribution has been received and is pending admin approval",
        variant: "default"
      });
      
      setBrand("");
      setProductName("");
      setProductType("Laundry Sheet");
      setPvaPercentage("");
      setFile(null);
      setExtractedText("");
      setFoundKeywords([]);
      setPvaStatus(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1500);
  };

  const renderPvaStatusBadge = () => {
    if (!pvaStatus) return null;
    
    switch (pvaStatus) {
      case 'contains':
        return (
          <Alert className="mt-4 border-red-300 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertTitle className="text-red-600">Contains PVA</AlertTitle>
            <AlertDescription className="text-red-600">
              This product likely contains PVA. If you know the percentage, please enter it below.
            </AlertDescription>
          </Alert>
        );
      case 'verified-free':
        return (
          <Alert className="mt-4 border-green-300 bg-green-50">
            <CircleCheck className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-600">Verified PVA-Free</AlertTitle>
            <AlertDescription className="text-green-600">
              This product has been previously verified as PVA-free by our administrators.
            </AlertDescription>
          </Alert>
        );
      case 'needs-verification':
        return (
          <Alert className="mt-4 border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="text-yellow-600">Requires Verification</AlertTitle>
            <AlertDescription className="text-yellow-600">
              No PVA keywords found, but this brand requires admin verification before being marked as PVA-free.
            </AlertDescription>
          </Alert>
        );
      case 'inconclusive':
        return (
          <Alert className="mt-4 border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="text-yellow-600">Inconclusive / Not enough info</AlertTitle>
            <AlertDescription className="text-yellow-600">
              Unable to determine if this product contains PVA. Additional information is needed.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Contribute to Our Database</h1>
          <p className="text-muted-foreground mt-2">
            Help build a comprehensive database of laundry product ingredients
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Upload an image of a product label or a PDF of an SDS report and provide product details
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand Name*</Label>
                      <Input 
                        id="brand" 
                        placeholder="e.g. EcoClean" 
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product Name*</Label>
                      <Input 
                        id="product-name" 
                        placeholder="e.g. Fresh Sheets" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-type">Product Type*</Label>
                      <Select 
                        value={productType} 
                        onValueChange={(value) => setProductType(value as "Laundry Sheet" | "Laundry Pod")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laundry Sheet">Laundry Sheet</SelectItem>
                          <SelectItem value="Laundry Pod">Laundry Pod</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pva-percentage">PVA Percentage (if known)</Label>
                      <Input 
                        id="pva-percentage" 
                        type="number"
                        placeholder="e.g. 45" 
                        value={pvaPercentage}
                        onChange={(e) => setPvaPercentage(e.target.value)}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Tabs defaultValue="image" onValueChange={(value) => setUploadType(value)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="image">Upload Image</TabsTrigger>
                      <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="image" className="mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium mb-1">
                              {file ? file.name : "Click to upload product image"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG, or GIF up to 5MB
                            </p>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </div>
                          
                          {isUploading && (
                            <div className="mt-4">
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="pdf" className="mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium mb-1">
                              {file ? file.name : "Click to upload SDS document"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF files up to 10MB
                            </p>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="application/pdf" 
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </div>
                          
                          {isUploading && (
                            <div className="mt-4">
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  
                  {file && (
                    <div className="mt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAnalyzeFile} 
                        disabled={isAnalyzing || !file}
                        className="w-full"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze for PVA Content"}
                      </Button>
                    </div>
                  )}
                </div>
                
                {renderPvaStatusBadge()}
                
                {extractedText && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-medium mb-2 flex items-center">
                      Analysis Results
                      {foundKeywords.length > 0 ? (
                        <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="ml-2 h-4 w-4 text-yellow-500" />
                      )}
                    </h3>
                    
                    <div className="text-sm">
                      {foundKeywords.length > 0 ? (
                        <div>
                          <p className="text-red-600 mb-2">
                            Found {foundKeywords.length} PVA-related keywords:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {foundKeywords.map((keyword, index) => (
                              <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-yellow-600 mb-2">
                          No PVA-related keywords found in the document.
                        </p>
                      )}
                      
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Extracted text preview:</p>
                        <div className="max-h-20 overflow-y-auto bg-muted p-2 rounded text-xs">
                          {extractedText.substring(0, 300)}
                          {extractedText.length > 300 && "..."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Contribution"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start px-6 py-4 bg-muted/20 text-xs text-muted-foreground">
            <p>
              Your contribution will be reviewed by administrators before being added to the database.
            </p>
            <p className="mt-1">
              Fields marked with * are required.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ContributePage;
