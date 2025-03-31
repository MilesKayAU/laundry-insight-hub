
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Book, Plus, Trash, ExternalLink, Edit } from "lucide-react";
import { ResearchLink } from '@/lib/researchData';

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  url: z.string().url("Must be a valid URL")
});

const ResearchManagement = () => {
  const { toast } = useToast();
  const [researchLinks, setResearchLinks] = useState<ResearchLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<ResearchLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      url: ""
    }
  });

  useEffect(() => {
    fetchResearchLinks();
  }, []);

  useEffect(() => {
    if (editingLink) {
      form.reset({
        title: editingLink.title,
        description: editingLink.description,
        url: editingLink.url
      });
    } else {
      form.reset({
        title: "",
        description: "",
        url: ""
      });
    }
  }, [editingLink, form]);

  const fetchResearchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('research_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setResearchLinks(data as ResearchLink[]);
      }
    } catch (error: any) {
      console.error('Error fetching research links:', error);
      toast({
        title: "Error",
        description: "Failed to load research data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingLink) {
        // Update existing link
        const { error } = await supabase
          .from('research_links')
          .update({
            title: values.title,
            description: values.description,
            url: values.url
          })
          .eq('id', editingLink.id);

        if (error) throw error;

        toast({
          title: "Research link updated",
          description: "The research link has been successfully updated.",
        });
      } else {
        // Add new link
        const { error } = await supabase
          .from('research_links')
          .insert([{
            title: values.title,
            description: values.description,
            url: values.url
          }]);

        if (error) throw error;

        toast({
          title: "Research link added",
          description: "A new research link has been successfully added.",
        });
      }

      setDialogOpen(false);
      fetchResearchLinks();
      setEditingLink(null);
    } catch (error: any) {
      console.error('Error saving research link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save research link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const { error } = await supabase
        .from('research_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Research link deleted",
        description: "The research link has been successfully deleted.",
      });

      fetchResearchLinks();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting research link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete research link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="h-5 w-5 mr-2" />
          Research Management
        </CardTitle>
        <CardDescription>
          Manage research links about Polyvinyl Alcohol (PVA)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingLink(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Research Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? "Edit Research Link" : "Add Research Link"}
                </DialogTitle>
                <DialogDescription>
                  {editingLink 
                    ? "Update the details of the research link"
                    : "Add a new research link to the database"
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Research title" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title of the research paper or study
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of the research and its findings"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Summarize the key findings and relevance to PVA
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/research" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link to the original research paper or publication
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => {
                        setDialogOpen(false);
                        setEditingLink(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingLink ? "Update" : "Add"} Research Link
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading research data...</p>
          </div>
        ) : researchLinks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No research links available. Add your first one!</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {researchLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate">{link.description}</div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[150px]">{link.url}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingLink(link);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog open={deleteDialogOpen && deleting === link.id} onOpenChange={(open) => {
                          setDeleteDialogOpen(open);
                          if (!open) setDeleting(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setDeleting(link.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this research link? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="font-medium">{link.title}</p>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setDeleteDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleDelete(link.id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchManagement;
