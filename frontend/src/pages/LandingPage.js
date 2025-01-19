import { useState } from 'react';
import "../css/landingPage.css";
function LandingPage() {
    const handleLogin = () => {
      const cognitoDomain = "ap-south-1oiavgl4ke.auth.ap-south-1.amazoncognito.com";
      const clientId = "4o20se2dbr9ahj1is6ifnu7a7r";
      const redirectUri = "http://localhost:3000/callback";
  
      const loginUrl = `https://${cognitoDomain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
      window.location.href = loginUrl;
    };
  
    return (
      <div className="gradient-background">
        <div className="glass-effect floating">
          <h1 className="title">Welcome Back!</h1>
          <button onClick={handleLogin} style={{cursor:"pointer"}}>Login Here</button>
          <p>Click to access your account</p>
        </div>
      </div>
    );
  }
  
  export default LandingPage;
  