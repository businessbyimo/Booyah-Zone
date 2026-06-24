import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const TYPING_STRINGS = [
  'চূড়ান্ত যুদ্ধে যোগ দিন',
  'ফ্রি ফায়ার টুর্নামেন্টে অংশ নিন',
  'রিয়েল ক্যাশ পুরস্কার জিতুন',
  'শীর্ষে উঠুন',
];

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [typedText, setTypedText] = useState('');
  const [strIndex, setStrIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Three.js পার্টিকেল ব্যাকগ্রাউন্ড
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    const resize = () => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // পার্টিকেল
    const count = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const r = Math.random();
      if (r < 0.4) { colors[i * 3] = 0.13; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 0.93; }
      else if (r < 0.7) { colors[i * 3] = 0.91; colors[i * 3 + 1] = 0.47; colors[i * 3 + 2] = 0.98; }
      else { colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 0.14; }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      particles.rotation.x += 0.0003;
      particles.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); renderer.dispose(); };
  }, []);

  // টাইপিং অ্যানিমেশন
  useEffect(() => {
    const str = TYPING_STRINGS[strIndex];
    const speed = deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!deleting) {
        setTypedText(str.slice(0, charIndex + 1));
        if (charIndex + 1 === str.length) { setTimeout(() => setDeleting(true), 1800); }
        else setCharIndex(c => c + 1);
      } else {
        setTypedText(str.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) { setDeleting(false); setStrIndex(s => (s + 1) % TYPING_STRINGS.length); }
        else setCharIndex(c => c - 1);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, strIndex]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/30 via-transparent to-dark-900" />
      <div className="grid-pattern absolute inset-0 opacity-30" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6 px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-400 text-sm font-semibold tracking-wider"
          >
            🎮 ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম
          </motion.div>

          {/* লোগো */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
            className="flex justify-center mb-6"
          >
            <img src="/logo-nobg.png" alt="BooyahZone" className="h-28 md:h-36 w-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
          </motion.div>

          <div className="h-16 md:h-20 flex items-center justify-center mb-6">
            <h2 className="font-rajdhani text-2xl md:text-4xl text-cyan-300 font-semibold">
              {typedText}<span className="animate-pulse text-fuchsia-400">|</span>
            </h2>
          </div>

          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            বাংলাদেশের সেরা ফ্রি ফায়ার টুর্নামেন্ট প্ল্যাটফর্ম। রেজিস্টার করুন, প্রতিযোগিতা করুন এবং <span className="text-yellow-400 font-semibold">রিয়েল ক্যাশ পুরস্কার</span> জিতুন!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,211,238,0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-orbitron font-bold px-10 py-4 rounded-xl text-lg tracking-wider shadow-xl"
              >
                ⚔️ এখনই রেজিস্টার করুন
              </motion.button>
            </Link>
            <Link to="/tournaments">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto border-2 border-fuchsia-500 text-fuchsia-400 font-orbitron font-bold px-10 py-4 rounded-xl text-lg tracking-wider hover:bg-fuchsia-500/20 transition-colors"
              >
                🏆 টুর্নামেন্ট দেখুন
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* স্ক্রল ইন্ডিকেটর */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-cyan-400 opacity-60"
        >
          <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyan-400 rounded-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
