
import React from 'react';

const Bottle: React.FC<{ label: string, color: string, delay: string, imageSrc: string, className?: string }> = ({ label, color, delay, imageSrc, className = "" }) => (
  <div
    className={`relative h-auto flex flex-col items-center transition-all duration-700 hover:scale-110 hover:z-50 cursor-pointer group ${className}`}
    style={{ animationDelay: delay }}
  >
    <img
      src={imageSrc}
      alt={label}
      className="hero-bottle-img h-auto object-contain drop-shadow-2xl"
    />
  </div>
);

const Hero: React.FC = () => {
  return (
    <section className="hero-split min-h-screen flex items-center pt-32 lg:pt-24 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 sm:gap-12 lg:gap-24 relative z-10">

        {/* Left Content */}
        <div className="animate-in fade-in slide-in-from-left-12 duration-1000 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-6xl xl:text-7xl font-black text-black leading-[1.0] tracking-tight mb-4 sm:mb-6">
            NOVARA LABS<br />
            TECHNOLOGY
          </h1>

          <p className="text-gray-600 text-base md:text-lg max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
            Premium research compounds engineered for peak performance and precision with European Quality standards.
          </p>

          <a href="/peptides" className="inline-block px-10 md:px-12 py-4 md:py-5 bg-orange-500 rounded-xl text-white text-xs md:text-sm font-black tracking-widest uppercase hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]">
            BUY PEPTIDES
          </a>
        </div>

        {/* Right Content: The Fanned Bottles Stack */}
        <div className="relative h-[400px] md:h-[600px] lg:h-[700px] flex items-center justify-center lg:justify-end pr-0 lg:pr-12 -mt-12 md:mt-8 lg:mt-0">
          <div className="relative w-full h-full flex items-center justify-center">

            {/* Left Bottle (Back) */}
            <Bottle
              label="RETATRUTIDE"
              color="#333"
              delay="0.4s"
              imageSrc="/RETATRUTIDE-removebg-preview.png"
              className="absolute -translate-x-1 -rotate-[12deg] z-10 opacity-90 animate-float"
            />

            {/* Middle Bottle (Front/Center) */}
            <Bottle
              label="CJC-IPAMORELIN"
              color="#1a1a1a"
              delay="0.2s"
              imageSrc="/CJC-IPAMORELIN-removebg-preview.png"
              className="absolute rotate-0 z-30 animate-float-delayed"
            />

            {/* Right Bottle (Back) */}
            <Bottle
              label="MOTS-C"
              color="#000"
              delay="0s"
              imageSrc="/MOTS-C-removebg-preview.png"
              className="absolute translate-x-1 rotate-[12deg] z-10 opacity-90 animate-float"
            />

            {/* Multi-layered Premium Floor Shadow */}
            <div className="absolute bottom-4 md:bottom-16 left-1/2 -translate-x-1/2 w-[300px] md:w-[700px] pointer-events-none -z-0 flex flex-col items-center">
              {/* Contacts Shadow */}
              <div className="w-[200px] md:w-[500px] h-8 md:h-12 bg-black/40 blur-[20px] md:blur-[40px] rounded-full translate-y-4"></div>
              {/* Large Ambient Shadow */}
              <div className="absolute inset-0 w-[300px] md:w-[700px] h-16 md:h-24 bg-black/10 blur-[60px] md:blur-[120px] rounded-full"></div>
              {/* Central Glow / Brand Reflection */}
              <div className="absolute inset-x-0 bottom-0 w-[150px] md:w-[350px] h-12 md:h-16 bg-orange-500/10 blur-[40px] md:blur-[80px] rounded-full mx-auto"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Pattern Overlay for the Hero Transition */}
      <div className="hero-split-pattern"></div>

      {/* Floating Elements Background */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0 opacity-20">
        <div className="absolute top-[15%] right-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/[0.03] rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-black/[0.1] rounded-full blur-[50px] md:blur-[100px]"></div>
      </div>

      <style>{`
        @keyframes float-premium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @media (min-width: 768px) {
          @keyframes float-premium {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-25px); }
          }
        }
        .animate-float {
          animation: float-premium 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-premium 6s ease-in-out infinite 1.5s;
        }
        /* Specific fanned translations for animated state to maintain tight overlap */
        .animate-float.-translate-x-1 {
           animation: float-premium-left 7s ease-in-out infinite both;
        }
        .animate-float.translate-x-1 {
           animation: float-premium-right 7s ease-in-out infinite both;
        }
        .hero-bottle-img {
          width: 70vw;
          min-width: 60vw;
          max-width: none;
        }
        @media (min-width: 768px) {
          .hero-bottle-img {
            width: min(600px, 115vw);
            min-width: min(550px, 100vw);
          }
        }
        @keyframes float-premium-left {
          0%, 100% { transform: translateX(40vw) rotate(-12deg) translateY(0) scale(1.0); }
          50% { transform: translateX(40vw) rotate(-12deg) translateY(-10px) scale(1.0); }
        }
        @keyframes float-premium-right {
          0%, 100% { transform: translateX(-40vw) rotate(12deg) translateY(0) scale(1.0); }
          50% { transform: translateX(-40vw) rotate(12deg) translateY(-10px) scale(1.0); }
        }
        @media (min-width: 768px) {
          @keyframes float-premium-left {
            0%, 100% { transform: translateX(25rem) rotate(-12deg) translateY(0) scale(1.0); }
            50% { transform: translateX(25rem) rotate(-12deg) translateY(-20px) scale(1.0); }
          }
          @keyframes float-premium-right {
            0%, 100% { transform: translateX(-25rem) rotate(12deg) translateY(0) scale(1.0); }
            50% { transform: translateX(-25rem) rotate(12deg) translateY(-20px) scale(1.0); }
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
