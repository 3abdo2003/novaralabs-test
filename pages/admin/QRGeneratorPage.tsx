import React, { useState, useEffect } from 'react';
import { QrCode, Plus, History, Download, ChevronRight, Loader2, AlertCircle, CheckCircle2, Search, ExternalLink, Calendar, Clock, Package, X, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';

interface Product {
    _id: string;
    name: string;
}

interface QRBatch {
    _id: string;
    productId: string;
    productName: string;
    count: number;
    createdAt: string;
}

interface QRToken {
    _id: string;
    token: string;
    productName: string;
    scanCount: number;
    status: 'unused' | 'verified' | 'expired';
    createdAt: string;
}

const QRGeneratorPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [batches, setBatches] = useState<QRBatch[]>([]);
    const [selectedBatchTokens, setSelectedBatchTokens] = useState<QRToken[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewingBatch, setViewingBatch] = useState<QRBatch | null>(null);
    const [deleteBatch, setDeleteBatch] = useState<QRBatch | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [selectedProductId, setSelectedProductId] = useState('');
    const [generationCount, setGenerationCount] = useState(10);

    useEffect(() => {
        if (viewingBatch || deleteBatch) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [viewingBatch, deleteBatch]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [prodRes, batchRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/admin/qrcodes', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                })
            ]);

            const prodJson = await prodRes.json();
            const batchJson = await batchRes.json();

            if (prodJson.success) setProducts(prodJson.data);
            if (batchJson.success) setBatches(batchJson.data);
        } catch (error) {
            console.error('Failed to fetch QR data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || isGenerating) return;

        const product = products.find(p => p._id === selectedProductId);
        if (!product) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/qrcodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    productName: product.name,
                    count: generationCount
                })
            });

            const json = await res.json();
            if (json.success) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                fetchInitialData();
                generatePDF(json.batchId, product.name);
            }
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchBatchDetails = async (batch: QRBatch) => {
        setViewingBatch(batch);
        try {
            const res = await fetch(`/api/admin/qrcodes?batchId=${batch._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const json = await res.json();
            if (json.success) setSelectedBatchTokens(json.data);
        } catch (error) {
            console.error('Failed to fetch batch tokens:', error);
        }
    };

    const handleDeleteBatch = async (batchId: string) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/qrcodes?batchId=${batchId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const json = await res.json();
            if (json.success) {
                setDeleteBatch(null);
                fetchInitialData();
            }
        } catch (error) {
            console.error('Failed to delete batch:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const generatePDF = async (batchId: string, productName: string) => {
        setIsGenerating(true); // Show loader during PDF prep
        try {
            const res = await fetch(`/api/admin/qrcodes?batchId=${batchId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const json = await res.json();
            if (!json.success) return;

            const tokens: QRToken[] = json.data;
            
            // Temporary state to render QR codes in DOM for capture
            setSelectedBatchTokens(tokens);
            
            // Wait for DOM to update and render SVGs
            await new Promise(resolve => setTimeout(resolve, 800));

            const pdf = new jsPDF('p', 'mm', 'a4');
            const cardWidth = 45;
            const cardHeight = 60;
            const margin = 10;
            const cols = 4;
            const rows = 4;
            const qrSize = 30;

            let x = margin;
            let y = margin;
            let count = 0;

            for (const t of tokens) {
                if (count > 0 && count % (cols * rows) === 0) {
                    pdf.addPage();
                    x = margin;
                    y = margin;
                }

                const qrElement = document.getElementById(`qr-hidden-${t.token}`);
                if (!qrElement) continue;

                const svgElement = qrElement.querySelector('svg');
                if (!svgElement) continue;

                const canvas = document.createElement('canvas');
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const img = new Image();
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        try {
                            canvas.width = 600;
                            canvas.height = 600;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.fillStyle = "white";
                                ctx.fillRect(0, 0, 600, 600);
                                ctx.drawImage(img, 0, 0, 600, 600);
                            }
                            const qrImgData = canvas.toDataURL('image/png');
                            
                            pdf.setDrawColor(240, 240, 240);
                            pdf.rect(x, y, cardWidth, cardHeight);
                            
                            pdf.addImage(qrImgData, 'PNG', x + (cardWidth - qrSize) / 2, y + 5, qrSize, qrSize);
                            
                            pdf.setFontSize(8);
                            pdf.setFont('helvetica', 'bold');
                            pdf.setTextColor(26, 26, 26);
                            pdf.text(productName, x + cardWidth / 2, y + qrSize + 12, { align: 'center' });
                            
                            pdf.setFontSize(7);
                            pdf.setFont('courier', 'bold');
                            pdf.setTextColor(150, 150, 150);
                            pdf.text(t.token, x + cardWidth / 2, y + qrSize + 18, { align: 'center' });
                            
                            pdf.setFontSize(6);
                            pdf.text('novaralabs-test.vercel.app/verify', x + cardWidth / 2, y + qrSize + 22, { align: 'center' });

                            count++;
                            x += cardWidth + 5;
                            if (count % cols === 0) {
                                x = margin;
                                y += cardHeight + 5;
                            }
                            resolve(true);
                        } catch (err) {
                            reject(err);
                        }
                    };
                    img.onerror = () => {
                        console.error('Failed to load SVG for token', t.token);
                        // Resolve anyway to continue the batch instead of crashing the whole PDF
                        resolve(false); 
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
                });
            }

            pdf.save(`QR-Batch-${productName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Initializing QR Hub...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 pb-20 max-w-[1600px] mx-auto relative animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1.5 tracking-tight flex items-center gap-3">
                        <QrCode className="w-6 h-6 text-orange-500" /> QR Authentication Hub
                    </h1>
                    <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.25em]">Secure Asset Verification & Integrity System</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generation Form */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-zinc-50 pb-5">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">New Batch Generation</h3>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Target Product</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl p-4 text-sm font-bold text-zinc-900 appearance-none outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                        value={selectedProductId}
                                        onChange={e => setSelectedProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a product...</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 rotate-90" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Quantity <span className="text-zinc-300 font-medium normal-case">(Max 100)</span></label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="100"
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl p-4 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                    value={generationCount}
                                    onChange={e => setGenerationCount(parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isGenerating || !selectedProductId}
                                className="w-full bg-zinc-900 text-white p-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-300 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Engraving Tokens...</>
                                ) : (
                                    <><QrCode className="w-4 h-4" /> Generate & Export PDF</>
                                )}
                            </button>
                        </form>
                    </div>

                </div>

                {/* Batch History */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-8 py-6 border-b border-zinc-50 bg-zinc-50/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Generation Audit Trail</h3>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">Identity & Origin</th>
                                        <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">Volume</th>
                                        <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50">Timestamp</th>
                                        <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 text-right">Insight</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-semibold text-zinc-600">
                                    {batches.map(batch => (
                                        <tr key={batch._id} className="hover:bg-zinc-50/50 transition-all group active:scale-[0.995]">
                                            <td className="px-4 sm:px-8 py-4 sm:py-6 border-b border-zinc-50">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="p-2 sm:p-3 bg-zinc-100 rounded-xl text-zinc-400 group-hover:bg-white transition-colors border border-transparent group-hover:border-zinc-200">
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-zinc-900 text-xs sm:text-sm font-black mb-0.5">{batch.productName}</p>
                                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{batch._id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 sm:py-6 border-b border-zinc-50">
                                                <span className="bg-zinc-100 px-2 sm:px-3 py-1 rounded-full font-black text-zinc-900 whitespace-nowrap">{batch.count} CODES</span>
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 sm:py-6 border-b border-zinc-50">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-400 whitespace-nowrap">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(batch.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-400 whitespace-nowrap">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 sm:py-6 border-b border-zinc-50 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => fetchBatchDetails(batch)}
                                                        className="inline-flex items-center gap-1 sm:gap-2 text-zinc-900 bg-white border border-zinc-200 px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-zinc-900 transition-all shadow-sm"
                                                    >
                                                        <span className="hidden sm:inline">Analysis</span> <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteBatch(batch)}
                                                        className="p-2 sm:p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Batch"
                                                    >
                                                        <Trash2 className="w-4 sm:w-4 h-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {batches.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Search className="w-8 h-8" />
                                                    <p className="text-[10px] uppercase font-black tracking-widest">No generated batches found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Analysis Modal */}
            {viewingBatch && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] rounded-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <div className="px-4 sm:px-8 py-4 sm:py-8 border-b border-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0 bg-zinc-50/30">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight uppercase">{viewingBatch.productName}</h2>
                                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Batch ID: {viewingBatch._id}</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                <button 
                                    onClick={() => generatePDF(viewingBatch._id, viewingBatch.productName)}
                                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-zinc-900 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all whitespace-nowrap flex-1 sm:flex-none justify-center"
                                >
                                    <Download className="w-4 h-4" /> Export Batch
                                </button>
                                <button 
                                    onClick={() => setViewingBatch(null)}
                                    className="p-2.5 sm:p-3 bg-white border border-zinc-200 rounded-xl sm:rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all flex-shrink-0"
                                >
                                    <X className="w-4 sm:w-5 h-4 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 overscroll-contain">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
                                <div className="p-3 sm:p-6 bg-orange-50/50 rounded-2xl sm:rounded-3xl border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] sm:text-[9px] font-black text-orange-400 uppercase tracking-widest mb-0.5 sm:mb-1">Unused</p>
                                        <p className="text-lg sm:text-2xl font-black text-orange-900">{selectedBatchTokens.filter(t => t.status === 'unused').length}</p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-500">
                                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="p-3 sm:p-6 bg-emerald-50/50 rounded-2xl sm:rounded-3xl border border-emerald-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5 sm:mb-1">Authed</p>
                                        <p className="text-lg sm:text-2xl font-black text-emerald-900">{selectedBatchTokens.filter(t => t.status === 'verified').length}</p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="p-3 sm:p-6 bg-red-50/50 rounded-2xl sm:rounded-3xl border border-red-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] sm:text-[9px] font-black text-red-400 uppercase tracking-widest mb-0.5 sm:mb-1">Depleted</p>
                                        <p className="text-lg sm:text-2xl font-black text-red-900">{selectedBatchTokens.filter(t => t.status === 'expired').length}</p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100/50 flex items-center justify-center text-red-500">
                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="p-3 sm:p-6 bg-zinc-900 rounded-2xl sm:rounded-3xl flex items-center justify-between text-white">
                                    <div>
                                        <p className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 sm:mb-1">Total Scans</p>
                                        <p className="text-lg sm:text-2xl font-black text-white">{selectedBatchTokens.reduce((sum, t) => sum + t.scanCount, 0)}</p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-6">
                                {selectedBatchTokens.map(token => (
                                    <div key={token._id} className="bg-zinc-50/50 border border-zinc-100 p-2 sm:p-4 rounded-xl sm:rounded-3xl flex flex-col items-center gap-1.5 sm:gap-3 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
                                        <div className="p-1 sm:p-2 bg-white rounded-lg sm:rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden flex items-center justify-center">
                                            <div className="w-10 h-10 sm:w-20 sm:h-20">
                                                <QRCodeSVG 
                                                    value={`https://novarlabs-copy.vercel.app/verify/${token.token}`}
                                                    size={100}
                                                    style={{ width: '100%', height: '100%' }}
                                                    level="M"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            {token.status === 'expired' && (
                                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                                                    <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center w-full">
                                            <p className="text-[8px] sm:text-[10px] font-black text-zinc-900 uppercase tracking-tighter truncate mx-auto mb-1 font-mono">{token.token}</p>
                                            <div className="flex justify-center flex-wrap gap-0.5 sm:gap-1">
                                                <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1 sm:px-1.5 py-0.5 rounded-sm sm:rounded-md border ${
                                                    token.status === 'unused' ? 'bg-orange-50 border-orange-100 text-orange-500' :
                                                    token.status === 'verified' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                                                    'bg-red-50 border-red-100 text-red-500'
                                                }`}>
                                                    {token.status.slice(0,4)}
                                                </span>
                                                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1 sm:px-1.5 py-0.5 rounded-sm sm:rounded-md bg-zinc-900 text-white border border-zinc-900">
                                                    {token.scanCount}/2
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden elements for SVG to Canvas extraction */}
            <div className="fixed -left-[2000px] -top-[2000px]">
                {selectedBatchTokens.map(t => (
                    <div key={t.token} id={`qr-hidden-${t.token}`}>
                        <QRCodeSVG value={`https://novarlabs-copy.vercel.app/verify/${t.token}`} size={300} includeMargin={true} />
                    </div>
                ))}
            </div>

            {/* Notifications */}
            {showSuccess && (
                <div className="fixed bottom-8 right-8 z-[150] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-bold tracking-tight uppercase tracking-widest text-[10px]">Batch Successfully Engraved</p>
                    </div>
                </div>
            )}

            {/* Deletion Confirmation Modal */}
            {deleteBatch && (
                <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-red-100 flex flex-col p-8 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">Purge Generation Batch?</h3>
                        <p className="text-zinc-500 text-xs mb-8 leading-relaxed font-medium">
                            Are you sure you want to delete this batch of <span className="font-bold text-zinc-900">{deleteBatch.count}</span> authenticators for <span className="font-bold text-zinc-900">{deleteBatch.productName}</span>? This action is <span className="text-red-600 font-bold uppercase tracking-wider">irreversible</span> and will immediately block access for any unused codes within this set.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteBatch(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDeleteBatch(deleteBatch._id)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                            >
                                {isDeleting && <Loader2 className="w-3 h-3 animate-spin text-white" />}
                                Shred Batch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRGeneratorPage;
