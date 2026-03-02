import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

const UnderConstruction: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(TEN_DAYS_MS);

  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = TEN_DAYS_MS - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const timeBlocks = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4 py-6 sm:py-0 relative overflow-hidden">
      {/* subtle, white-safe glow accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-orange-200/40 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[520px] w-[520px] rounded-full bg-orange-100/40 blur-3xl hidden sm:block" />

      <motion.div
        className="max-w-xl w-full flex flex-col items-center text-center space-y-6 sm:space-y-10 relative"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
      >
        <motion.img
          src="/logo.png"
          alt="Novara Labs"
          className="h-24 sm:h-40 w-auto mb-1"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <motion.div
          className="space-y-2 sm:space-y-3"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-orange-500 font-black">
            Pure Science, Elevated
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-zinc-950">
            Novara Labs launching in 10 days
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-medium max-w-xl mx-auto">
            Precision research compounds for scientists who demand clean data, tight tolerances, and absolute transparency.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-xl mt-4"
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {timeBlocks.map(({ label, value }) => (
            <motion.div
              key={label}
              className="rounded-2xl border border-zinc-200 bg-white shadow-sm py-3 sm:py-5 flex flex-col items-center justify-center"
              whileHover={{ y: -2, boxShadow: '0 14px 35px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
              <div className="h-9 sm:h-12 md:h-14 flex items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={`${label}-${value}`}
                    className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums text-zinc-900"
                    initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="mt-2 text-[10px] tracking-[0.25em] uppercase text-zinc-500 font-semibold">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="w-full max-w-2xl mt-6 sm:mt-8 space-y-1 text-[11px] sm:text-sm text-zinc-500 font-medium"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className="tracking-[0.25em] uppercase text-zinc-700">
            Warsaw · Cairo · New York
          </p>
          <p className="text-zinc-400">
            Serving research communities across Poland, Egypt, and the United States.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnderConstruction;

