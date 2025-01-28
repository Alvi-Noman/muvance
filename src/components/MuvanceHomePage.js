import React, { useEffect, useState } from "react";
import LandingSection from "./LandingSection";

const MuvanceHomePage = () => {
  const [rocketPosition, setRocketPosition] = useState(-30); // Start below the screen
  const [imageIndex, setImageIndex] = useState(0); // Track the image sequence
  const [rocketImage, setRocketImage] = useState("/rocket.png"); // Default rocket image
  const [isInMiddle, setIsInMiddle] = useState(false); // Flag to check if the rocket is in the middle
  const [scrollCount, setScrollCount] = useState(0); // Count the number of scroll events
  const [currentPage, setCurrentPage] = useState(1); // Track current page (1 or 2)

  const imageSequenceDown = ["/rocket3.png", "/rocket4.png", "/rocket5.png", "/rocket6.png"];
  const imageSequenceUp = ["/rocket6.png", "/rocket5.png", "/rocket4.png", "/rocket3.png", "/rocket2.png"];

  const handleWheel = (event) => {
    if (event.deltaY > 0) {
      // Scrolling down
      if (rocketPosition === -30) {
        setRocketPosition(20); // Move rocket to the middle
        setRocketImage("/rocket.png"); // Reset to original image
      } else if (isInMiddle && imageIndex < imageSequenceDown.length) {
        setScrollCount((prevCount) => prevCount + 1); // Increment scroll count
        if (scrollCount >= 4) {
          setRocketImage(imageSequenceDown[imageIndex]);
          setImageIndex(imageIndex + 1);
          setScrollCount(0);
        }
      }

      // Change to page 2
      if (rocketImage === "/rocket6.png" && currentPage === 1) {
        setCurrentPage(2);
      }
    } else {
      // Scrolling up
      if (rocketImage === "/rocket.png") {
        setRocketPosition(-30);
      } else if (isInMiddle && imageIndex > 0) {
        setScrollCount((prevCount) => prevCount + 1);
        if (scrollCount >= 4) {
          setRocketImage(imageSequenceUp[imageIndex - 1]);
          setImageIndex(imageIndex - 1);
          setScrollCount(0);
        }
        if (imageIndex === 1) {
          setRocketImage("/rocket.png");
          setImageIndex(0);
        }
      }

      // Change back to page 1
      if (currentPage === 2) {
        setCurrentPage(1);
      }
    }
  };

  const handleTransitionEnd = () => {
    if (rocketPosition === 20) {
      setIsInMiddle(true);
    } else if (rocketPosition === -30) {
      setRocketImage("/rocket.png");
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [rocketPosition, isInMiddle, imageIndex, scrollCount, currentPage]);

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
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Rocket */}
      <img
        src={rocketImage}
        alt="Rocket Image"
        style={{
          position: "absolute",
          bottom: `${rocketPosition}%`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "30%",
          height: "auto",
          objectFit: "cover",
          zIndex: 2,
          transition: "bottom 1s ease",
        }}
        onTransitionEnd={handleTransitionEnd}
      />

      {/* Page content */}
      {currentPage === 1 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 1,
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
      )}

      {currentPage === 2 && <LandingSection />}

      {/* Button */}
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
          zIndex: 1,
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
