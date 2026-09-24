import React, { useState } from 'react';
import { Sparkles, Key, ExternalLink, Check, ShieldCheck, Zap, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function AiSettingsModal({
  apiKey,
  setApiKey,
  openaiKey,
  setOpenaiKey,
  aiProvider,
  setAiProvider
}) {
  const [geminiInput, setGeminiInput] = useState(apiKey || '');
  const [openaiInput, setOpenaiInput] = useState(openaiKey || '');
  const [savedGemini, setSavedGemini] = useState(false);
  const [savedOpenai, setSavedOpenai] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const handleSaveGemini = () => {
    const trimmed = geminiInput.trim();
    setApiKey(trimmed);
    localStorage.setItem('gemini_api_key', trimmed);
    setSavedGemini(true);
    setTimeout(() => setSavedGemini(false), 3000);
  };

  const handleSaveOpenai = () => {
    const trimmed = openaiInput.trim();
    setOpenaiKey(trimmed);
    localStorage.setItem('openai_api_key', trimmed);
    setSavedOpenai(true);
    setTimeout(() => setSavedOpenai(false), 3000);
  };

  const handleTestKey = async (providerName) => {
    const keyToTest = providerName === 'openai' ? openaiInput.trim() : geminiInput.trim();
    if (!keyToTest) return;

    setTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerName,
          apiKey: geminiInput.trim(),
          openaiKey: openaiInput.trim(),
          action: 'generate_slogan',
          productData: { title: 'Smartphone Teste' }
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({
          success: true,
          message: `Conexão com ${providerName === 'openai' ? 'OpenAI (ChatGPT)' : 'Google Gemini'} realizada com sucesso!`
        });
      } else {
        setTestStatus({ success: false, message: data.error || 'Erro ao validar chave.' });
      }
    } catch (err) {
      setTestStatus({ success: false, message: 'Não foi possível conectar ao servidor.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-200">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Configuração de Inteligência Artificial & Imagens</h2>
          <p className="text-sm text-gray-500">Escolha entre Google Gemini (Gratuito) ou OpenAI (GPT / DALL-E) para gerar textos e imagens</p>
        </div>
      </div>

      {/* Provider Selector Switcher */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">IA Ativa para Geração de Textos:</h3>
        <div className="grid grid-cols-2 gap-3">
          
          <button
            type="button"
            onClick={() => {
              setAiProvider('gemini');
              localStorage.setItem('ai_provider', 'gemini');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              aiProvider === 'gemini'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Google Gemini 3.6 Flash
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% Gratuito
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Ótimo para slogans, legendas e textos de WhatsApp rápido.</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiProvider('openai');
              localStorage.setItem('ai_provider', 'openai');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              aiProvider === 'openai'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                OpenAI (GPT-4o & DALL-E 3)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Sua conta R$30/mês
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Usa sua chave API da OpenAI para textos e criação de imagens.</p>
          </button>

        </div>
      </div>

      {/* Section 1: Google Gemini Key */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            1. Chave da API do Google Gemini
          </label>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Pegar chave grátis no AI Studio <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={geminiInput}
            onChange={(e) => setGeminiInput(e.target.value)}
            placeholder="Cole aqui sua chave (ex: AQ.Ab8R... ou AIzaSy...)"
            className="flex-1 text-xs font-mono border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestKey('gemini')}
              disabled={testing || !geminiInput.trim()}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Testar Gemini
            </button>
            <button
              onClick={handleSaveGemini}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              {savedGemini ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: OpenAI Key */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            2. Chave da API da OpenAI (GPT-4o / DALL-E)
          </label>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            Pegar chave na OpenAI <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={openaiInput}
            onChange={(e) => setOpenaiInput(e.target.value)}
            placeholder="Cole aqui sua chave OpenAI (ex: sk-proj-...)"
            className="flex-1 text-xs font-mono border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestKey('openai')}
              disabled={testing || !openaiInput.trim()}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Testar OpenAI
            </button>
            <button
              onClick={handleSaveOpenai}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              {savedOpenai ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {testStatus && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            testStatus.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {testStatus.message}
        </div>
      )}

      {/* Features summary */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Chaves armazenadas localmente no seu navegador.
        </span>
        <span className="font-semibold text-slate-700">
          IA Selecionada: {aiProvider === 'openai' ? 'OpenAI (GPT-4o)' : 'Google Gemini (Gratuito)'}
        </span>
      </div>

    </div>
  );
}
