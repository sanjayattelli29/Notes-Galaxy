
import React, { useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NoteFormState } from "@/hooks/useNoteForm";

interface NoteFormImagesProps {
  noteForm: NoteFormState;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number, isUploadedImage: boolean) => void;
}

export const NoteFormImages: React.FC<NoteFormImagesProps> = ({
  noteForm,
  handleImageUpload,
  handleRemoveImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const renderImagePreview = () => {
    const imageUrls = noteForm.images.map(file => URL.createObjectURL(file));
    const allImages = [...noteForm.image_urls, ...imageUrls];
    
    if (allImages.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <Label>Image Preview</Label>
        <div className="border rounded-md p-2">
          <ImageCarousel images={allImages} size="medium" />
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {noteForm.image_urls.map((url, index) => (
            <div key={`url-${index}`} className="relative group">
              <img src={url} className="h-16 w-16 object-cover rounded-md" alt={`Preview ${index}`} />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index, true)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {noteForm.images.map((file, index) => (
            <div key={`file-${index}`} className="relative group">
              <img src={URL.createObjectURL(file)} className="h-16 w-16 object-cover rounded-md" alt={`Preview ${index}`} />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index, false)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid gap-2">
        <Label>Images (optional)</Label>
        <div className="flex gap-2 items-center">
          <Input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleFileInputClick}
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" /> Select Images
          </Button>
        </div>
      </div>
      {renderImagePreview()}
    </>
  );
};
