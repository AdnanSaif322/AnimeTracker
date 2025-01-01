import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "dotenv";

// Load environment variables
config();

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check route
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Anime Tracker API is running",
  });
});

// Start server
const port = Number(process.env.PORT) || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
