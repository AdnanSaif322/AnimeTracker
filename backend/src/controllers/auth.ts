import { Context } from "hono";
import jwt from "jsonwebtoken";
import { supabaseService } from "../db/supabase";

export async function register(c: Context) {
  try {
    const { email, password, username } = await c.req.json();

    if (!email || !password || !username) {
      return c.json(
        {
          error: "Email, password and username are required",
        },
        400
      );
    }

    try {
      await supabaseService.signUp(email, password, username);
      return c.json({ message: "User registered successfully" }, 201);
    } catch (error: any) {
      console.error("Supabase error:", error);

      // Handle rate limit error specifically
      if (error?.status === 429) {
        return c.json(
          {
            error: "Please wait 1 minute before trying to register again",
            retryAfter: 60, // seconds
          },
          429
        );
      }

      return c.json(
        {
          error: error.message || "Registration failed",
          details: error,
        },
        400
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return c.json({ error: "Invalid request format" }, 400);
  }
}

export async function login(c: Context) {
  try {
    const { email, password } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json(
        {
          error: "Email and password are required",
        },
        400
      );
    }

    try {
      const data = await supabaseService.signIn(email, password);

      if (!data.user) {
        return c.json(
          {
            error: "Authentication failed",
          },
          401
        );
      }

      const token = jwt.sign(
        {
          userId: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata.role || "user",
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      return c.json({
        token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata.role || "user",
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return c.json(
        {
          error: error.message || "Invalid credentials",
          details: process.env.NODE_ENV === "development" ? error : undefined,
        },
        401
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return c.json(
      {
        error: "Invalid request format",
      },
      400
    );
  }
}
