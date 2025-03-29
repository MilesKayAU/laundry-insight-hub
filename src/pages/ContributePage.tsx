
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
import { Upload, Image, FileText, Check, X, AlertCircle, Loader2, UserRound, LogIn, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromImage, analyzePastedIngredients } from "@/lib/textExtractor";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/AuthDialog";
import MediaUploader from "@/components/MediaUploader";
import CommentsSection from "@/components/CommentsSection";

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
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdsFileInputRef = useRef<HTMLInputElement>(null);
  
  const [productImage, setProductImage] = useState<File | null>(null);
  const [sdsFile, setSdsFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [pvaStatus, setPvaStatus] = useState<string>("Unknown");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSDSProcessing, setIsSDSProcessing] = useState<boolean>(false);
  const [isIngredientsProcessing, setIsIngredientsProcessing] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  
  const [brand, setBrand] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [pvaPercentage, setPvaPercentage] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredientsText, setIngredientsText] = useState<string>("");
  const [ingredientsAnalysisConfidence, setIngredientsAnalysisConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
  const isFormValid = brand && productName && productType && (productImage || ingredientsText);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    
    setIsProcessing(true);
    try {
      const extracted = await extractTextFromImage(file);
      setExtractedText(extracted.text);
      
      const found = PVA_KEYWORDS.filter(keyword => 
        extracted.text.toLowerCase().includes(keyword.toLowerCase())
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

  const handleSDSUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.type.includes("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      });
      return;
    }

    setSdsFile(file);
    
    if (file.type.includes("image/")) {
      setIsSDSProcessing(true);
      try {
        const extracted = await extractTextFromImage(file);
        
        setExtractedText(prevText => prevText ? `${prevText}\n\n--- From SDS ---\n${extracted.text}` : extracted.text);
        
        const found = PVA_KEYWORDS.filter(keyword => 
          extracted.text.toLowerCase().includes(keyword.toLowerCase())
        );
        
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
      toast({
        title: "SDS Uploaded",
        description: "Your SDS file has been uploaded.",
      });
    }
  };

  // New function to analyze pasted ingredients
  const handleAnalyzeIngredients = async () => {
    if (!ingredientsText.trim()) {
      toast({
        title: "No ingredients provided",
        description: "Please enter ingredient text to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsIngredientsProcessing(true);
    
    try {
      const analysis = analyzePastedIngredients(ingredientsText);
      
      setIngredientsAnalysisConfidence(analysis.confidence);
      
      if (analysis.pvaStatus === 'contains') {
        setPvaStatus("Contains PVA");
        setFoundKeywords(analysis.detectedTerms);
        
        toast({
          title: "PVA Detected in Ingredients",
          description: `We found ${analysis.detectedTerms.length} PVA-related term(s) in the ingredients list.`,
          variant: "destructive",
        });
      } else if (analysis.pvaStatus === 'verified-free') {
        setPvaStatus("No PVA Detected");
        setFoundKeywords([]);
        
        toast({
          title: "PVA-Free Verified",
          description: "The ingredients explicitly state this product is PVA-free.",
        });
      } else {
        setPvaStatus("Unknown");
        setFoundKeywords([]);
        
        toast({
          title: "No PVA Detected",
          description: "We couldn't detect any PVA-related ingredients, but further verification is recommended.",
        });
      }
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      toast({
        title: "Error analyzing ingredients",
        description: "We couldn't analyze the ingredients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsIngredientsProcessing(false);
    }
  };

  const handleMediaFilesChange = (files: File[]) => {
    setMediaFiles(files);
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      toast({
        title: "Please fill out all required fields",
        description: "Brand, product name, product type, and either product image or ingredients are required.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      brand,
      name: productName,
      type: productType,
      pvaPercentage: pvaPercentage ? parseFloat(pvaPercentage) : null,
      pvaStatus,
      extractedText,
      ingredients: ingredientsText,
      foundKeywords,
      hasSDSFile: !!sdsFile,
      additionalNotes,
      userId: user?.id || null,
      userName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || null,
      mediaFiles: mediaFiles.map(f => f.name),
      approved: false,
      id: `submission_${Date.now()}`,
      dateSubmitted: new Date().toISOString(),
    };
    
    console.log("Submission data:", submissionData);
    
    const existingSubmissions = localStorage.getItem('product_submissions');
    const submissions = existingSubmissions ? JSON.parse(existingSubmissions) : [];
    submissions.push(submissionData);
    localStorage.setItem('product_submissions', JSON.stringify(submissions));
    
    toast({
      title: "Submission Successful",
      description: "Thank you for your contribution. Your submission is now pending approval.",
    });
    
    setSubmissionSuccess(true);
    
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
    setPvaStatus("Unknown");
    setMediaFiles([]);
    setIngredientsText("");
    setIngredientsAnalysisConfidence(null);
  };

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
          
          {!isAuthenticated && (
            <div className="mt-6 inline-flex items-center rounded-lg bg-science-50 px-5 py-3 shadow-sm border border-science-100">
              <UserRound className="h-5 w-5 text-science-500 mr-2" />
              <span className="text-sm text-science-700 mr-3">
                Register for more features
              </span>
              <AuthDialog>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-science-300 text-science-700 flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login / Register
                </Button>
              </AuthDialog>
            </div>
          )}
        </div>
        
        {submissionSuccess ? (
          <Card className="science-card">
            <CardHeader>
              <CardTitle className="text-center text-green-600">Submission Received!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="py-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6">
                  Thank you for your contribution to the PVA-Free database. Your submission is now pending approval.
                  Once approved, it will appear in our database.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setSubmissionSuccess(false)} 
                    className="bg-science-600 hover:bg-science-700 text-white px-4 py-2 rounded-md"
                  >
                    Submit Another Product
                  </button>
                  <a 
                    href="/database" 
                    className="border border-science-300 text-science-700 px-4 py-2 rounded-md hover:bg-science-50"
                  >
                    View Database
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                <Label htmlFor="ingredients">Ingredients List</Label>
                <div className="space-y-2">
                  <Textarea 
                    id="ingredients" 
                    placeholder="Paste product ingredients here for automatic PVA detection..."
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    className="h-32 font-mono text-sm"
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAnalyzeIngredients}
                      disabled={!ingredientsText.trim() || isIngredientsProcessing}
                      className="flex items-center"
                    >
                      {isIngredientsProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Analyze Ingredients
                    </Button>
                  </div>
                </div>
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
                    <Label className="mb-2 block">Product Image</Label>
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
                  
                  {isAuthenticated && (
                    <div className="mt-4">
                      <MediaUploader 
                        label="Additional Media (Images/Videos)" 
                        onChange={handleMediaFilesChange}
                        currentFiles={mediaFiles}
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-science-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-science-600 mr-2" />
                      <Label className="font-medium">Analysis Status</Label>
                    </div>
                    
                    {isProcessing || isSDSProcessing || isIngredientsProcessing ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 text-science-500 animate-spin" />
                        <span className="ml-2 text-sm text-science-700">
                          {isProcessing 
                            ? "Processing product image..." 
                            : isSDSProcessing 
                              ? "Processing SDS..."
                              : "Analyzing ingredients..."}
                        </span>
                      </div>
                    ) : (extractedText || ingredientsText) ? (
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Label className="text-sm">PVA Status:</Label>
                          <div className="ml-2">
                            {pvaStatus === "Contains PVA" ? (
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                                <span className="text-sm font-medium text-destructive">Contains PVA</span>
                                {ingredientsAnalysisConfidence && (
                                  <span className="text-xs ml-2 px-1.5 py-0.5 bg-gray-100 rounded">
                                    {ingredientsAnalysisConfidence} confidence
                                  </span>
                                )}
                              </div>
                            ) : pvaStatus === "No PVA Detected" ? (
                              <div className="flex items-center">
                                <Check className="h-4 w-4 text-science-600 mr-1" />
                                <span className="text-sm font-medium text-science-600">No PVA Detected</span>
                                {ingredientsAnalysisConfidence && (
                                  <span className="text-xs ml-2 px-1.5 py-0.5 bg-gray-100 rounded">
                                    {ingredientsAnalysisConfidence} confidence
                                  </span>
                                )}
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
                        
                        {extractedText && (
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
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">
                        Upload a product image or paste ingredients to analyze for PVA content.
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-science-600" />
                      <span>Important Notes</span>
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Paste full ingredients list for direct analysis, or</li>
                      <li>• Upload a clear image of packaging showing ingredients</li>
                      <li>• Higher quality information yields better detection results</li>
                      <li>• All submissions are reviewed before database inclusion</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {isAuthenticated && (
                <>
                  <Separator className="my-4" />
                  <CommentsSection />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
              <Button 
                className="bg-science-600 hover:bg-science-700"
                onClick={handleSubmit}
                disabled={!isFormValid || isProcessing || isSDSProcessing || isIngredientsProcessing}
              >
                Submit Contribution
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContributePage;
