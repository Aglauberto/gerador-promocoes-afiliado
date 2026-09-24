import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Loader2, Copy } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import TemplateManager from './components/TemplateManager';
import AiSettingsModal from './components/AiSettingsModal';
import AffiliateSettingsModal from './components/AffiliateSettingsModal';
import DealFeed from './components/DealFeed';
import { DEFAULT_TEMPLATES } from './utils/defaultTemplates';
import { convertUrlToAffiliateLink } from './utils/affiliateLinkConverter';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'feed' | 'templates' | 'ai' | 'affiliate'

  // Templates State
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('user_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If user has old saved template structure, refresh with new default templates
      if (!parsed.some(t => t.id === 'padrao-regra-afiliado')) {
        return DEFAULT_TEMPLATES;
      }
      return parsed;
    }
    return DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    return 'padrao-regra-afiliado';
  });

  // AI Keys & Provider State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [openaiKey, setOpenaiKey] = useState(() => {
    return localStorage.getItem('openai_api_key') || '';
  });

  const [aiProvider, setAiProvider] = useState(() => {
    return localStorage.getItem('ai_provider') || 'gemini';
  });

  // Link Form State
  const [linkInput, setLinkInput] = useState('https://meli.la/1PDk7te');
  const [storeSelect, setStoreSelect] = useState('autodetect');
  const [autoSend, setAutoSend] = useState(false);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generated Items State
  const [generatedItems, setGeneratedItems] = useState([]);

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem('user_templates', JSON.stringify(templates));
  }, [templates]);

  // Extract all URLs from input text
  const extractedUrls = (linkInput.match(/(https?:\/\/[^\s,;]+)/g) || []).slice(0, 30);

  // Handle product scraping (Batch & Single support up to 30 links)
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (extractedUrls.length === 0) {
      setErrorMessage('Por favor, insira pelo menos um link válido de produto (ex: https://meli.la/...).');
      return;
    }

    setLoadingScrape(true);
    setErrorMessage('');

    const newItems = [];
    const errors = [];

    for (const singleUrl of extractedUrls) {
      try {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: singleUrl.trim() })
        });

        const data = await response.json();

        if (data.success) {
          let productWithSlogan = { ...data.product };
          
          if (apiKey && productWithSlogan.title) {
            try {
              const aiRes = await fetch('/api/generate-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  apiKey,
                  action: 'generate_slogan',
                  productData: productWithSlogan
                })
              });
              const aiData = await aiRes.json();
              if (aiData.success && aiData.result) {
                const bestSlogan = aiData.result.split('\n').filter(Boolean)[0] || aiData.result;
                productWithSlogan.slogan = bestSlogan;
              }
            } catch (aiErr) {}
          }

          newItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            originalUrl: data.originalUrl,
            finalUrl: data.finalUrl,
            store: data.store,
            product: productWithSlogan
          });
        } else {
          errors.push(`Erro em ${singleUrl}: ${data.error}`);
        }
      } catch (err) {
        errors.push(`Falha de conexão em ${singleUrl}`);
      }
    }

    if (newItems.length > 0) {
      setGeneratedItems(prev => [...newItems, ...prev]);
    }

    if (errors.length > 0 && newItems.length === 0) {
      setErrorMessage(errors[0]);
    }

    setLoadingScrape(false);
  };

  const handleRemoveItem = (id) => {
    setGeneratedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, updatedProduct) => {
    setGeneratedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, product: updatedProduct };
      }
      return item;
    }));
  };

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-16">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiKey={apiKey}
        credits={8}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB 1: GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gerar Promoção</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Transforme links de produtos em mensagens promocionais prontas para compartilhar
              </p>
            </div>

            {/* Link Generator Box */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
              
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>💡 Cole até 30 links de uma vez para criar os itens automaticamente.</span>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Link Input Field - Suporta 1 a 30 links colados de uma vez */}
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Link do produto (cole 1 ou até 30 links juntos) *
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate(e);
                          }
                        }}
                        placeholder="Cole 1 ou vários links separados por espaço ou quebra de linha... Ex: https://meli.la/1PDk7te https://meli.la/1VGHppo"
                        required
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-mono resize-none"
                      />
                      {linkInput && (
                        <button
                          type="button"
                          onClick={() => setLinkInput('')}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      💡 <strong>Enter</strong> envia e cria as promoções • <strong>Shift + Enter</strong> pula linha
                    </span>
                  </div>

                  {/* Store Selector */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Loja *
                    </label>
                    <select
                      value={storeSelect}
                      onChange={(e) => setStoreSelect(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    >
                      <option value="autodetect">Detectar Automático 🔍</option>
                      <option value="mercadolivre">Mercado Livre 🛒</option>
                      <option value="amazon">Amazon 📦</option>
                      <option value="shopee">Shopee 🛍️</option>
                      <option value="magalu">Magazine Luiza 💙</option>
                      <option value="aliexpress">AliExpress 🌐</option>
                    </select>
                  </div>

                  {/* Template Selector */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Template *
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-medium text-emerald-900"
                    >
                      {templates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Error Banner if any */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLinkInput('')}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar tudo
                    </button>
                    <span className="text-xs text-gray-400">{extractedUrls.length}/30</span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">

                    <button
                      type="submit"
                      disabled={loadingScrape}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all active:scale-98 disabled:opacity-50"
                    >
                      {loadingScrape ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Extraindo {extractedUrls.length || 1} oferta(s)...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white" />
                          Gerar {extractedUrls.length || 1} promoção(ões)
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </form>
            </div>

            {/* List of Generated Product Cards */}
            {generatedItems.length > 0 ? (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800">
                    Promoções Geradas ({generatedItems.length})
                  </h3>
                  <button
                    onClick={() => setGeneratedItems([])}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Limpar todas
                  </button>
                </div>

                {generatedItems.map((item, idx) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    index={idx}
                    template={activeTemplate}
                    onUpdate={handleUpdateItem}
                    onRemove={handleRemoveItem}
                    apiKey={apiKey}
                    openaiKey={openaiKey}
                    aiProvider={aiProvider}
                    onOpenAiSettings={() => setActiveTab('ai')}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-800 text-base">Nenhuma promoção gerada ainda</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Cole o link do seu produto acima (Mercado Livre, Amazon, Shopee, Magalu) e clique em <strong>Gerar promoção</strong> para ver a mágica acontecer!
                </p>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: DEAL FEED TRACKER */}
        {activeTab === 'feed' && (
          <DealFeed
            template={activeTemplate}
            apiKey={apiKey}
          />
        )}

        {/* TAB 4: TEMPLATE MANAGER */}
        {activeTab === 'templates' && (
          <TemplateManager
            templates={templates}
            setTemplates={setTemplates}
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
          />
        )}

        {/* TAB 5: AI CONFIGURATION */}
        {activeTab === 'ai' && (
          <AiSettingsModal
            apiKey={apiKey}
            setApiKey={setApiKey}
            openaiKey={openaiKey}
            setOpenaiKey={setOpenaiKey}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
          />
        )}

        {/* TAB 6: AFFILIATE SETTINGS */}
        {activeTab === 'affiliate' && (
          <AffiliateSettingsModal />
        )}

      </main>

    </div>
  );
}

