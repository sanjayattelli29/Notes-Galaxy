
import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        // Fetch user profile to get avatar
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate("/auth");
      } else if (event === 'USER_UPDATED') {
        // Refresh avatar when user is updated
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    });

    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // You can implement your search logic here
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar - always visible on larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar - shown only when menu is opened */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 h-full">
            <Sidebar />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col w-full">
        <header className="p-4 border-b sticky top-0 z-10 bg-background">
          <div className="w-full flex items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1 max-w-xl relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notes by title..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {avatarUrl ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
                  <AvatarFallback>
                    <UserCircle className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserCircle className="h-8 w-8" />
              )}
              <span className="font-medium text-sm hidden sm:inline">PROFILE</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto custom-scrollbar w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
};
