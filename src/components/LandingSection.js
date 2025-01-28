import React from "react";

const LandingSection = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
      {/* Logo */}
      <div className="mb-4">
        <img
          src="/logo.svg" // Replace with your logo path
          alt="Muvance Logo"
          className="w-32"
        />
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black leading-tight">
          ADVANCING BRANDS BEYOND LIMITS
        </h1>
        <h2 className="text-4xl font-bold text-black">LEAVING LEGACY</h2>
      </div>

      {/* Subheading */}
      <p className="text-gray-500 text-lg text-center max-w-2xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud.
      </p>

      {/* Partner Logos */}
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl py-4">
        {[
          "amazon", "binance", "asus", "archlinux", "etc organic", "la mano", "blacks",
        ].map((brand, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-xl flex items-center justify-center px-8 py-4 h-20 w-40"
          >
            <img
              src={`/brands/${brand}.svg`}
              alt={brand}
              className="h-10 grayscale opacity-60 hover:opacity-100 transition"
            />
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        className="px-6 py-3 text-sm font-medium text-black bg-white border border-black rounded-full hover:bg-black hover:text-white transition"
      >
        Get in Touch
      </button>
    </div>
  );
};

export default LandingSection;
