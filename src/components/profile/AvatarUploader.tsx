
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarUploaderProps {
  avatarUrl: string | null;
  userId: string;
  onAvatarChange: (url: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  userId,
  onAvatarChange,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("File must be an image");
        return;
      }

      // Create a unique filename using the user's ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;

      // Upload image to storage with correct content type
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = `${publicUrlData.publicUrl}?v=${new Date().getTime()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarChange(newAvatarUrl);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block group">
      <Avatar className="h-32 w-32 mx-auto">
        {avatarUrl ? (
          <AvatarImage 
            src={avatarUrl} 
            alt="Profile"
            className="object-cover"
          />
        ) : (
          <AvatarFallback>
            <UserCircle className="h-16 w-16" />
          </AvatarFallback>
        )}
      </Avatar>
      <label 
        htmlFor="avatar-upload" 
        className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer group-hover:bg-primary/90 transition-colors"
      >
        <Camera className="h-5 w-5 text-white" />
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
};
