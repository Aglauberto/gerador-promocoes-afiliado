import React, { useState } from 'react';
import { ExternalLink, Image as ImageIcon, Copy, Check } from 'lucide-react';

export default function WhatsappPreview({ product, formattedText, onCopy, onOpenImageModal }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2500);
  };

  const renderFormattedWhatsAppText = (text) => {
    if (!text) return null;

    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*[^*]+\*|~[^~]+~|https?:\/\/[^\s]+)/g);

      return (
        <p key={lineIdx} className="min-h-[1.25rem] leading-relaxed">
          {parts.map((part, partIdx) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={partIdx} className="font-bold text-white">{part.slice(1, -1)}</strong>;
            }
            if (part.startsWith('~') && part.endsWith('~')) {
              return <span key={partIdx} className="line-through text-gray-300 opacity-80">{part.slice(1, -1)}</span>;
            }
            if (part.match(/^https?:\/\//)) {
              return (
                <a
                  key={partIdx}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:underline break-all"
                >
                  {part}
                </a>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const getDomainFromUrl = (urlStr) => {
    try {
      if (!urlStr) return 'meli.la';
      const parsed = new URL(urlStr);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'link';
    }
  };

  const domain = getDomainFromUrl(product.link || product.originalUrl);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-5 flex flex-col gap-4">
      
      {/* Top Header Buttons replacing the title header */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
            copied
              ? 'bg-emerald-700'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado para o WhatsApp!' : 'Copiar texto'}
        </button>

        <button
          type="button"
          onClick={onOpenImageModal}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all border border-gray-200"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          Gerar imagem para postar
        </button>
      </div>

      {/* WhatsApp Frame Box */}
      <div className="bg-[#0b141a] rounded-2xl overflow-hidden shadow-inner border border-gray-800 flex flex-col font-sans">
        
        {/* WhatsApp Chat Bar */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-b border-[#222d34]">
          <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm shadow">
            G
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-100 leading-tight">Grupo de Ofertas</h4>
            <p className="text-xs text-gray-400">256 membros</p>
          </div>
        </div>

        {/* Chat Canvas */}
        <div className="p-3 sm:p-4 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] min-h-[380px] flex items-end justify-start">
          
          {/* Incoming/Outgoing WhatsApp Message Bubble */}
          <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tl-xs p-2.5 max-w-[340px] sm:max-w-[380px] shadow-lg relative text-xs sm:text-sm">
            
            {/* Embedded Link/Image Card Preview */}
            <div className="bg-[#0b4d3f] rounded-xl overflow-hidden mb-2 border border-[#096352]">
              {product.imageUrl ? (
                <div className="relative h-44 bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
              ) : (
                <div className="h-36 bg-gray-800 flex flex-col items-center justify-center text-gray-400 gap-1">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-xs">Sem imagem do produto</span>
                </div>
              )}

              {/* Text metadata inside thumbnail card */}
              <div className="p-2.5 bg-[#07362c]">
                <p className="font-semibold text-xs text-gray-100 line-clamp-1">{product.title || 'Título do Produto'}</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">R$ {product.price || '0.00'}</p>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <ExternalLink className="w-2.5 h-2.5" />
                  {domain}
                </p>
              </div>
            </div>

            {/* Message Body Content */}
            <div className="px-1 py-0.5 text-[#e9edef] whitespace-pre-wrap font-sans">
              {renderFormattedWhatsAppText(formattedText)}
            </div>

            {/* Timestamp & Read Checkmarks */}
            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 mt-1.5 pr-1">
              <span>12:29</span>
              <span className="text-sky-400 font-bold">✓✓</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
