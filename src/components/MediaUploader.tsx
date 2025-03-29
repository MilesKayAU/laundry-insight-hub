
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image, Film, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string;
  label: string;
  currentFiles?: File[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onChange,
  maxFiles = 5,
  acceptedFileTypes = "image/*,video/*",
  label,
  currentFiles = [],
}) => {
  const [files, setFiles] = useState<File[]>(currentFiles);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: `Maximum ${maxFiles} files allowed`,
        description: `You can only upload a maximum of ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    // Simulate upload
    setIsUploading(true);
    setTimeout(() => {
      const newFiles = [...files];
      Array.from(selectedFiles).forEach(file => {
        // Check file type
        if (!file.type.match(/(image|video)\//)) {
          toast({
            title: "Invalid file type",
            description: "Please upload only images or videos.",
            variant: "destructive",
          });
          return;
        }
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Files must be less than 10MB in size.",
            variant: "destructive",
          });
          return;
        }
        
        newFiles.push(file);
      });
      
      setFiles(newFiles);
      onChange(newFiles);
      setIsUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1000); // Simulate 1 second upload time
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onChange(newFiles);
  };

  const getFilePreview = (file: File) => {
    const isImage = file.type.includes("image/");
    const isVideo = file.type.includes("video/");
    
    if (isImage) {
      return <Image className="h-10 w-10 text-science-600" />;
    } else if (isVideo) {
      return <Film className="h-10 w-10 text-science-600" />;
    } else {
      return <div>Unsupported</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <div className="text-xs text-gray-500">
          {files.length}/{maxFiles} files
        </div>
      </div>
      
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-science-50 transition-colors border-science-200"
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-science-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-10 w-10 text-science-500 mx-auto" />
            <p className="text-sm font-medium text-science-700">Upload Media</p>
            <p className="text-xs text-gray-500">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Accepted formats: images and videos
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          multiple
          disabled={isUploading || files.length >= maxFiles}
          className="hidden"
        />
      </div>
      
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 border rounded bg-science-50"
            >
              <div className="flex items-center">
                {getFilePreview(file)}
                <div className="ml-2 text-sm truncate max-w-[120px]">
                  {file.name}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
