
import toast from "react-hot-toast";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Stripe from "stripe";

// Define the shape of the authentication context

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY!) as any;

interface User {
  id: string;
  email: string;
  onboarded: boolean;
}
interface AuthContextType {
  user: any; // Replace 'any' with a proper user type
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateUser: (data: Partial<User>) => void;
}

// Create the context with a default empty value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (session?.user) {
          const { data: preferences, error: prefError } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (prefError && prefError.code !== "PGRST116") {
            console.error("Preferences fetch error:", prefError);
            throw prefError;
          }

          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              onboarded: preferences?.onboarded ?? false,
            });

            setTimeout(() => {
              if (
                !preferences?.onboarded &&
                window.location.pathname !== "/onboarding"
              ) {
                navigate("/onboarding");
              }
            }, 0);
          }
        } else {
          if (mounted) {
            setUser(null);
            if (!window.location.pathname.match(/^\/(login|signup)$/)) {
              navigate("/login");
            }
          }
        }
      } catch (err) {
        console.error("Session error:", err);
        if (mounted) {
          setUser(null);
          navigate("/login");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();


    const handleAuthChange = (event: string, session: any | null) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        fetchUserData(session.user); // Move async logic here
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/login");
      }
    };

    const fetchUserData = async (user: User) => {
      try {
        console.log("User preferences fetching==>:");
        const { data: preferences, error: prefError } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("User preferences fetched==>:", preferences);
        if (prefError && prefError.code !== "PGRST116") {
          console.error("Preferences fetch error:", prefError);
          throw prefError;
        }
        setUser({
          id: user.id,
          email: user.email!,
          onboarded: preferences?.onboarded ?? false,
        });

        // Delay navigation to ensure state is updated
        setTimeout(() => {
          if (!preferences?.onboarded) {
            navigate("/onboarding");
          } else {
            navigate("/chat");
          }
        }, 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //  async (event, session) => {
    //     if (!mounted) return;

    //     if (event === "SIGNED_IN" && session?.user) {
    //       try {
    //         const { data: preferences, error: prefError } = await supabase
    //           .from("user_preferences")
    //           .select("*")
    //           .eq("user_id", session.user.id)
    //           .maybeSingle();
    //         console.log("User preferences fetched==>:", preferences);
    //         if (prefError && prefError.code !== "PGRST116") {
    //           console.error("Preferences fetch error:", prefError);
    //           throw prefError;
    //         }

    //         setUser({
    //           id: session.user.id,
    //           email: session.user.email!,
    //           onboarded: preferences?.onboarded ?? false,
    //         });


    //         setUser(session.user)


    //         // Delay navigation to ensure state is updated
    //         setTimeout(() => {
    //           // if (!preferences?.onboarded) {
    //           //   navigate("/onboarding");
    //           // } else {
    //           //   navigate("/chat");
    //           // }
    //         }, 0);
    //       } catch (err) {
    //         console.error("Error loading user preferences:", err);
    //         toast.error("Failed to load user preferences");
    //         setLoading(false);
    //       }
    //     } else if (event === "SIGNED_OUT") {
    //       setUser(null);
    //       navigate("/login");
    //     }
    //   }
    // );
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);


  const initializeUserData = async (userId: string, customer_id: string) => {
    try {
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingPrefs) {
        await supabase.from("user_preferences").insert({
          user_id: userId,
          role: [],
          tone: "friendly",
          focus_areas: [],
          interaction_frequency: "daily",
          onboarded: false,
        });
      }

      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      

      // Only insert if no subscription exists
      if (!existingSub) {
        await supabase.from("subscriptions").insert({
          user_id: userId,
          is_premium: false,
          message_limit: 20,
          stripe_customer_id: customer_id,
        });
      }

      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingConv) {
        await supabase.from("conversations").insert({
          user_id: userId,
          title: "Welcome",
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize user data:", error);
      throw error;
    }
  };

  // Sign-up function (redirects to login page after successful signup)
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);

      // First check if user exists
      const { data: existingUser, error: checkError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (existingUser?.user) {
        toast.error(
          "An account with this email already exists. Please sign in instead."
        );
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        if (error.message === "User already registered") {
          toast.error(
            "An account with this email already exists. Please sign in instead."
          );
          navigate("/login");
          return;
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned from signup");
      }

      const customer = await stripe.customers.create({
        email,
      });

      await initializeUserData(data.user.id, customer.id);

     
  
  

      setUser({
        id: data.user.id,
        email: data.user.email!,
        onboarded: false,
      });

      toast.success("Account created successfully!");

      // Delay navigation to ensure state is updated
      setTimeout(() => {
        navigate("/login");
      }, 0);
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Sign-in function (redirects to home page after login)
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Invalid email or password");
          return;
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned from signin");
      }

      const { data: preferences, error: prefError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (prefError && prefError.code !== "PGRST116") {
        throw prefError;
      }

      setUser({
        id: data.user.id,
        email: data.user.email!,
        onboarded: preferences?.onboarded ?? false,
      });

      toast.success("Welcome back!");

      // Delay navigation to ensure state is updated
      setTimeout(() => {
        if (preferences?.onboarded) {
          navigate("/chat");
        } else {
          navigate("/onboarding");
        }
      }, 0);
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Sign-out function
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev: any) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
