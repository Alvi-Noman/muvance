import React, { useEffect, useState } from "react";
import LandingSection from "./LandingSection";

const MuvanceHomePage = () => {
  const [rocketPosition, setRocketPosition] = useState(-30);
  const [imageIndex, setImageIndex] = useState(0);
  const [rocketImage, setRocketImage] = useState("/rocket.png");
  const [isInMiddle, setIsInMiddle] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const [showLanding, setShowLanding] = useState(false);

  const imageSequenceDown = ["/rocket3.png", "/rocket4.png", "/rocket5.png", "/rocket6.png"];
  const imageSequenceUp = ["/rocket6.png", "/rocket5.png", "/rocket4.png", "/rocket3.png", "/rocket2.png"];

  const handleWheel = (event) => {
    if (showLanding) return; // Prevent interaction when LandingSection is active

    if (event.deltaY > 0) {
      // Scrolling down
      if (rocketPosition === -30) {
        setRocketPosition(20);
        setRocketImage("/rocket.png");
      } else if (isInMiddle && imageIndex < imageSequenceDown.length) {
        setScrollCount((prevCount) => prevCount + 1);
        if (scrollCount >= 4) {
          setRocketImage(imageSequenceDown[imageIndex]);
          setImageIndex(imageIndex + 1);
          setScrollCount(0);
        }
      }

      // Check if rocket reached rocket6.png, then switch to LandingSection
      if (imageIndex === imageSequenceDown.length - 1) {
        setShowLanding(true); // Switch to LandingPage immediately
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
  }, [rocketPosition, isInMiddle, imageIndex, scrollCount, showLanding]);

  if (showLanding) {
    return <LandingSection goBack={() => setShowLanding(false)} />; // Pass goBack prop
  }

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
