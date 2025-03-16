
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // For signup, first check if user already exists
        const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (existingUser && existingUser.session) {
          // User exists and password is correct, log them in
          toast.success("Logged in with existing account!");
          navigate("/");
          return;
        }

        // User doesn't exist or password is incorrect, try to sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data && data.user) {
          // Create profile manually to ensure it exists
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: formData.username || formData.email,
              note_size: 'medium',
            }, { onConflict: 'id' });

          if (profileError) {
            console.error("Failed to create profile:", profileError);
          }
        }

        // Sign in immediately after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        toast.success("Account created and logged in successfully!");
        navigate("/");
      } else {
        // Regular sign in process
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 shadow-2xl rounded-lg overflow-hidden">
        {/* Left side - Image/Brand */}
        <div className="hidden md:block relative bg-gray-800">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div>
              <h2 className="text-2xl font-bold text-white">NotesGalaxy</h2>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Capture Ideas</h3>
              <p className="text-gray-300 mb-6">Organize your thoughts, streamline your workflow</p>
              <div className="flex space-x-2">
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                <span className="w-2 h-2 rounded-full bg-gray-500 inline-block"></span>
                <span className="w-2 h-2 rounded-full bg-gray-500 inline-block"></span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="bg-gray-800 p-8 flex flex-col justify-center">
          <div className="text-center md:text-left mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? "Start organizing your notes today" : "Sign in to continue to NotesGalaxy"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, username: e.target.value }))
                    }
                    placeholder="Enter your username"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all duration-300 mt-6 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Processing..."
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
