
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertTriangle, PlusCircle, XCircle } from "lucide-react";

interface KeywordCategories {
  commonNames: string[];
  chemicalSynonyms: string[];
  inciTerms: string[];
  additional: string[];
}

interface AdminSettingsProps {
  keywordCategories: KeywordCategories;
  newKeyword: string;
  selectedCategory: string;
  showResetDialog: boolean;
  setShowResetDialog: (show: boolean) => void;
  onNewKeywordChange: (keyword: string) => void;
  onCategoryChange: (category: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (keyword: string, category: keyof KeywordCategories) => void;
  onResetDatabase: () => void;
  getCategoryDisplayName: (category: string) => string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({
  keywordCategories,
  newKeyword,
  selectedCategory,
  showResetDialog,
  setShowResetDialog,
  onNewKeywordChange,
  onCategoryChange,
  onAddKeyword,
  onRemoveKeyword,
  onResetDatabase,
  getCategoryDisplayName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
        <CardDescription>
          Configure application settings and scan parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">PVA Scan Keywords</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These keywords will be used to scan uploaded documents for PVA-related ingredients
          </p>
          
          <Accordion type="single" collapsible className="w-full mb-4">
            <AccordionItem value="common-names">
              <AccordionTrigger className="text-md font-medium hover:no-underline">
                ✅ Common Names & Abbreviations
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywordCategories.commonNames.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                      {keyword}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => onRemoveKeyword(keyword, 'commonNames')}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These are primary trigger terms in your scan.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="chemical-synonyms">
              <AccordionTrigger className="text-md font-medium hover:no-underline">
                ✅ Chemical Synonyms
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywordCategories.chemicalSynonyms.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                      {keyword}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => onRemoveKeyword(keyword, 'chemicalSynonyms')}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Useful for detecting in scientific SDS or INCI-type declarations.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="inci-terms">
              <AccordionTrigger className="text-md font-medium hover:no-underline">
                ✅ INCI (Cosmetic Labeling Terms)
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywordCategories.inciTerms.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                      {keyword}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => onRemoveKeyword(keyword, 'inciTerms')}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These show up often in personal care products, wipes, and cleaning sprays.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="additional-terms">
              <AccordionTrigger className="text-md font-medium hover:no-underline">
                Additional Terms
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywordCategories.additional.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                      {keyword}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => onRemoveKeyword(keyword, 'additional')}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex flex-col space-y-2 mt-6">
            <h4 className="font-medium">Add New Keyword</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Input
                  placeholder="Enter new keyword or abbreviation..."
                  value={newKeyword}
                  onChange={(e) => onNewKeywordChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddKeyword();
                    }
                  }}
                />
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commonNames">Common Names & Abbreviations</SelectItem>
                    <SelectItem value="chemicalSynonyms">Chemical Synonyms</SelectItem>
                    <SelectItem value="inciTerms">INCI Terms</SelectItem>
                    <SelectItem value="additional">Additional Terms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={onAddKeyword} className="w-full md:w-auto self-end">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Keyword
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="notify-new" defaultChecked />
              <Label htmlFor="notify-new">Email notifications for new submissions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="notify-approved" defaultChecked />
              <Label htmlFor="notify-approved">Email notifications when products are approved</Label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Database Maintenance</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-yellow-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Emergency Database Actions</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    These actions will permanently modify your database. Use with caution.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Reset Database
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Entire Database</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete ALL products in the database.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={onResetDatabase}>
                            Reset Database
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
