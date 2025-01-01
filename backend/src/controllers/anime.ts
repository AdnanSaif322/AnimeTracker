import { Context } from "hono";
import { supabaseService } from "../db/supabase";
import { CreateAnimeDTO } from "../types";
import { AppError, isAppError } from "../utils/errors";
import { validators } from "../utils/validation";

// Add anime validation schema
const addAnimeSchema = {
  name: validators.isString,
  vote_average: validators.isValidRating,
  image_url: validators.isString,
};

//upload anime
export async function addAnime(c: Context) {
  try {
    const user = c.get("user");
    const animeData = await c.req.json<CreateAnimeDTO>();

    // Validate input
    if (!validators.isString(animeData.name)) {
      throw new AppError("Name is required and must be a string");
    }

    if (!validators.isValidRating(animeData.vote_average)) {
      throw new AppError("Rating must be between 0 and 10");
    }

    if (!validators.isString(animeData.image_url)) {
      throw new AppError("Image URL is required and must be a string");
    }

    const data = {
      name: animeData.name,
      image_url: animeData.image_url,
      vote_average: animeData.vote_average || null,
    };

    const result = await supabaseService.addAnime(data, user.userId);
    return c.json(
      {
        message: "Anime added successfully",
        data: result,
      },
      201
    );
  } catch (error) {
    if (isAppError(error)) throw error;
    console.error("Failed to add anime:", error);
    throw new AppError("Failed to add anime");
  }
}

export async function deleteAnime(c: Context) {
  try {
    const user = c.get("user");
    const { id } = c.req.param();
    await supabaseService.deleteAnime(id, user.userId);
    return c.json({ message: "Anime deleted successfully" });
  } catch (error) {
    return c.json({ error: "Failed to delete anime" }, 400);
  }
}

export async function getAnimeList(c: Context) {
  try {
    const user = c.get("user");
    console.log("Fetching anime list for user:", user.userId);

    const data = await supabaseService.getAnimeList(user.userId);
    return c.json(data);
  } catch (error) {
    console.error("Failed to fetch anime list:", error);
    return c.json({ error: "Failed to fetch anime list" }, 400);
  }
}

export async function updateAnimeStatus(c: Context) {
  try {
    const user = c.get("user");
    const { id } = c.req.param();
    const { status } = await c.req.json();

    if (!validators.isValidStatus(status)) {
      throw new AppError("Invalid status value");
    }

    await supabaseService.updateAnimeStatus(id, user.userId, status);
    return c.json({ message: "Anime status updated successfully" });
  } catch (error) {
    if (isAppError(error)) throw error;
    console.error("Failed to update anime status:", error);
    throw new AppError("Failed to update anime status");
  }
}

export async function updateAnime(c: Context) {
  try {
    const user = c.get("user");
    const { id } = c.req.param();
    const updateData = await c.req.json<Partial<CreateAnimeDTO>>();

    if (
      updateData.vote_average &&
      (updateData.vote_average < 0 || updateData.vote_average > 10)
    ) {
      return c.json({ error: "Rating must be between 0 and 10" }, 400);
    }

    const result = await supabaseService.updateAnime(
      id,
      user.userId,
      updateData
    );
    return c.json({
      message: "Anime updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Failed to update anime:", error);
    return c.json({ error: "Failed to update anime" }, 400);
  }
}
