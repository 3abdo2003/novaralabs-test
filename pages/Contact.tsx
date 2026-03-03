import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useMessage } from '../context/MessageContext';

const Contact: React.FC = () => {
    const { showMessage } = useMessage();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contactReasons = [
        'General Inquiry',
        'Product Information',
        'Order Support',
        'Technical Support',
        'Bulk & Wholesale',
        'Complaint',
        'Feedback'
    ];

    return (
        <div className="bg-white min-h-screen pt-28 sm:pt-32 lg:pt-48 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-12">
            <div className="max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32">
                    {/* Contact Info */}
                    <div className="text-center lg:text-left">
                        <div className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase mb-3 sm:mb-4 lg:mb-8">Get In Touch</div>
                        <h1 className="text-3xl sm:text-4xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.8] mb-6 sm:mb-8 lg:mb-12">
                            Human <br />
                            <span className="text-gray-200">Support.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-12 lg:mb-20 max-w-lg mx-auto lg:mx-0">
                            Our engineering and support teams are available 24/7 to assist with your scientific inquiries.
                        </p>

                        <div className="space-y-8 lg:space-y-12">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-8">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Us</h4>
                                    <p className="text-lg lg:text-xl font-bold text-black uppercase">support@novaralabs.eu</p>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-8">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Call Us</h4>
                                    <p className="text-lg lg:text-xl font-bold text-black uppercase">+1 (888) NOVARA</p>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-8">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Headquarters</h4>
                                    <p className="text-lg lg:text-xl font-bold text-black uppercase text-center lg:text-left">Warsaw, Poland</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-gray-50 rounded-2xl p-5 sm:p-8 lg:p-20 border border-gray-100 shadow-2xl shadow-gray-200/50 mt-10 sm:mt-12 lg:mt-0">
                        <form
                            className="space-y-6 lg:space-y-8"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (isSubmitting) return;

                                const form = e.currentTarget;
                                const formData = new FormData(form);
                                const name = (formData.get('name') as string)?.trim();
                                const email = (formData.get('email') as string)?.trim();
                                const phone = (formData.get('phone') as string)?.trim();
                                const message = (formData.get('message') as string)?.trim();

                                if (!name || !email || !message || !reason) {
                                    showMessage({
                                        variant: 'error',
                                        title: 'Missing information',
                                        message: 'Please fill in all required fields.',
                                        buttonLabel: 'OK',
                                    });
                                    return;
                                }

                                try {
                                    setIsSubmitting(true);
                                    const response = await fetch('/api/send-contact', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            name,
                                            email,
                                            phone,
                                            reason,
                                            message,
                                        }),
                                    });

                                    if (!response.ok) {
                                        throw new Error('Failed to send message');
                                    }

                                    form.reset();
                                    setReason('');
                                    showMessage({
                                        variant: 'success',
                                        title: 'Message sent',
                                        message: "We've received your message and will get back to you soon.",
                                        buttonLabel: 'OK',
                                    });
                                } catch (error) {
                                    console.error(error);
                                    showMessage({
                                        variant: 'error',
                                        title: 'Unable to send message',
                                        message: 'There was a problem sending your message. Please try again or email us directly.',
                                        buttonLabel: 'OK',
                                    });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 lg:px-8 py-4 lg:py-5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="john@research.org"
                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 lg:px-8 py-4 lg:py-5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2 lg:col-span-1 xl:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 lg:px-8 py-4 lg:py-5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Reason for Contacting</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 lg:px-8 py-4 lg:py-5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all appearance-none"
                                    >
                                        <option value="" disabled>Select a reason...</option>
                                        {contactReasons.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <MessageSquare size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    placeholder="How can we help your research today?"
                                    rows={6}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-6 lg:px-8 py-5 lg:py-6 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full text-white rounded-xl py-5 lg:py-6 font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center space-x-4 transition-colors shadow-2xl min-h-[48px] ${isSubmitting
                                    ? 'bg-orange-400 cursor-not-allowed shadow-none'
                                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10'
                                    }`}
                            >
                                {isSubmitting && (
                                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                )}
                                {!isSubmitting && <Send size={18} />}
                                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
