import React, { useEffect, useState } from "react";

const MuvanceHomePage = () => {
  const [rocketPosition, setRocketPosition] = useState(-30); // Start below the screen (adjust percentage as needed)
  const [isInMiddle, setIsInMiddle] = useState(false); // Track if the rocket is in the middle

  // Handle mouse wheel event
  const handleWheel = (event) => {
    if (event.deltaY > 0) {
      // Scrolling down
      if (!isInMiddle) {
        setRocketPosition(20); // Move rocket to the middle
        setIsInMiddle(true);
      }
    } else {
      // Scrolling up
      if (isInMiddle) {
        setRocketPosition(-30); // Move rocket back to the initial position
        setIsInMiddle(false);
      }
    }
  };

  useEffect(() => {
    // Add wheel event listener when the component mounts
    window.addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isInMiddle]);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        fontFamily: "Arial, sans-serif",
        backgroundColor: "black",
        color: "white",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Full viewport height
        overflow: "hidden",
        position: "relative", // For absolute positioning of the image
      }}
    >
      {/* Image as a topmost layer */}
      <img
        src="/rocket.png" // Replace with your actual image URL
        alt="Rocket Image"
        style={{
          position: "absolute",
          bottom: `${rocketPosition}%`, // Dynamically update the rocket's position
          left: "50%", // Center horizontally
          transform: "translateX(-50%)", // Ensure the rocket is horizontally centered
          width: "30%", // Image size
          height: "auto",
          objectFit: "cover",
          zIndex: 2,
          transition: "bottom 1s ease", // Smooth transition for the bottom position
        }}
      />

      {/* Top Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 1, // Ensure the text appears below the image
        }}
      >
        <h1
          style={{
            fontSize: "25vw",
            fontWeight: "regular",
            margin: 0,
            fontFamily: "'Roskilde DEMO', sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          MUVANCE
        </h1>
        <p
          style={{
            fontSize: "2.9vw",
            fontWeight: 600,
            marginTop: "0.0rem",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: "900",
            letterSpacing: "0.05em",
          }}
        >
          THE NON-BULLSHIT DIGITAL MARKETING AGENCY
        </p>
      </div>

      {/* Button aligned to bottom-right */}
      <button
        style={{
          backgroundColor: "white",
          color: "black",
          border: "2px solid black",
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          borderRadius: "2rem",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.3s ease",
          position: "absolute",
          bottom: "3rem",
          right: "3rem",
          zIndex: 1, // Ensure button appears below the image
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "black";
          e.target.style.color = "white";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "white";
          e.target.style.color = "black";
        }}
      >
        Get in Touch
      </button>
    </div>
  );
};

export default MuvanceHomePage;
