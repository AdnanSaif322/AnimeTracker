export interface User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  created_at: string;
}

export interface AnimeItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  status: "watching" | "completed" | "plan_to_watch" | "dropped";
  user_id: string;
  created_at: string;
  updated_at: string;
}
