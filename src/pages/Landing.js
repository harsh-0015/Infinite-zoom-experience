// src/pages/Landing.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Landing.css";
import CardDemo from "../components/CardDemo";

const PARTICLE_COUNT = 24;
const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: 10 + Math.random() * 60,
  size: 1 + Math.random() * 3,
  delay: Math.random() * 6
}));

// Variants for coordinating enter/exit animations
const containerVariants = {
  enter: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.06 }
  },
  exit: {
    opacity: 0,
    transition: { when: "afterChildren", staggerChildren: 0.04, duration: 0.55 }
  }
};

const heroVariants = {
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -18, scale: 0.98, transition: { duration: 0.45 } }
};

const horizonVariants = {
  enter: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: 28, transition: { duration: 0.45 } }
};

const particlesVariants = {
  enter: { opacity: 1, transition: { staggerChildren: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.35 } }
};

export default function Landing() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  const handleStart = () => {
    // trigger exit animation, navigation happens in onAnimationComplete
    setExiting(true);
  };

  return (
    <motion.div
      className="landing"
      variants={containerVariants}
      initial="enter"
      animate={exiting ? "exit" : "enter"}
      onAnimationComplete={() => {
        if (exiting) navigate("/experience");
      }}
    >
      <div className="overlay" />

      {/* HERO */}
      <motion.div className="hero" variants={heroVariants}>
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="landing-title"
        >
          Think better with <span className="accent">Infinite Zoom</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          className="landing-sub"
        >
          Never miss a note, idea or connection. An endless journey through generative dimensions.
        </motion.p>

        <motion.button
          className="start-btn"
          onClick={handleStart}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          disabled={exiting}
          aria-disabled={exiting}
        >
          Start
        </motion.button>
      </motion.div>

      {/* Add card here */}
<CardDemo />

      {/* HORIZON / ARC + REFLECTION */}
      <motion.div className="horizon" variants={horizonVariants}>
        <svg
          className="glowArc"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <radialGradient id="arcGradient" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#9b5cff" stopOpacity="1" />
              <stop offset="40%" stopColor="#7c3aed" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#4cc9f0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="hGlow" x1="0" x2="1">
              <stop offset="0" stopColor="#7c3aed" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#9b5cff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <path
            className="arcPath"
            d="M0,200 C300,40 900,40 1200,200 L1200,300 L0,300 Z"
            fill="url(#arcGradient)"
            opacity="0.98"
          />

          <rect x="0" y="196" width="1200" height="6" fill="url(#hGlow)" opacity="0.9" />
        </svg>

        <svg
          className="glowReflection"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <mask id="fadeMask">
              <linearGradient id="lm" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <rect x="0" y="0" width="1200" height="300" fill="url(#lm)" />
            </mask>
          </defs>

          <g mask="url(#fadeMask)" transform="scale(1,-1) translate(0,-300)">
            <path
              d="M0,200 C300,40 900,40 1200,200 L1200,300 L0,300 Z"
              fill="url(#arcGradient)"
              opacity="0.9"
              className="arcReflection"
            />
            <rect x="0" y="196" width="1200" height="6" fill="url(#hGlow)" opacity="0.8" />
          </g>
        </svg>
      </motion.div>

      {/* PARTICLES */}
      <motion.div className="particles" variants={particlesVariants} aria-hidden>
        {particles.map(p => (
          <span
            className="dot"
            key={p.id}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
