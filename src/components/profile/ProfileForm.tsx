
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileFormProps {
  profile: {
    email: string;
    username: string | null;
    phone_number: string | null;
    note_size?: string;
  };
  userId: string;
  isUploading: boolean;
  onProfileChange: (key: string, value: string) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  userId,
  isUploading,
  onProfileChange,
}) => {
  const handleNoteSize = (size: string) => {
    onProfileChange("note_size", size);
  };

  const handleUpdateProfile = async () => {
    try {
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            username: profile.username,
            phone_number: profile.phone_number,
            note_size: profile.note_size || 'medium',
          });

        if (insertError) throw insertError;
      } else {
        // Profile exists, update it
        const { error } = await supabase
          .from("profiles")
          .update({
            username: profile.username,
            phone_number: profile.phone_number,
            note_size: profile.note_size,
          })
          .eq("id", userId);

        if (error) throw error;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={profile.email}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={profile.username || ""}
          onChange={(e) => onProfileChange("username", e.target.value)}
          placeholder="Enter your username"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={profile.phone_number || ""}
          onChange={(e) => onProfileChange("phone_number", e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="grid gap-2">
        <Label>Note Display Size</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={profile.note_size === "small" ? "default" : "outline"}
            onClick={() => handleNoteSize("small")}
            className="flex-1"
          >
            Small
          </Button>
          <Button
            type="button"
            variant={profile.note_size === "medium" ? "default" : "outline"}
            onClick={() => handleNoteSize("medium")}
            className="flex-1"
          >
            Medium
          </Button>
          <Button
            type="button"
            variant={profile.note_size === "large" ? "default" : "outline"}
            onClick={() => handleNoteSize("large")}
            className="flex-1"
          >
            Large
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This setting controls how large your notes appear across the application.
        </p>
      </div>

      <Button 
        onClick={handleUpdateProfile} 
        className="w-full"
        disabled={isUploading}
      >
        Update Profile
      </Button>
    </div>
  );
};
