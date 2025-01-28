import React, { useEffect } from "react";

const LandingSection = ({ goBack }) => {
  const handleWheel = (event) => {
    if (event.deltaY < 0) {
      goBack(); // Trigger goBack when scrolling up
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8 bg-white relative">
      {/* Logo */}
      <div className="w-full max-w-4xl flex justify-start">
        <h1 className="text-2xl font-black tracking-wide">MUVANCE</h1>
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-black mt-6 leading-tight">
        ADVANCING BRANDS BEYOND LIMITS
        <br /> LEAVING LEGACY
      </h1>

      {/* Subheading */}
      <p className="text-lg font-semibold text-gray-500 max-w-2xl mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud.
      </p>

      {/* Logo Row */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 w-full max-w-5xl">
        {[
          "la mano",
          "amazon",
          "BINANCE",
          "etc organic",
          "ASUS",
          "Blacks",
          "archlinux",
        ].map((logo, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-2xl px-6 py-3 flex items-center justify-center text-gray-400 font-semibold text-lg w-36 h-16"
          >
            {logo}
          </div>
        ))}
      </div>

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

export default LandingSection;
