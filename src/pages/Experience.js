/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

const InfiniteZoomExperience = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  const layersRef = useRef([]);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const touchRef = useRef({ x: 0, y: 0, active: false });
  const cycleCountRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(new Uint8Array(0));
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [controls, setControls] = useState({
    speed: 1,
    autoZoom: true,
    mouseControl: true
  });
  const [depth, setDepth] = useState(0);
  const [zone, setZone] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);

//   const [showZoomImage, setShowZoomImage] = useState(false);
//   const [currentZoomImage, setCurrentZoomImage] = useState('');

//   // Add the zoomImages array here:
//   const zoomImages = [
//     '/assets/zoom-image-1.jpg',
//     '/assets/zoom-image-2.jpg',
//     '/assets/zoom-image-3.jpg',
//     '/assets/zoom-image-4.jpg',
//     '/assets/zoom-image-5.jpg',
//     '/assets/zoom-image-6.jpg',
//   ];

  const createSpiralPattern = (ctx, size, hue, depth, audioEnergy = 0) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
    
    for (let i = 0; i < 10; i++) {
      gradient.addColorStop(i / 10, `hsl(${hue + i * 10}, 70%, ${50 + i * 3}%)`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add spiral lines, more with depth and audio
    ctx.strokeStyle = `hsl(${hue + 180}, 80%, 80%)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let angle = 0; angle < Math.PI * (20 + Math.min(depth * 2, 40) + audioEnergy / 10); angle += 0.1) {
      const radius = angle * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Recursion for infinite detail at high depth
    if (depth > 5 && depth % 2 === 0) {
      ctx.save();
      ctx.translate(centerX / 2, centerY / 2);
      createSpiralPattern(ctx, size / 2, hue + 30, depth - 1, audioEnergy);
      ctx.restore();
    }
    
    // Add central portal
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const createFractalPattern = (ctx, size, hue, depth, audioEnergy = 0) => {
    ctx.fillStyle = `hsl(${hue}, 40%, 20%)`;
    ctx.fillRect(0, 0, size, size);
    
    const drawBranch = (x, y, length, angle, branchDepth) => {
      if (branchDepth === 0 || length < 2) return;
      
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      ctx.strokeStyle = `hsl(${hue + branchDepth * 20}, 70%, ${60 + branchDepth * 5}%)`;
      ctx.lineWidth = branchDepth;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      drawBranch(endX, endY, length * 0.7, angle - 0.5, branchDepth - 1);
      drawBranch(endX, endY, length * 0.7, angle + 0.5, branchDepth - 1);
    };
    
    drawBranch(size / 2, size, size / 4, -Math.PI / 2, 8 + Math.min(depth, 5) + Math.floor(audioEnergy / 50));
    
    // Meta overlay at high depth
    if (depth > 10) {
      createTunnelPattern(ctx, size / 2, hue + 60, depth / 2, audioEnergy);
    }
    
    // Add central tunnel
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/4);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  };

  const createGeometricPattern = (ctx, size, hue, depth, audioEnergy = 0) => {
    ctx.fillStyle = `hsl(${hue}, 50%, 15%)`;
    ctx.fillRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Draw concentric shapes, more with depth and audio
    for (let i = 0; i < 12 + Math.min(depth * 2, 24) + Math.floor(audioEnergy / 20); i++) {
      const radius = (i + 1) * 20;
      const sides = 6 + (i % 3);
      
      ctx.strokeStyle = `hsl(${hue + i * 15}, 80%, ${40 + i * 3}%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let j = 0; j <= sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // Central void
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  const createOrganicPattern = (ctx, size, hue, depth, audioEnergy = 0) => {
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, `hsl(${hue}, 60%, 40%)`);
    gradient.addColorStop(0.7, `hsl(${hue + 40}, 70%, 25%)`);
    gradient.addColorStop(1, `hsl(${hue + 80}, 50%, 10%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Draw organic flowing lines, more with depth and audio
    for (let i = 0; i < 20 + Math.min(depth * 3, 60) + Math.floor(audioEnergy / 10); i++) {
      ctx.strokeStyle = `hsl(${hue + i * 18}, 70%, ${50 + (i % 4) * 10}%)`;
      ctx.lineWidth = 3 + Math.random() * 3;
      ctx.beginPath();
      
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      ctx.moveTo(startX, startY);
      
      for (let j = 0; j < 20 + Math.min(depth, 10) + Math.floor(audioEnergy / 20); j++) {
        const x = startX + Math.sin(j * 0.3 + i) * 50 + Math.random() * 20;
        const y = startY + Math.cos(j * 0.2 + i) * 50 + Math.random() * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // Central portal
    const portalGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, 30);
    portalGradient.addColorStop(0, 'rgba(0,0,0,1)');
    portalGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = portalGradient;
    ctx.fillRect(0, 0, size, size);
  };

  const createTunnelPattern = (ctx, size, hue, depth, audioEnergy = 0) => {
    ctx.fillStyle = `hsl(${hue}, 30%, 5%)`;
    ctx.fillRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Create tunnel effect with multiple rings, more with depth and audio
    for (let i = 0; i < 15 + Math.min(depth, 15) + Math.floor(audioEnergy / 30); i++) {
      const radius = i * 25 + 10;
      const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 15);
      gradient.addColorStop(0, `hsl(${hue + i * 25}, 60%, ${30 + i * 2}%)`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Recursion for detail
    if (depth > 8) {
      ctx.save();
      ctx.translate(centerX / 2, centerY / 2);
      createTunnelPattern(ctx, size / 2, hue + 45, depth - 2, audioEnergy);
      ctx.restore();
    }
    
    // Central black hole
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const createVoronoiPattern = (ctx, size, hue, depth, audioEnergy = 0) => {
    const points = [];
    const pointCount = Math.min(50 + depth * 10 + audioEnergy / 5, 200); // More points with depth and audio
    for (let i = 0; i < pointCount; i++) {
      points.push({ x: Math.random() * size, y: Math.random() * size });
    }
    ctx.fillStyle = `hsl(${hue}, 30%, 10%)`;
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 2) { // Optimize with skip
      for (let x = 0; x < size; x += 2) {
        let minDist = Infinity, closest = 0;
        for (let i = 0; i < points.length; i++) {
          const dist = Math.hypot(points[i].x - x, points[i].y - y);
          if (dist < minDist) { minDist = dist; closest = i; }
        }
        const lightness = 30 + (closest % 10) * 5;
        ctx.fillStyle = `hsl(${hue + closest * 10}, 60%, ${lightness}%)`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Meta overlay
    if (depth > 15) {
      createOrganicPattern(ctx, size / 3, hue + 120, depth / 3, audioEnergy);
    }

    // Central portal
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  // Zone groups for narrative progression (moved after pattern functions)
  const zonePatterns = [
    [createGeometricPattern, createVoronoiPattern], // Zone 0: Cellular/Geometric
    [createOrganicPattern, createSpiralPattern],    // Zone 1: Organic
    [createFractalPattern, createTunnelPattern]     // Zone 2: Fractal/Cosmic
  ];

  // Create procedural textures for our zoom layers
  const createProceduralTexture = useCallback((layerIndex, size = 512, depth = 0) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create unique patterns for each layer
    const hue = (layerIndex * 60) % 360;
    const currentPatterns = zonePatterns[zone % zonePatterns.length];
    const patternFunc = currentPatterns[layerIndex % currentPatterns.length];

    // Compute average audio energy for reactivity
    let audioEnergy = 0;
    if (audioEnabled && analyserRef.current) {
      analyserRef.current.getByteFrequencyData(audioDataRef.current);
      for (let i = 0; i < audioDataRef.current.length; i++) {
        audioEnergy += audioDataRef.current[i];
      }
      audioEnergy /= audioDataRef.current.length; // Average
    }

    patternFunc(ctx, size, hue, depth, audioEnergy);

    // Meta-pattern overlay (unlock at depth > 5)
    if (depth > 5 && Math.random() > 0.5) {
      const subPattern = zonePatterns[(zone + 1) % zonePatterns.length][0]; // Next zone's pattern as sub
      ctx.save();
      ctx.translate(size / 4, size / 4);
      subPattern(ctx, size / 2, hue + 90, Math.floor(depth / 2), audioEnergy);
      ctx.restore();
    }

    // Mystery element (rare, 5% chance, unlock at depth > 10)
    if (depth > 10 && Math.random() < 0.05) {
      // Add glowing particles as mystery
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = `hsl(${hue + 180}, 100%, 80%)`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [zone, zonePatterns, audioEnabled]);

  const initThreeJS = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup - perspective for depth
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);

    // Create zoom layers
    const layers = [];
    const layerCount = 8;
    
    for (let i = 0; i < layerCount; i++) {
      const texture = createProceduralTexture(i, undefined, depth);
      const geometry = new THREE.PlaneGeometry(20, 20);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = -i * 15; // Space layers along Z-axis
      mesh.userData = { 
        originalZ: -i * 15,
        layerIndex: i,
        scale: 1
      };
      
      scene.add(mesh);
      layers.push(mesh);
    }
    
    layersRef.current = layers;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (!controls.autoZoom && !controls.mouseControl) return;
      
      // Mouse/touch influence
      let speedMultiplier = controls.speed;
      if (controls.mouseControl) {
        const mouseInfluence = Math.sqrt(mouseRef.current.x ** 2 + mouseRef.current.y ** 2);
        speedMultiplier += mouseInfluence * 0.5;
      }
      
      // Update layer positions for infinite zoom
      layers.forEach((layer, index) => {
        layer.position.z += 0.1 * speedMultiplier;
        
        // Reset layer when it passes the camera
        if (layer.position.z > 10) {
          layer.position.z = -((layerCount - 1) * 15);
          
          cycleCountRef.current++;
          if (cycleCountRef.current >= layerCount) { // Full cycle completed
            setDepth(prev => prev + 1);
            cycleCountRef.current = 0;
            if ((depth + 1) % 10 === 0) {
              setZone(prev => prev + 1); // Advance to next zone
            }
          }
          
          // Regenerate texture for variety, with depth
          if (Math.random() > 0.7) {
            const newTexture = createProceduralTexture(Math.floor(Math.random() * 6), undefined, depth);
            layer.material.map.dispose();
            layer.material.map = newTexture;
          }
        }
        
        // Scale effect for depth illusion
        const distanceFromCamera = Math.abs(layer.position.z - camera.position.z);
        const scale = Math.max(0.1, 1 + (10 - distanceFromCamera) * 0.1);
        layer.scale.setScalar(scale);
        
        // Fade out distant layers
        const opacity = Math.max(0, Math.min(1, (20 - distanceFromCamera) / 20));
        layer.material.opacity = opacity;
      });
      
      // Subtle camera movement based on mouse
      if (controls.mouseControl) {
        camera.rotation.x = mouseRef.current.y * 0.1;
        camera.rotation.y = mouseRef.current.x * 0.1;
      }

      // Audio analysis and visual sync
      if (audioEnabled && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(audioDataRef.current);
        let lowFreqEnergy = 0;
        for (let i = 0; i < 10; i++) { // Low freq bins for bass/beats
          lowFreqEnergy += audioDataRef.current[i];
        }
        lowFreqEnergy /= 10; // Average

        // Detect beat (simple threshold)
        const beatThreshold = 100;
        if (lowFreqEnergy > beatThreshold) {
          // Sync: Pulse speed and scale on beat
          speedMultiplier *= 1.2; // Temporary boost
          layers.forEach(layer => {
            layer.scale.setScalar(layer.scale.x * 1.05); // Pulse scale
          });
          // Regenerate patterns on beat for reactivity (occasionally)
          if (Math.random() > 0.8) {
            layers.forEach(layer => {
              const newTexture = createProceduralTexture(layer.userData.layerIndex, undefined, depth);
              layer.material.map.dispose();
              layer.material.map = newTexture;
            });
          }
        }
      }
      
      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);
  }, [createProceduralTexture, depth, controls.autoZoom, controls.mouseControl, controls.speed, audioEnabled]);

  useEffect(() => {
  // Create AudioContext once
  if (!audioContextRef.current) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioCtx;

    // Gain node for volume control
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);

    // Analyser for beat/frequency detection
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(masterGain);
    analyserRef.current = analyser;
    audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);

    // Load and play audio only once
    fetch('/assets/background-music.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => audioCtx.decodeAudioData(buf))
      .then(audioBuffer => {
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(analyser);
        source.start();
        source.current = source; // store source if needed
      })
      .catch(err => console.error("Error loading audio:", err));
  }

  const audioCtx = audioContextRef.current;

  if (audioEnabled) {
    audioCtx.resume();
  } else {
    audioCtx.suspend();
  }

  // Adjust volume live
  if (audioCtx && audioCtx.state !== "closed") {
    const gainNode = audioCtx.destination?.gainNode;
    if (gainNode) gainNode.gain.value = volume;
  }

  return () => {
    // Don’t auto-close here, keep it alive across toggles
    // Optional: close when component unmounts
    // audioCtx.close();
  };
}, [audioEnabled, volume]);



  // Handle mouse movement
  const handleMouseMove = useCallback((event) => {
    if (!controls.mouseControl) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [controls.mouseControl]);

  // Handle touch events
  const handleTouchMove = useCallback((event) => {
    event.preventDefault();
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      touchRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      touchRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      touchRef.current.active = true;
      
      if (controls.mouseControl) {
        mouseRef.current = { ...touchRef.current };
      }
    }
  }, [controls.mouseControl]);

  const handleTouchEnd = useCallback(() => {
    touchRef.current.active = false;
    mouseRef.current = { x: 0, y: 0 };
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Keyboard controls
  const handleKeyPress = useCallback((event) => {
    switch (event.key.toLowerCase()) {
      case ' ':
        event.preventDefault();
        setControls(prev => ({ ...prev, autoZoom: !prev.autoZoom }));
        break;
      case 'm':
        setControls(prev => ({ ...prev, mouseControl: !prev.mouseControl }));
        break;
      case 'a':
        setAudioEnabled(!audioEnabled);
        break;
      case 'arrowup':
        event.preventDefault();
        setControls(prev => ({ ...prev, speed: Math.min(3, prev.speed + 0.2) }));
        break;
      case 'arrowdown':
        event.preventDefault();
        setControls(prev => ({ ...prev, speed: Math.max(0.1, prev.speed - 0.2) }));
        break;
      default:
        // No action for other keys
        break;
    }
  }, [audioEnabled]);

  useEffect(() => {
    const currentMount = mountRef.current;
    initThreeJS();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (rendererRef.current && currentMount) {
        currentMount.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      // Cleanup textures
      layersRef.current.forEach(layer => {
        if (layer.material.map) {
          layer.material.map.dispose();
        }
        layer.material.dispose();
        layer.geometry.dispose();
      });
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [initThreeJS, handleResize, handleKeyPress]);

  return (
  <div className="relative w-full h-screen bg-black overflow-hidden">
    {/* Loading Screen */}
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-mono">Generating Infinite Dimensions...</p>
        </div>
      </div>
    )}

    {/* Three.js Canvas Container */}
    <div
      ref={mountRef}
      className="absolute inset-0 cursor-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }}
    />

    {/* Zoom Image (conditionally rendered) */}
    {/* {showZoomImage && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
        <img
          src={currentZoomImage}
          alt="Zoom Effect"
          className="w-32 h-32 opacity-100 animate-fadeOut"
        />
      </div>
    )} */}

    {/* Control Panel */}
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm text-white p-4 rounded-lg border border-gray-700 font-mono text-sm z-50">
      <h3 className="text-lg font-bold mb-3 text-blue-400">Infinite Zoom Control</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-gray-300">Auto Zoom</label>
          <button
            onClick={() => setControls((prev) => ({ ...prev, autoZoom: !prev.autoZoom }))}
            className={`px-3 py-1 rounded ${
              controls.autoZoom ? "bg-blue-600" : "bg-gray-600"
            } transition-colors`}
          >
            {controls.autoZoom ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-300">Mouse Control</label>
          <button
            onClick={() => setControls((prev) => ({ ...prev, mouseControl: !prev.mouseControl }))}
            className={`px-3 py-1 rounded ${
              controls.mouseControl ? "bg-green-600" : "bg-gray-600"
            } transition-colors`}
          >
            {controls.mouseControl ? "ON" : "OFF"}
          </button>
        </div>

        <div>
          <label className="text-gray-300 block mb-1">
            Speed: {controls.speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={controls.speed}
            onChange={(e) =>
              setControls((prev) => ({ ...prev, speed: parseFloat(e.target.value) }))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-300">Audio</label>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-1 rounded ${
              audioEnabled ? "bg-purple-600" : "bg-gray-600"
            } transition-colors`}
          >
            {audioEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div>
          <label className="text-gray-300 block mb-1">Volume: {volume.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>

    {/* Instructions Panel */}
    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm text-white p-4 rounded-lg border border-gray-700 font-mono text-sm max-w-xs z-50">
      <h4 className="text-blue-400 font-bold mb-2">Controls</h4>
      <div className="space-y-1 text-xs text-gray-300">
        <p>
          <span className="text-white">SPACE</span> - Toggle auto zoom
        </p>
        <p>
          <span className="text-white">M</span> - Toggle mouse control
        </p>
        <p>
          <span className="text-white">A</span> - Toggle audio
        </p>
        <p>
          <span className="text-white">↑/↓</span> - Adjust speed
        </p>
        <p>
          <span className="text-white">MOUSE</span> - Look around
        </p>
        <p>
          <span className="text-white">TOUCH</span> - Mobile control
        </p>
      </div>
    </div>

    {/* Performance Info with Depth/Zone */}
    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded font-mono text-xs z-50">
      <div className="text-green-400">WebGL Accelerated</div>
      <div className="text-blue-400">60 FPS Target</div>
      <div className="text-purple-400">Infinite Loop Active</div>
      <div className="text-yellow-400">Depth: {depth} | Zone: {zone}</div>
    </div>

    {/* Creative Title */}
    <div className="absolute bottom-4 left-4 text-white font-mono z-50">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        ∞ DIMENSIONAL DRIFT ∞
      </h1>
      <p className="text-sm text-gray-400 mt-1">
        An infinite journey through procedural dimensions
      </p>
    </div>
  </div>
);
};
export default InfiniteZoomExperience;