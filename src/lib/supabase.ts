import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY!);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

console.log("Initializing Supabase client with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: "pkce",
  },
});

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log Supabase client initialization
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Supabase auth state changed:", event, session, session?.user?.id);
});

export const isSupabaseError = (error: any): boolean => {
  return error?.name === "AuthApiError" || error?.code?.startsWith("PGRST");
};

export const getErrorMessage = (error: any): string => {
  if (isSupabaseError(error)) {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password";
      case "Email not confirmed":
        return "Please check your email to confirm your account";
      case "User already registered":
        return "An account with this email already exists";
      default:
        return error.message || "An error occurred";
    }
  }
  return "An unexpected error occurred";
};

export const api = {
  getUserProfile: async () => {
    try {
      console.log("Getting user session...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error("No session found");
        throw new Error("No user logged in");
      }

      console.log("Fetching user preferences...");
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Preferences fetch error:", error);
        throw error;
      }

      console.log("User preferences fetched:", data);
      return data;
    } catch (error) {
      console.error("getUserProfile error:", error);
      throw error;
    }
  },

  updateUserProfile: async (data: any) => {
    try {
      console.log("Getting user session for profile update...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log(1, session)

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error("No session found");
        throw new Error("No user logged in");
      }

      const { data: existingPreference, error: fetchError } = await supabase
        .from("user_preferences")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Error fetching user preferences: ${fetchError.message}`);
      }

      let error; // Define the error variable

      if (existingPreference) {
        // Row exists, update it
        ({ error } = await supabase
          .from("user_preferences")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", session.user.id));
      } else {
        // Row does not exist, insert a new one
        ({ error } = await supabase.from("user_preferences").insert({
          user_id: session.user.id,
          ...data,
          updated_at: new Date().toISOString(),
        }));
      }

      let subData = {
        user_id: session.user.id,
          is_premium: false,
          message_limit: 20,
      }

      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existingSub) {
        // Row exists, update it
        ({ error } = await supabase
          .from("subscriptions")
          .update({
            ...subData,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", session.user.id));
      } else {
        // Row does not exist, insert a new one
        ({ error } = await supabase.from("subscriptions").insert(subData));
      }


      if (error) {
        throw new Error(`Profile update error: ${error.message}`);
      }

      console.log("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("updateUserProfile error:", error);
      throw error;
    }
  },

  getJournalEntries: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createJournalEntry: async (entry: { content: string; topics: string[] }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: session.user.id,
        content: entry.content,
        topics: entry.topics,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  isPremiumUser: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return false;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("is_premium")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error || !data) {
        await supabase.from("subscriptions").insert({
          user_id: session.user.id,
          is_premium: false,
        });
        return false;
      }

      return data.is_premium;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  },

  checkMessageLimit: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    try {
      const { data, error } = await supabase.rpc("increment_message_count", {
        user_id_param: session.user.id,
      });

      if (error) throw error;

      return data; // Returns true if message allowed, false if limit reached
    } catch (error) {
      console.error("Error checking message limit:", error);
      throw error;
    }
  },

  getMessageLimitInfo: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("daily_message_count, message_limit, is_premium")
        .eq("user_id", session.user.id)
        .single();

      console.log(error)
      if (error) throw error;

      // Check if no subscription data was found
      if (!data) {
        // Handle case when no row is returned for the user
        throw new Error("No subscription data found for this user");
      }

      return {
        used: data.daily_message_count,
        limit: data.message_limit,
        isPremium: data.is_premium,
      };
    } catch (error) {
      console.error("Error getting message limit info:", error);
      throw error;
    }
  },

  increaseMessageLimitForAllUsers: async (email: string, newLimit: number) => {
    console.log("-->", email, newLimit);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    // Check if the logged-in user is 'bnitesh400@gmail.com'
    if (session.user.email !== email) {
      throw new Error("You do not have permission to perform this action");
    }

    try {
      // Update message limit for all users in the subscriptions table
      const { data: existingData, error: checkError } = await supabase
        .from("subscriptions")
        .select("*")
      console.log("=>", existingData);
      const { data, error } = await supabase
        .from("subscriptions")
        .update({ message_limit: newLimit })
        .eq("message_limit", 20);

      console.log(data);

      if (error) throw error;

      return {
        message: "Message limit updated successfully for all users",
        updatedCount: data,
      };
    } catch (error) {
      console.error("Error increasing message limit for all users:", error);
      throw error;
    }
  },

  savePersonalityResults: async (results: any) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const { error } = await supabase.from("personality_results").insert({
      user_id: session.user.id,
      results,
    });

    if (error) throw error;
    return true;
  },

  getGoals: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createGoal: async (goal: {
    title: string;
    description: string;
    deadline?: string;
  }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const goalData = {
      user_id: session.user.id,
      title: goal.title,
      description: goal.description,
      ...(goal.deadline ? { deadline: goal.deadline } : {}),
    };

    const { data, error } = await supabase
      .from("goals")
      .insert(goalData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateGoal: async (
    id: string,
    updates: {
      completed?: boolean;
      title?: string;
      description?: string;
      deadline?: string;
    }
  ) => {
    const cleanUpdates = { ...updates };
    if (updates.deadline === "") {
      delete cleanUpdates.deadline;
    }

    const { data, error } = await supabase
      .from("goals")
      .update(cleanUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteGoal: async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  clearChat: async (conversationId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No user logged in");

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single();

    if (convError) throw convError;
    if (!conversation) throw new Error("Conversation not found");

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (error) throw error;
    return true;
  },

  createSubscriptionPaymentLink: async (pricing_id: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("No user logged in");

      // Step 2: Check if the user exists in the subscriptions table
      const { data: subscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
        console.log('session.user.id', session.user.id)
        console.log('pricing_id', pricing_id)

      if (fetchError) {
        throw new Error(`Error fetching subscription: ${fetchError.message}`);
      }

      if (!subscription || !subscription.stripe_customer_id) {
        throw new Error("Stripe customer ID not found for this user");
      }

      const stripeCustomerId = subscription.stripe_customer_id;

      // Step 3: Create a subscription payment link using Stripe
      const payment = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        line_items: [
          {
            price: pricing_id, 
            quantity: 1,
          },
        ],
        success_url: `http://localhost:3000/pricing`,
        cancel_url: `http://localhost:3000/pricing`,
        subscription_data: {
          metadata: {
            customer_id: stripeCustomerId,
          },
        },
      });
  
      return payment.url
    } catch (error) {
      console.error("Error creating subscription payment link:", error);
      throw error;
    }
  },

  getSubscription: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("No user logged in");
      
      // Step 1: Fetch the user's subscription data from Supabase
      const { data, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      console.log('data', data)

      if (fetchError) {
        throw new Error(`Error fetching subscription: ${fetchError.message}`);
      }

      return {
        message: "Subscription updated successfully",
        data: data,
      };
    } catch (error) {
      console.error("Error updating subscription from Stripe:", error);
      throw error;
    }
  },

  updateSubscriptionFromStripe: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("No user logged in");
      
      // Step 1: Fetch the user's subscription data from Supabase
      const { data: subscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Error fetching subscription: ${fetchError.message}`);
      }

      if (!subscription || !subscription.stripe_customer_id) {
        throw new Error("Stripe customer ID not found for this user");
      }

      const stripeCustomerId = subscription.stripe_customer_id;

      // Step 2: Fetch subscription data from Stripe
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
      });

      if (!stripeSubscriptions.data.length) {
        throw new Error("No active subscriptions found for this user in Stripe");
      }

      // Assuming the first active subscription is the one we need
      const activeSubscription = stripeSubscriptions.data[0];
      console.log('activeSubscription', activeSubscription)
      const subscriptionName = activeSubscription.items.data[0]?.price?.nickname || "Default Plan";

      // Step 3: Update the Supabase subscriptions table
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          is_premium: true,
          subscription_name: subscriptionName,
        })
        .eq("user_id", session.user.id);

      if (updateError) {
        throw new Error(`Error updating subscription: ${updateError.message}`);
      }

      return {
        message: "Subscription updated successfully",
        subscriptionName,
      };
    } catch (error) {
      console.error("Error updating subscription from Stripe:", error);
      await  api.getSubscription();
    }
  }


};
