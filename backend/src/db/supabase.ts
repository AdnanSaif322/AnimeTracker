import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { CreateAnimeDTO } from "../types";

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: async (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        return await fetch(url, {
          ...options,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
});

// Create a separate admin client
const adminClient = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
          return await fetch(url, {
            ...options,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      },
    },
  }
);

export class SupabaseService {
  // Auth methods
  async signUp(email: string, password: string, username: string) {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      // Use admin client to insert user profile
      const { error: insertError } = await adminClient.from("users").insert([
        {
          id: authData.user.id,
          username,
          email,
          role: "user",
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      return authData;
    } catch (error) {
      console.error("SupabaseService signUp error:", error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log("Attempting login for email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth error:", error);
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password");
        }
        throw error;
      }

      if (!data.user) {
        console.error("No user data in response");
        throw new Error("No user data returned");
      }

      console.log("Auth successful, fetching profile for user:", data.user.id);
      // Get user profile data with error handling
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .limit(1)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw new Error("Failed to fetch user profile");
      }

      if (!profileData) {
        console.error("No profile found for user:", data.user.id);
        throw new Error("User profile not found");
      }

      console.log("Login successful");
      return {
        ...data,
        user: {
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            ...profileData,
          },
        },
      };
    } catch (error) {
      console.error("SupabaseService signIn error:", error);
      throw error;
    }
  }

  // Anime methods
  async addAnime(animeData: CreateAnimeDTO, userId: string) {
    // First, check if anime exists
    const { data: existingAnime, error: searchError } = await adminClient
      .from("anime_list")
      .select()
      .eq("name", animeData.name)
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine
      throw searchError;
    }

    let animeToUse = existingAnime;

    // If anime doesn't exist, insert it
    if (!existingAnime) {
      const { data: insertedAnime, error: insertError } = await adminClient
        .from("anime_list")
        .insert([animeData])
        .select()
        .single();

      if (insertError) throw insertError;
      animeToUse = insertedAnime;
    }

    // Then create the user-anime relationship
    const { error: relationError } = await supabase.from("user_anime").insert([
      {
        user_id: userId,
        anime_id: animeToUse.id,
        status: "watched",
      },
    ]);

    if (relationError) throw relationError;
    return animeToUse;
  }

  async deleteAnime(animeId: string, userId: string) {
    const { error } = await supabase
      .from("user_anime")
      .delete()
      .match({ anime_id: animeId, user_id: userId });

    if (error) throw error;
    return true;
  }

  async getAnimeList(userId: string) {
    const { data, error } = await supabase
      .from("anime_list")
      .select(
        `
        *,
        user_anime!inner (
          status
        )
      `
      )
      .eq("user_anime.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data to include status from user_anime
    return data.map((anime: any) => ({
      ...anime,
      status: anime.user_anime[0].status,
    }));
  }

  async updateAnimeStatus(animeId: string, userId: string, status: string) {
    const { error } = await supabase
      .from("user_anime")
      .update({ status })
      .match({ anime_id: animeId, user_id: userId });

    if (error) throw error;
    return true;
  }

  async updateAnime(
    animeId: string,
    userId: string,
    updateData: Partial<CreateAnimeDTO>
  ) {
    const { data, error } = await supabase
      .from("anime_list")
      .update(updateData)
      .match({ id: animeId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();
