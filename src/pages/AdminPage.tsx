
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Eye, Trash, Search, Plus } from "lucide-react";
import { mockProducts, mockAdminSettings, Product } from "@/lib/mockData";

const AdminPage = () => {
  const { toast } = useToast();
  const [pendingProducts, setPendingProducts] = useState<Product[]>(
    mockProducts.filter(p => !p.approved)
  );
  const [approvedProducts, setApprovedProducts] = useState<Product[]>(
    mockProducts.filter(p => p.approved)
  );
  const [keywords, setKeywords] = useState<string[]>(mockAdminSettings.keywords);
  const [newKeyword, setNewKeyword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (productId: string) => {
    const productToApprove = pendingProducts.find(p => p.id === productId);
    if (productToApprove) {
      // Update product to approved status
      const updatedProduct = { ...productToApprove, approved: true };
      
      // Update state
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      setApprovedProducts([...approvedProducts, updatedProduct]);
      
      toast({
        title: "Product approved",
        description: `${updatedProduct.name} has been added to the database.`,
      });
    }
  };

  const handleReject = (productId: string) => {
    setPendingProducts(pendingProducts.filter(p => p.id !== productId));
    
    toast({
      title: "Product rejected",
      description: "The product submission has been rejected.",
    });
  };

  const handleDelete = (productId: string) => {
    setApprovedProducts(approvedProducts.filter(p => p.id !== productId));
    
    toast({
      title: "Product deleted",
      description: "The product has been removed from the database.",
    });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() === "") {
      toast({
        title: "Empty keyword",
        description: "Please enter a keyword to add.",
        variant: "destructive"
      });
      return;
    }
    
    if (keywords.includes(newKeyword.trim())) {
      toast({
        title: "Duplicate keyword",
        description: "This keyword already exists in the list.",
        variant: "destructive"
      });
      return;
    }
    
    setKeywords([...keywords, newKeyword.trim()]);
    setNewKeyword("");
    
    toast({
      title: "Keyword added",
      description: `"${newKeyword.trim()}" has been added to the keyword list.`,
    });
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
    
    toast({
      title: "Keyword removed",
      description: `"${keyword}" has been removed from the keyword list.`,
    });
  };

  const filteredApprovedProducts = approvedProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage product submissions and configuration
        </p>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved Products</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Pending Submissions Tab */}
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>
                Review and approve user-submitted product information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>PVA %</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>
                            {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {new Date(product.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {}}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleApprove(product.id)}
                                className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleReject(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No pending submissions to review
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Approved Products Tab */}
        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle>Approved Products</CardTitle>
                  <CardDescription>
                    All products that have been approved and are displayed in the database
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {approvedProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>PVA %</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>
                            {product.pvaPercentage !== null ? `${product.pvaPercentage}%` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No approved products in the database
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure application settings and scan parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Scan Keywords</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These keywords will be used to scan uploaded documents for PVA-related ingredients
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1 px-3 py-1">
                      {keyword}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Add new keyword..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddKeyword}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add
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
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
