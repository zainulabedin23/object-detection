import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = () => {
      const statusElement = document.getElementById("status");

      try {
        // Get the hash from the URL
        const hash = window.location.hash.substring(1);
        console.log("Processing hash:", hash);

        // Parse the hash parameters
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        const accessToken = params.get("access_token");

        if (!idToken || !accessToken) {
          throw new Error("No tokens received");
        }

        // Store tokens in sessionStorage
        sessionStorage.setItem("id_token", idToken);
        sessionStorage.setItem("access_token", accessToken);
        console.log("Tokens stored successfully!");

        if (statusElement) {
          statusElement.textContent = "Authentication successful! Redirecting...";
        }

        
        setTimeout(() => {
          navigate("/result"); 
        }, 1000);
      } catch (error) {
        console.error("Auth error:", error);

        if (statusElement) {
          statusElement.textContent = "Authentication failed: " + error.message;
        }

        // Redirect to landing page after failure
        setTimeout(() => {
          navigate("/"); // Redirect to the landing page
        }, 3000);
      }
    };

    // Run the authentication process on component mount
    processAuth();
  }, [navigate]);

  return <div id="status">Processing authentication...</div>;
}

export default CallbackPage;
