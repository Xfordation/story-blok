import React from "react";
import { storyblokEditable } from "@storyblok/react";
export default function HeroSection({ blok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="relative min-h-screen flex items-center justify-center bg-center bg-cover"
      style={{
        backgroundImage: `url('${blok.image?.filename}')`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {blok.text}
        </h1>
        <a
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          href="/upload-image"
        >
          Go to Upload Page
        </a>
      </div>
    </section>
  );
}
