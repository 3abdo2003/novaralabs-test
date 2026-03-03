import React from 'react';

const About: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="pt-28 sm:pt-32 lg:pt-48 px-4 sm:px-6 lg:px-12 pb-16 sm:pb-24 lg:pb-32 max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center text-center lg:text-left">
                    <div>
                        <div className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase mb-3 sm:mb-4 lg:mb-8">Established 2024</div>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-9xl font-black text-black uppercase tracking-tighter leading-[0.8] mb-6 sm:mb-8 lg:mb-12">
                            The Pure <br />
                            <span className="text-gray-200">Standard.</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Novara Labs was born from a singular vision: to eliminate the ambiguity in research compound synthesis.
                        </p>
                    </div>
                    <div className="relative mt-12 lg:mt-0">
                        <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-black/[0.02] blur-[60px] lg:blur-[100px] rounded-full group-hover:bg-black/[0.04] transition-colors duration-1000"></div>

                            {/* Central Brand Logo - Very Large and Full Color */}
                            <img
                                src="/logo.png"
                                alt="Novara Labs"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-auto object-contain transition-transform duration-1000 select-none pointer-events-none group-hover:scale-105"
                            />

                            <div className="absolute inset-6 lg:inset-12 flex flex-col justify-end">
                                <div className="text-5xl lg:text-8xl font-black text-black/5 uppercase tracking-tighter select-none">PRECISION</div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 bg-orange-500 text-white p-8 lg:p-12 rounded-2xl shadow-2xl max-w-[12rem] lg:max-w-xs text-left">
                            <div className="text-2xl lg:text-4xl font-black mb-2 italic">99.9%</div>
                            <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/50 leading-tight">Minimum Batch Purity Guaranteed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="bg-zinc-950 py-16 sm:py-24 lg:py-40 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
                <div className="max-w-screen-2xl mx-auto relative z-10 border-l border-orange-500/20 pl-6 lg:pl-24">
                    <h2 className="text-xs lg:text-sm font-black tracking-[0.4em] text-orange-500/50 uppercase mb-12 lg:mb-16">Our Philosophy</h2>
                    <div className="space-y-12 lg:space-y-20">
                        <p className="text-2xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter max-w-5xl">
                            We don't just supply chemicals; we <span className="text-white/40 italic">engineer breakthroughs</span> through absolute data transparency.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 pt-8 lg:pt-12">
                            <div className="space-y-4 lg:space-y-6">
                                <h3 className="text-lg lg:text-xl font-bold text-white uppercase tracking-wider">Unrivaled Synthesis</h3>
                                <p className="text-white/40 text-base lg:text-lg font-medium leading-relaxed">
                                    Our lab-to-client pipeline is monitored by advanced HPLC and Mass Spec analysis at every critical junction. We provide full traceability for every research compound in our fleet.
                                </p>
                            </div>
                            <div className="space-y-4 lg:space-y-6">
                                <h3 className="text-lg lg:text-xl font-bold text-white uppercase tracking-wider">Research Centric</h3>
                                <p className="text-white/40 text-base lg:text-lg font-medium leading-relaxed">
                                    Every gram of peptide is produced with the end-researcher in mind. We minimize excipients and maximize stability to ensure consistent results in your validation studies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-white/[0.02] blur-[100px] lg:blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            </section>

            {/* Team CTA */}
            <section className="py-16 sm:py-24 lg:py-40 px-4 sm:px-6 lg:px-12">
                <div className="max-w-screen-2xl mx-auto bg-gray-50 rounded-2xl p-6 sm:p-10 lg:p-32 text-center relative overflow-hidden group border border-gray-100">
                    <h2 className="text-2xl sm:text-3xl md:text-8xl font-black text-black uppercase tracking-tighter mb-6 sm:mb-8 lg:mb-12 leading-none relative z-10 px-2 sm:px-4">
                        Let's Talk <br />
                        <span className="text-gray-300">Chemistry.</span>
                    </h2>
                    <p className="text-gray-500 mb-10 lg:mb-16 text-lg lg:text-xl max-w-xl mx-auto font-medium relative z-10">
                        Our scientists and support team are standing by to discuss bulk fulfillment or custom batch requirements.
                    </p>
                    <a
                        href="/contact"
                        className="relative z-10 px-10 lg:px-16 py-4 lg:py-6 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-sm lg:text-lg hover:bg-orange-600 transition-colors shadow-2xl shadow-orange-500/10 inline-block"
                    >
                        Connect With Us
                    </a>
                </div>
            </section>
        </div>
    );
};

export default About;
