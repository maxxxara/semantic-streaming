import React from "react";
import type { ICard } from "./App";

function Card({ country, city, note, activities }: ICard) {
  return (
    <div className="group relative max-w-sm">
      {/* Outer glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-2xl p-8 overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:rotate-1">
        {/* Animated background patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full animate-spin"></div>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Header with enhanced location pin */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <svg
                className="w-5 h-5 text-blue-400 drop-shadow-lg animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full blur-sm opacity-50"></div>
            </div>
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {country}
            </span>
          </div>

          {/* Enhanced star with glow */}
          <div className="relative">
            <svg
              className="w-7 h-7 text-yellow-400 drop-shadow-lg animate-spin"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ animationDuration: "3s" }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="absolute inset-0 w-7 h-7 bg-yellow-400 rounded-full blur-md opacity-60"></div>
          </div>
        </div>

        {/* City name with gradient and enhanced typography */}
        <div className="relative z-10 mb-6">
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg transform transition-all duration-300 group-hover:scale-110">
            {city}
          </h2>
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>

        {/* Enhanced description with better typography */}
        <div className="relative z-10 mb-8">
          <p className="text-gray-200 text-base leading-relaxed font-light backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 shadow-inner">
            {note}
          </p>
        </div>

        {/* Activities section with enhanced styling */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Activities
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {activities.map((activity, index) => (
              <span
                key={activity}
                className="relative group/tag bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm text-gray-100 px-4 py-2 rounded-full text-sm font-medium border border-white/20 shadow-lg transform transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-purple-600/80 hover:to-pink-600/80 cursor-pointer animate-pulse"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {activity}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300"></div>
              </span>
            ))}
          </div>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-xl -translate-y-10 translate-x-10 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/15 via-cyan-500/15 to-purple-500/15 rounded-full blur-lg translate-y-8 -translate-x-8 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Corner accent */}
        <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-3 left-3 w-2 h-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

export default Card;
