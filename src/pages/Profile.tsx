
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileActions } from "@/components/profile/ProfileActions";

interface ProfileData {
  email: string;
  username: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  note_size?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    username: "",
    phone_number: "",
    avatar_url: "",
    note_size: "medium", // Default size
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // First, check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              username: session.user.email,
              note_size: 'medium',
            });
          
          if (createError) {
            throw createError;
          }
          
          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (fetchError) throw fetchError;
          
          setProfile({
            email: session.user.email || "",
            username: newProfile?.username || "",
            phone_number: newProfile?.phone_number || "",
            avatar_url: newProfile?.avatar_url || "",
            note_size: newProfile?.note_size || "medium",
          });
        } else {
          throw profileError;
        }
      } else {
        setProfile({
          email: session.user.email || "",
          username: profileData?.username || "",
          phone_number: profileData?.phone_number || "",
          avatar_url: profileData?.avatar_url || "",
          note_size: profileData?.note_size || "medium",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAvatarChange = (url: string) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: url
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Avatar and Basic Info */}
          <Card>
            <CardHeader className="text-center pb-2">
              <AvatarUploader 
                avatarUrl={profile.avatar_url} 
                userId={userId}
                onAvatarChange={handleAvatarChange}
              />
              <CardTitle className="mt-4 text-2xl">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-muted-foreground">
                  Update your profile photo by clicking on the image above
                </p>
              </div>
              
              <div className="mt-6">
                <ProfileActions />
              </div>
            </CardContent>
          </Card>
          
          {/* Right Column - Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                profile={profile}
                userId={userId}
                isUploading={uploading}
                onProfileChange={handleProfileChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
