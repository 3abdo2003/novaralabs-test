import React from 'react';
import ValidationSearch from '../components/ValidationSearch';
import { ShieldCheck, FileSearch, Lock } from 'lucide-react';

const ProductValidation: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="pt-28 sm:pt-32 lg:pt-48 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-12 max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center mb-16 sm:mb-24 lg:mb-32 text-center lg:text-left">
                    <div>
                        <div className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase mb-3 sm:mb-4 lg:mb-8">Supply Chain Security</div>
                        <h1 className="text-3xl sm:text-4xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.8] mb-6 sm:mb-8 lg:mb-12">
                            Batch <br />
                            <span className="text-gray-200">Validation.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-lg mb-10 lg:mb-12 mx-auto lg:mx-0">
                            Verify the authenticity of your research compounds and access full batch analysis reports from our secure database.
                        </p>

                        <div className="space-y-6 lg:space-y-8 max-w-md mx-auto lg:mx-0 text-left">
                            {[
                                { icon: ShieldCheck, title: 'Encrypted IDs', desc: 'Every vial features a unique cryptographic identifier.' },
                                { icon: FileSearch, title: 'HPLC Reports', desc: 'Instant access to original lab analysis data.' },
                                { icon: Lock, title: 'Secure Chain', desc: 'Ensuring batch integrity from synthesis to delivery.' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start space-x-6">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 flex-shrink-0">
                                        <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-orange-500 mb-1">{item.title}</h4>
                                        <p className="text-[10px] lg:text-xs text-gray-400 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 lg:mt-0">
                        <ValidationSearch />
                    </div>
                </div>

                {/* Security Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 border-t border-gray-100 pt-16 sm:pt-24 lg:pt-32 text-center md:text-left">
                    <div className="space-y-4 lg:space-y-6">
                        <h3 className="text-lg lg:text-xl font-black text-black uppercase tracking-tight">How it works</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Find the 12-character alphanumeric code printed on the side of your Novara Labs vial. Enter this code into our validation engine to confirm it matches our production records.
                        </p>
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                        <h3 className="text-lg lg:text-xl font-black text-black uppercase tracking-tight">Batch Transparency</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            If a product is validated, you will be able to download the Certificate of Analysis (COA) and HPLC graphs specifically associated with that production batch.
                        </p>
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                        <h3 className="text-lg lg:text-xl font-black text-black uppercase tracking-tight">Report a Fake</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Encountered a suspicious product? If your ID fails validation twice, please use our <a href="/contact" className="text-orange-500 underline font-bold">Contact Page</a> to submit a counterfeit report.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductValidation;
