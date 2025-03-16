
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteImageFromStorage } from "@/lib/api/storage";
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

export const ProfileActions: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get all user notes with images before deleting them
      const { data: notesWithImages, error: notesError } = await supabase
        .from("notes")
        .select("image_url")
        .eq("user_id", session.user.id)
        .not("image_url", "is", null);

      if (notesError) throw notesError;

      // Get user profile to delete avatar if exists
      const { data: userProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session.user.id)
        .single();

      if (profileFetchError && profileFetchError.code !== 'PGRST116') {
        // PGRST116 is "No rows found" error, which is fine if the user doesn't have a profile
        throw profileFetchError;
      }

      // Delete all notes
      const { error: notesDeleteError } = await supabase
        .from("notes")
        .delete()
        .eq("user_id", session.user.id);

      if (notesDeleteError) throw notesDeleteError;

      // Delete profile
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", session.user.id);

      if (profileDeleteError) throw profileDeleteError;

      // After database records are deleted, delete all images from storage
      // Delete note images
      if (notesWithImages && notesWithImages.length > 0) {
        for (const note of notesWithImages) {
          if (note.image_url) {
            await deleteImageFromStorage(note.image_url);
          }
        }
      }

      // Delete avatar
      if (userProfile && userProfile.avatar_url) {
        await deleteImageFromStorage(userProfile.avatar_url);
      }

      // Sign out
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <span>Theme</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Button
        variant="outline"
        className="gap-2"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              your account, all your notes, and any uploaded images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
