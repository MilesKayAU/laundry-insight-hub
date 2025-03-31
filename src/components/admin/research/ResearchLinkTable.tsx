
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResearchLink } from './utils';

interface ResearchLinkTableProps {
  links: ResearchLink[];
  onEdit: (link: ResearchLink) => void;
  onDelete: (id: string) => void;
  deleteDialogOpen: boolean;
  deletingId: string | null;
  setDeleteDialogOpen: (open: boolean) => void;
  setDeletingId: (id: string | null) => void;
}

const ResearchLinkTable: React.FC<ResearchLinkTableProps> = ({
  links,
  onEdit,
  onDelete,
  deleteDialogOpen,
  deletingId,
  setDeleteDialogOpen,
  setDeletingId
}) => {
  return (
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
          {links.map((link) => (
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
                    onClick={() => onEdit(link)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Dialog 
                    open={deleteDialogOpen && deletingId === link.id} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setDeleteDialogOpen(false);
                        setDeletingId(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setDeletingId(link.id);
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
                          onClick={() => {
                            setDeleteDialogOpen(false);
                            setDeletingId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => onDelete(link.id)}
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
  );
};

export default ResearchLinkTable;
