import React, { useEffect, useState } from "react";

const MuvanceHomePage = () => {
  const [rocketPosition, setRocketPosition] = useState(-30); // Start below the screen
  const [imageIndex, setImageIndex] = useState(0); // Track the image sequence
  const [rocketImage, setRocketImage] = useState("/rocket.png"); // Default rocket image
  const [isInMiddle, setIsInMiddle] = useState(false); // Flag to check if the rocket is in the middle
  const [scrollCount, setScrollCount] = useState(0); // Count the number of scroll events

  const imageSequenceDown = ["/rocket3.png", "/rocket4.png", "/rocket5.png", "/rocket6.png"];
  const imageSequenceUp = ["/rocket6.png", "/rocket5.png", "/rocket4.png", "/rocket3.png", "/rocket2.png"];

  const handleWheel = (event) => {
    if (event.deltaY > 0) {
      // Scrolling down
      if (rocketPosition === -30) {
        setRocketPosition(20); // Move rocket to the middle
        setRocketImage("/rocket.png"); // Reset to original image
      } else if (isInMiddle && imageIndex < imageSequenceDown.length) {
        setScrollCount(prevCount => prevCount + 1); // Increment scroll count
        if (scrollCount >= 4) { // Change image every 4 scrolls
          setRocketImage(imageSequenceDown[imageIndex]); // Change image
          setImageIndex(imageIndex + 1); // Increment image index for next image
          setScrollCount(0); // Reset scroll count after 4 scrolls
        }
      }
    } else {
      // Scrolling up
      if (rocketImage === "/rocket.png") {
        setRocketPosition(-30); // Move rocket back to the initial position
      } else if (isInMiddle && imageIndex > 0) {
        setScrollCount(prevCount => prevCount + 1); // Increment scroll count
        if (scrollCount >= 4) { // Change image every 4 scrolls
          setRocketImage(imageSequenceUp[imageIndex - 1]); // Change image in reverse sequence
          setImageIndex(imageIndex - 1); // Decrement image index for previous image
          setScrollCount(0); // Reset scroll count after 4 scrolls
        }
        if (imageIndex === 1) {
          setRocketImage("/rocket.png"); // Reset to the original rocket image when reaching rocket2.png
          setImageIndex(0); // Reset the image index
        }
      }
      // Don't move the rocket position when scrolling up from the middle
    }
  };

  const handleTransitionEnd = () => {
    if (rocketPosition === 20) {
      setIsInMiddle(true); // Set the middle flag when the rocket reaches the middle
    } else if (rocketPosition === -30) {
      setRocketImage("/rocket.png"); // Reset image when rocket is back at the start
    }
  };

  useEffect(() => {
    // Add wheel event listener when the component mounts
    window.addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [rocketPosition, isInMiddle, imageIndex, scrollCount]); // Include scrollCount in the dependency array

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
        src={rocketImage} // Dynamically change the rocket image based on state
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
        onTransitionEnd={handleTransitionEnd} // Trigger handleTransitionEnd once animation is finished
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
