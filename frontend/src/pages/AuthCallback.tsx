import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase-client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Confirming your email...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token from URL
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken) {
          setStatus("No confirmation token found");
          return;
        }

        // Set the session
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        if (error) {
          throw error;
        }

        setStatus("Email confirmed successfully!");
        // Redirect to login after 2 seconds
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        console.error("Error confirming email:", error);
        setStatus("Failed to confirm email. Please try again.");
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{status}</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
