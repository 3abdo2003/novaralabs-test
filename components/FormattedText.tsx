import React from 'react';

interface FormattedTextProps {
    text: string;
    className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = "" }) => {
    // Split by double newlines to get paragraphs
    const blocks = text.split(/\n\n+/);

    return (
        <div className={`space-y-4 ${className}`}>
            {blocks.map((block, blockIndex) => {
                // Check if the block contains bullet points
                const lines = block.split('\n');
                const isList = lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'));

                if (isList) {
                    return (
                        <ul key={blockIndex} className="space-y-3 my-5 pl-1">
                            {lines.map((line, lineIndex) => {
                                const trimmedLine = line.trim();
                                const hasMarker = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');
                                const cleanLine = trimmedLine.replace(/^[•-]\s*/, '');

                                if (!cleanLine) return null;

                                return (
                                    <li key={lineIndex} className="flex items-start gap-4 text-gray-600">
                                        {hasMarker ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80 mt-[0.6em] flex-shrink-0" />
                                        ) : (
                                            // Optional: If no marker, it might be a sub-header within the list block
                                            <div className="w-1.5 h-1.5 flex-shrink-0" aria-hidden="true" />
                                        )}
                                        <span className={!hasMarker ? "font-bold text-black uppercase text-xs tracking-wider" : "flex-1"}>
                                            {cleanLine}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                }

                // Handle normal paragraphs, preserving internal single newlines as breaks if needed
                // but typically for these descriptions, single newlines are just line wraps or sub-headers
                return (
                    <p key={blockIndex} className="leading-relaxed whitespace-pre-line last:mb-0">
                        {block}
                    </p>
                );
            })}
        </div>
    );
};

export default FormattedText;
