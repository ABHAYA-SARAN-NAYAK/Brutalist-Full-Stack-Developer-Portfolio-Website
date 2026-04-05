import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'motion/react';
import { ExternalLink, Code, Github, Linkedin, Mail, Menu, X, ArrowUpRight } from 'lucide-react';

// --- Components ---

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      const dx = mousePos.x - cursorRef.current.x;
      const dy = mousePos.y - cursorRef.current.y;
      cursorRef.current.x += dx * 0.15;
      cursorRef.current.y += dy * 0.15;
      
      const el = document.getElementById('custom-cursor');
      if (el) {
        el.style.left = `${cursorRef.current.x}px`;
        el.style.top = `${cursorRef.current.y}px`;
      }
      requestAnimationFrame(animate);
    };
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [mousePos]);

  return (
    <div id="custom-cursor" className="cursor-crosshair hidden md:block" />
  );
};

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="mb-20"
    >
      <h2 className="text-8xl md:text-9xl text-brand-black">
        {children}
        {subtitle && <span className="text-brand-red block md:inline md:ml-4">{subtitle}</span>}
      </h2>
    </motion.div>
  );
};

const TechBadge = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <span {...props} className="text-xs font-bold border border-brand-black px-2 py-1 uppercase font-mono">
    {children}
  </span>
);

const ProjectCard = ({ number, title, description, tags, index, ...props }: { 
  number: string; 
  title: string; 
  description: string; 
  tags: string[];
  index: number;
  [key: string]: any;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotate({
      x: (y - centerY) / 10,
      y: (centerX - x) / 10
    });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="perspective-1000"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y, scale: rotate.x !== 0 ? 1.02 : 1 }}
        className="bg-white border-[3px] border-brand-red p-8 shadow-hard-large group transition-shadow hover:shadow-[12px_12px_0px_0px_#FB3640]"
      >
        <div className="flex justify-between items-start mb-6">
          <span className="text-5xl text-brand-red font-display">{number}</span>
          <div className="flex gap-2">
            {tags.map(tag => <TechBadge key={tag}>{tag}</TechBadge>)}
          </div>
        </div>
        <h3 className="text-5xl mb-4 group-hover:text-brand-red transition-colors font-display">
          {title}
        </h3>
        <p className="font-mono text-lg mb-8 text-brand-black/80">
          {description}
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-brand-red font-bold underline hover:no-underline flex items-center gap-2 btn-press font-mono">
            LIVE DEMO <ArrowUpRight size={18} />
          </a>
          <a href="#" className="text-brand-black font-bold underline hover:no-underline flex items-center gap-2 btn-press font-mono">
            GITHUB <Code size={18} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatItem = ({ target, label }: { target: number; label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <div ref={ref} className="flex-1 min-w-[200px] border-l-4 border-brand-black pl-8">
      <div className="text-[120px] font-display text-brand-black leading-none">
        {count.toString().padStart(2, '0')}
      </div>
      <div className="text-xl font-bold font-mono text-brand-black uppercase">
        {label}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen selection:bg-brand-red selection:text-white">
      <CustomCursor />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-red z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white border-b-2 border-brand-red">
        <div className="text-[28px] font-bold tracking-[0.05em] uppercase text-brand-red font-display">
          ABHAYA
        </div>
        
        <div className="hidden md:flex gap-10">
          {['work', 'skills', 'experience', 'contact'].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className="text-brand-black tracking-[0.1em] font-medium hover:text-brand-red transition-colors duration-200 uppercase font-ui"
            >
              {item}
            </a>
          ))}
        </div>

        <button 
          className="md:hidden text-brand-red"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-8 md:hidden"
          >
            <div className="flex flex-col gap-8">
              {['work', 'skills', 'experience', 'contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-5xl font-display text-brand-black hover:text-brand-red"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-24 pt-20 overflow-hidden" id="hero">
        <div className="max-w-7xl w-full">
          <motion.h1 
            className="flex flex-col leading-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.span 
              className="text-[120px] md:text-[200px] text-brand-black"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              FULL
            </motion.span>
            <motion.span 
              className="text-[120px] md:text-[200px] text-brand-red"
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              STACK.
            </motion.span>
            <motion.span 
              className="text-[120px] md:text-[200px] text-brand-black"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              DEVELOPER.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mt-8 max-w-2xl font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Building interfaces. Shipping backends. Breaking things beautifully.
          </motion.p>

          <motion.div 
            className="flex flex-wrap gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <a href="#work" className="bg-brand-red text-white px-10 py-4 font-bold technical-stroke shadow-hard hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_#0D0D0D] transition-all btn-press font-mono">
              VIEW WORK
            </a>
            <a href="#" className="bg-white text-brand-red px-10 py-4 font-bold border-2 border-brand-red shadow-hard hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_#0D0D0D] transition-all btn-press font-mono">
              DOWNLOAD CV
            </a>
          </motion.div>
        </div>

        {/* Tech Marquee */}
        <div className="absolute bottom-12 left-0 w-full overflow-hidden border-y-2 border-brand-red py-4 bg-white rotate-[-1deg]">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-8 items-center px-4">
                {['REACT', 'NODE.JS', 'TYPESCRIPT', 'NEXT.JS', 'POSTGRESQL', 'DOCKER', 'AWS', 'PYTHON'].map((tech) => (
                  <span key={tech} className="text-brand-red font-bold text-xl border-2 border-brand-red px-4 py-1 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-8 md:px-24 bg-white grid md:grid-cols-2 gap-20 items-center border-t-2 border-brand-black">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-8xl md:text-9xl mb-10 text-brand-black font-display">ABOUT ME</h2>
          <p className="text-lg md:text-xl leading-relaxed font-mono mb-8 text-brand-black">
            I am a focused engineer dedicated to the craft of digital construction. My approach combines the structural integrity of backend systems with the pixel-perfect precision of modern frontend frameworks. I don't just write code; I design systems that scale and experiences that resonate.
          </p>
          <div className="flex flex-wrap gap-4">
            {['SYSTEM ARCHITECTURE', 'API DESIGN', 'UI/UX STRATEGY', 'CLOUD OPS'].map(skill => (
              <span key={skill} className="border-2 border-brand-red px-4 py-2 font-bold text-brand-red hover:bg-brand-red hover:text-white transition-colors cursor-default font-mono text-sm">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="relative group"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="aspect-square bg-gray-100 overflow-hidden technical-stroke shadow-hard-red group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform duration-300">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKAj1BlaigaubF2c-Ik19tyjt3mwtU1ThqD7WDP2N50W-YaofUQwuGXS0PUrQ2ekZF2sg-Fejb2KBYhizBqJtBd-3rLYnqB-ThiUhmVIFHw8fMaSzSbg4fFJq99xpevQ_P5Fe-QQyQTMoisFC3PC3wSwbqGc3dghl3TCR7WQsx5DrLpxGGKynkBcX9kF8lw-ks4DKqIa0bAUOHy5GaWqhycpxLlC4HnaWA2-3tpfWuJOqX_z_3fQAxBvSlsZqr_4qQGreUPc2grzA" 
              alt="Developer Portrait" 
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Skills Section */}
      <section className="py-32 px-8 md:px-24 bg-[#F5F5F5] border-y-2 border-brand-black" id="skills">
        <SectionHeading>TECHNICAL SKILLS</SectionHeading>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: 'FRONTEND', skills: ['React & Next.js', 'Tailwind CSS', 'TypeScript', 'Framer Motion', 'Webpack / Vite'] },
            { title: 'BACKEND', skills: ['Node.js / Express', 'Python / Django', 'PostgreSQL / MongoDB', 'Redis Caching', 'GraphQL / REST APIs'] },
            { title: 'DEVOPS', skills: ['AWS (EC2, S3, RDS)', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Terraform (IaC)', 'Linux SysAdmin'] }
          ].map((cat, i) => (
            <motion.div 
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 border-t-[3px] border-brand-red flex flex-col shadow-hard transition-transform hover:scale-[1.02]"
            >
              <h3 className="text-4xl text-brand-red mb-8 font-display">{cat.title}</h3>
              <ul className="space-y-4 font-mono text-lg">
                {cat.skills.map(skill => (
                  <li key={skill} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-brand-red"></span> {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-32 px-8 md:px-24 bg-white" id="work">
        <SectionHeading subtitle="WORK">SELECTED</SectionHeading>
        <div className="grid md:grid-cols-2 gap-16">
          {[
            { number: '01', title: 'CRYPTO-ENGINE', tags: ['REACT', 'REDIS'], desc: 'High-frequency trading engine dashboard with real-time data streaming and predictive analytics. Focused on sub-100ms latency updates.' },
            { number: '02', title: 'VISION-SYNC', tags: ['PYTHON', 'AWS'], desc: 'Distributed image processing pipeline utilizing AWS Lambda and S3 for automated content moderation and metadata extraction.' },
            { number: '03', title: 'NEURAL-GRID', tags: ['NODE.JS', 'DOCKER'], desc: 'A peer-to-peer computing network for training small-scale neural networks across browser instances using WebRTC.' },
            { number: '04', title: 'ATLAS-CORE', tags: ['NEXT.JS', 'POSTGRES'], desc: 'Enterprise-grade inventory management system with automated supply chain forecasting and low-stock alerts.' }
          ].map((proj, i) => (
            <ProjectCard 
              key={proj.number}
              number={proj.number}
              title={proj.title}
              tags={proj.tags}
              description={proj.desc}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-red py-24 border-y-4 border-brand-black" id="stats">
        <div className="flex flex-wrap justify-between px-8 md:px-24 gap-12">
          <StatItem target={10} label="PROJECTS COMPLETED" />
          <StatItem target={6} label="HACKATHONS" />
          <StatItem target={3} label="FIRST PLACE WINS" />
          <StatItem target={2} label="YEARS EXPERIENCE" />
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-32 px-8 md:px-24 bg-white overflow-hidden" id="experience">
        <SectionHeading>EXPERIENCE</SectionHeading>
        <div className="relative ml-8">
          <div className="absolute left-0 top-0 w-1 bg-brand-red h-full" />
          {[
            { date: '2023 - PRESENT', role: 'SENIOR FULL-STACK ENGINEER / TECHNOVA', bullets: ['Architected and deployed microservices handling 50k+ daily users.', 'Led a team of 4 developers through three major product launches.', 'Reduced infrastructure costs by 30% via Docker optimization.'] },
            { date: '2022 - 2023', role: 'BACKEND DEVELOPER / DATA-STRUX', bullets: ['Built highly scalable RESTful APIs using Node.js and PostgreSQL.', 'Implemented Redis caching layers reducing query times by 40%.', 'Developed automated testing suites with 95% code coverage.'] },
            { date: '2021 - 2022', role: 'FRONTEND INTERN / PIXEL-PERFECT', bullets: ['Collaborated on responsive UI components for e-commerce platforms.', 'Optimized web assets for performance and SEO compliance.', 'Integrated third-party APIs for payment and auth flows.'] }
          ].map((exp, i) => (
            <motion.div 
              key={i}
              className="relative pl-12 mb-20 group"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute left-[-8px] top-4 w-4 h-4 bg-brand-red transform rotate-45 border-2 border-brand-black" />
              <div className="text-5xl text-brand-red font-display mb-2">{exp.date}</div>
              <div className="text-2xl font-bold font-ui mb-4 uppercase tracking-wider">{exp.role}</div>
              <ul className="space-y-3 font-mono text-brand-black/70 max-w-2xl text-base">
                {exp.bullets.map((b, j) => <li key={j}>- {b}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-8 md:px-24 bg-[#F5F5F5] border-t-2 border-brand-black" id="contact">
        <div className="grid md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-8xl md:text-9xl leading-none mb-12 font-display">
              LETS BUILD <span className="text-brand-red">SOMETHING</span>
            </h2>
            <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
              {[
                { label: 'Your name:', type: 'text' },
                { label: 'Your email:', type: 'email' },
                { label: 'Mission details:', type: 'textarea' }
              ].map(field => (
                <div key={field.label} className="flex flex-col">
                  <label className="font-mono text-sm uppercase mb-2 tracking-widest">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea className="bg-white border-b-4 border-brand-red border-t-0 border-l-0 border-r-0 px-4 py-4 text-xl focus:ring-0 focus:outline-none focus:bg-white/50 transition-colors font-mono" rows={4} />
                  ) : (
                    <input className="bg-white border-b-4 border-brand-red border-t-0 border-l-0 border-r-0 px-4 py-4 text-xl focus:ring-0 focus:outline-none focus:bg-white/50 transition-colors font-mono" type={field.type} />
                  )}
                </div>
              ))}
              <button className="bg-brand-red text-white font-display text-4xl px-12 py-6 technical-stroke shadow-hard hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_#0D0D0D] transition-all btn-press">
                SEND MESSAGE
              </button>
            </form>
          </div>
          
          <div className="flex flex-col justify-center items-start md:items-end gap-12">
            <div className="space-y-8 flex flex-col items-start md:items-end">
              {[
                { label: 'GITHUB', icon: <Github size={24} /> },
                { label: 'LINKEDIN', icon: <Linkedin size={24} /> },
                { label: 'EMAIL', icon: <Mail size={24} /> }
              ].map(social => (
                <a 
                  key={social.label}
                  href="#" 
                  className="group relative flex items-center gap-4 border-2 border-brand-red px-8 py-4 text-brand-red font-bold hover:bg-brand-red hover:text-white transition-all text-2xl tracking-widest btn-press font-mono"
                >
                  {social.label} {social.icon}
                </a>
              ))}
            </div>
            <div className="mt-20 text-brand-red font-mono font-bold text-right hidden md:block">
              EST. 2022 // NEW DELHI<br />
              AVAILABLE FOR GLOBAL PROJECTS
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-12 py-10 bg-white border-t-[3px] border-brand-red">
        <div className="text-brand-red font-bold font-mono uppercase tracking-[0.1em] mb-4 md:mb-0">
          © 2024 ABHAYA. ENGINEERED PRECISION.
        </div>
        <div className="flex gap-10 font-mono text-sm font-bold uppercase tracking-[0.1em]">
          {['GITHUB', 'LINKEDIN', 'DRIBBBLE'].map(link => (
            <a key={link} href="#" className="text-brand-black hover:bg-brand-black hover:text-white transition-all px-2 py-1">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
