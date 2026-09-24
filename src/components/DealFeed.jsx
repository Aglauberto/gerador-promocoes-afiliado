import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Flame, Filter, Clock, Tag, ExternalLink, Image as ImageIcon, Search, Link2, Zap } from 'lucide-react';
import { formatTemplate } from '../utils/templateEngine';
import { convertUrlToAffiliateLink } from '../utils/affiliateLinkConverter';
import ImageGeneratorModal from './ImageGeneratorModal';

export default function DealFeed({ template, apiKey, onUseInGenerator, onScheduleDeal }) {
  const [selectedNiche, setSelectedNiche] = useState('todos');
  const [customKeyword, setCustomKeyword] = useState('');
  const [selectedStore, setSelectedStore] = useState('todos');
  const [minDiscount, setMinDiscount] = useState(0); // Default 0 (Qualquer Desconto)
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedProductForImage, setSelectedProductForImage] = useState(null);
  
  // Custom affiliate link state per deal ID
  const [affiliateUrls, setAffiliateUrls] = useState({});

  const niches = [
    { id: 'todos', label: '🔥 Todas as Ofertas (Feed Geral)', query: '' },
    { id: 'jardinagem', label: '🪴 Plantas & Jardinagem (Completo)', query: 'plantas, mudas, orquideas, cactos, suculentas, vasos, jardinagem, ferramentas, adubos, suportes, jardim, espelho, mesa, cadeira, regador, tesoura, sementes, churrasqueira, panela, torneira, mangueira, organizador, ducha, chuveiro, colchao, decoracao, armario, luminaria, estante, cabeceira, jogo' },
    { id: 'casa', label: '🏡 Casa & Decoração', query: 'casa, decoracao, espelho, moveis, mesa, cadeira, lustre, quadro, organizador, cama, banho, tapete, sofa, cortina, armario, colchao, luminaria, travesseiro, kit' },
    { id: 'eletronicos', label: '📱 Eletrônicos & Tech', query: 'fone, bluetooth, smartwatch, celular, carregador, caixa de som, fone de ouvido, cabo, teclado, mouse, monitor, relogio, camera, suporte, cabo, adaptador' },
    { id: 'eletro', label: '⚡ Eletrodomésticos', query: 'geladeira, airfryer, cafeteira, panela, aspirador, ventilador, batedeira, liquidificador, microondas, fogao, lavadora, jogo de panelas, forno, grill' },
    { id: 'beleza', label: '✨ Beleza & Cuidados', query: 'perfume, maquiagem, cabelo, creme, shampoo, esmalte, batom, skincare, hidratante, secador, prancha, escova, barbeador, serum' },
    { id: 'moda', label: '👗 Moda & Calçados', query: 'tenis, sandalia, mochila, camiseta, vestido, calca, casaco, bolsa, relogio, sapato, cueca, meias, shorts, camisa, chinelo, jaqueta' },
  ];

  // Fetch deals on niche/keyword change or mount
  const fetchDeals = async () => {
    setLoading(true);
    try {
      const activeNicheObj = niches.find(n => n.id === selectedNiche);
      const query = customKeyword.trim() || activeNicheObj?.query || 'ofertas';

      const response = await fetch('/api/deals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          niche: customKeyword.trim() ? undefined : selectedNiche,
          store: selectedStore,
          minDiscount: Number(minDiscount)
        })
      });

      const data = await response.json();
      if (data.success && data.deals) {
        setDeals(data.deals);
      }
    } catch (err) {
      console.error('Erro ao buscar ofertas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [selectedNiche, selectedStore, minDiscount]);

  const handleCopyDeal = (deal) => {
    const userAffLink = affiliateUrls[deal.id]?.trim();
    const convertedDefault = convertUrlToAffiliateLink(deal.url);
    const finalLink = userAffLink || convertedDefault || 'https://meli.la/SEU_LINK_AQUI';

    const formatted = formatTemplate(template?.content || '', {
      title: deal.title,
      price: deal.price,
      originalPrice: deal.originalPrice,
      link: finalLink,
      slogan: deal.slogan || 'Oferta imperdível do dia ✨'
    });

    navigator.clipboard.writeText(formatted);
    setCopiedId(deal.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <Flame className="w-96 h-96 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              Feed de Ofertas Rastreadas
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Atualizações diárias: <strong>08:00 • 13:00 • 19:00</strong></span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Rastreador de Promoções & Cupons
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Monitore as melhores ofertas do Mercado Livre e Shopee com descontos de <strong>10% OFF ou mais</strong>. Clique em <strong>Abrir Oferta</strong>, copie seu link de afiliado e gere a mensagem perfeita!
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
        
        {/* Niche Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Escolha o Nicho:
          </label>
          <div className="flex flex-wrap gap-2">
            {niches.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setSelectedNiche(n.id);
                  setCustomKeyword('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedNiche === n.id && !customKeyword
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Keyword + Store + Discount Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          
          {/* Custom Search Input */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Busca por palavra-chave específica:
            </label>
            <div className="relative">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDeals()}
                placeholder="Ex: geladeira, vasos, mudas, orquídeas..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-8 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Store Filter */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Loja:</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-medium text-emerald-900 font-bold"
            >
              <option value="mercadolivre">Mercado Livre 📦 (100% Ativo)</option>
            </select>
          </div>

          {/* Min Discount Selector */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Desconto Mínimo:</label>
            <select
              value={minDiscount}
              onChange={(e) => setMinDiscount(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
            >
              <option value="0">Qualquer Desconto (Todas as Ofertas)</option>
              <option value="10">≥ 10% OFF</option>
              <option value="20">≥ 20% OFF</option>
              <option value="30">≥ 30% OFF</option>
              <option value="40">≥ 40% OFF</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              onClick={fetchDeals}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

        </div>
      </div>

      {/* Deals Feed Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm">Rastreando melhores ofertas em tempo real...</h3>
          <p className="text-xs text-gray-500">Buscando descontos de {minDiscount}% OFF ou mais no Mercado Livre e Shopee.</p>
        </div>
      ) : deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((deal, index) => {
            const userAffLink = affiliateUrls[deal.id]?.trim();
            const displayLink = userAffLink || 'https://meli.la/SEU_LINK_AQUI';

            const formattedMessage = formatTemplate(template?.content || '', {
              title: deal.title,
              price: deal.price,
              originalPrice: deal.originalPrice,
              link: displayLink,
              slogan: deal.slogan || 'Oferta imperdível do dia ✨'
            });

            return (
              <div
                key={deal.id || index}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all group"
              >
                <div>
                  {/* Top Rank Header Badge */}
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {index === 0 ? '⭐ #1 Super Oferta' : `#${index + 1} Oferta`}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {deal.store?.name || 'Mercado Livre'}
                      </span>
                    </div>

                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      -{deal.discountPerc}% OFF
                    </span>
                  </div>

                  {/* Thumbnail Card */}
                  <div className="p-4 flex gap-3 border-b border-gray-100">
                    <img
                      src={deal.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300'}
                      alt={deal.title}
                      className="w-20 h-20 object-contain rounded-xl bg-gray-50 p-1 shrink-0 border border-gray-100"
                    />
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-snug">
                        {deal.title}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        {deal.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            R$ {deal.originalPrice}
                          </span>
                        )}
                        <span className="text-sm font-extrabold text-emerald-700">
                          R$ {deal.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Open Product Link */}
                  <div className="p-3 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold text-amber-900">
                      1. Abra a oferta para copiar seu link:
                    </div>
                    <a
                      href={convertUrlToAffiliateLink(deal.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs flex items-center gap-1 transition-all shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir Oferta
                    </a>
                  </div>

                  {/* Step 2: Paste Affiliate Link */}
                  <div className="p-3 bg-gray-50 border-b border-gray-100 space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">
                      2. Cole seu link de afiliado (meli.la / shope.ee):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={affiliateUrls[deal.id] || ''}
                        onChange={(e) => setAffiliateUrls({ ...affiliateUrls, [deal.id]: e.target.value })}
                        placeholder="Ex: https://meli.la/1PDk7te"
                        className={`w-full text-xs border rounded-lg p-2 font-mono transition-all ${
                          userAffLink
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      />
                      {userAffLink && (
                        <span className="absolute right-2 top-2 text-emerald-600 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          ✓ Pronto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pre-formatted WhatsApp Message Preview Box */}
                  <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {formattedMessage}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyDeal(deal)}
                    className={`py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      copiedId === deal.id
                        ? 'bg-emerald-700'
                        : userAffLink
                          ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                          : 'bg-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    {copiedId === deal.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === deal.id ? 'Copiado!' : userAffLink ? 'Copiar com Meu Link' : 'Copiar Oferta'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProductForImage({
                      title: deal.title,
                      price: deal.price,
                      originalPrice: deal.originalPrice,
                      imageUrl: deal.imageUrl,
                      store: deal.store
                    })}
                    className="py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 text-xs font-semibold border border-gray-300 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Banner Stories
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <Tag className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm">Nenhuma oferta encontrada com desconto ≥ {minDiscount}%</h3>
          <p className="text-xs text-gray-500">Tente reduzir o filtro de desconto mínimo ou escolher outro nicho.</p>
        </div>
      )}

      {/* Image Modal */}
      {selectedProductForImage && (
        <ImageGeneratorModal
          product={selectedProductForImage}
          onClose={() => setSelectedProductForImage(null)}
        />
      )}

    </div>
  );
}
