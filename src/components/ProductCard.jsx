import React, { useState } from 'react';
import { Sparkles, Trash2, ChevronDown, ChevronUp, Link as LinkIcon, Wand2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import WhatsappPreview from './WhatsappPreview';
import ImageGeneratorModal from './ImageGeneratorModal';
import { formatTemplate } from '../utils/templateEngine';

export default function ProductCard({
  item,
  index,
  template,
  onUpdate,
  onRemove,
  apiKey,
  onOpenAiSettings
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [loadingAiSlogan, setLoadingAiSlogan] = useState(false);
  const [loadingAiTitle, setLoadingAiTitle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const product = item.product;

  const handleFieldChange = (field, value) => {
    onUpdate(item.id, {
      ...product,
      [field]: value
    });
  };

  const activeLink = item.originalUrl || item.finalUrl;

  const currentProductData = {
    ...product,
    link: activeLink
  };

  const formattedText = formatTemplate(template?.content || '', currentProductData);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Trigger AI for slogan creation
  const handleGenerateAiSlogan = async () => {
    if (!apiKey) {
      onOpenAiSettings();
      return;
    }
    setLoadingAiSlogan(true);
    try {
      const res = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          action: 'generate_slogan',
          productData: product
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        const slogans = data.result.split('\n').filter(Boolean);
        const bestSlogan = slogans[0] || data.result;
        handleFieldChange('slogan', bestSlogan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiSlogan(false);
    }
  };

  // Trigger AI to simplify title
  const handleOptimizeTitleAi = async () => {
    if (!apiKey) {
      onOpenAiSettings();
      return;
    }
    setLoadingAiTitle(true);
    try {
      const res = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          action: 'improve_title',
          productData: product
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        handleFieldChange('title', data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiTitle(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
      
      {/* Header bar of item */}
      <div className="bg-slate-50 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            #{index + 1}
          </span>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1">
            {product.title}
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1 border border-amber-200">
            {item.store?.icon || '🛒'} {item.store?.name || 'Loja'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Remover item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form Fields + Buttons + Raw Text Box */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Product Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-600">Título do produto</label>
                <button
                  type="button"
                  onClick={handleOptimizeTitleAi}
                  disabled={loadingAiTitle}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {loadingAiTitle ? 'Encurtando...' : 'IA Encurtar Título'}
                </button>
              </div>
              <input
                type="text"
                value={product.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Preço original (De)</label>
                <input
                  type="text"
                  value={product.originalPrice || ''}
                  placeholder="Ex: 51.90"
                  onChange={(e) => handleFieldChange('originalPrice', e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (Por)</label>
                <input
                  type="text"
                  value={product.price || ''}
                  placeholder="Ex: 39.01"
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL da imagem</label>
              <input
                type="text"
                value={product.imageUrl || ''}
                onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono text-gray-600 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Coupon */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cupom de desconto</label>
              <input
                type="text"
                value={product.coupon || ''}
                placeholder="Ex: CUPOM10 (deixe em branco se não houver)"
                onChange={(e) => handleFieldChange('coupon', e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Slogan with AI generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-600">Slogan / Frase chamativa</label>
                <button
                  type="button"
                  onClick={handleGenerateAiSlogan}
                  disabled={loadingAiSlogan}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {loadingAiSlogan ? 'Gerando com IA...' : 'Gerar Slogan com IA'}
                </button>
              </div>
              <input
                type="text"
                value={product.slogan || ''}
                placeholder="Ex: 🔥 Garanta antes que acabe o estoque!"
                onChange={(e) => handleFieldChange('slogan', e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Link Usado */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                Link de Divulgação:
              </span>
              <span className="font-mono text-[11px] text-emerald-700 truncate max-w-[280px]">
                {activeLink}
              </span>
            </div>

            {/* Texto bruto (para copiar) */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700">Texto bruto (para copiar):</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <textarea
                readOnly
                value={formattedText}
                rows={5}
                className="w-full text-xs font-mono text-gray-800 bg-white border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

          </div>

          {/* Right Column: WhatsApp Live Preview with Top Action Buttons */}
          <div className="lg:col-span-6">
            <WhatsappPreview
              product={currentProductData}
              formattedText={formattedText}
              onCopy={handleCopy}
              onOpenImageModal={() => setShowImageModal(true)}
            />
          </div>

        </div>
      )}

      {/* Image Generator Modal */}
      {showImageModal && (
        <ImageGeneratorModal
          product={currentProductData}
          onClose={() => setShowImageModal(false)}
        />
      )}

    </div>
  );
}
