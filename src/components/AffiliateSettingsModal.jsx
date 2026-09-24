import React, { useState, useEffect } from 'react';
import { Tag, ShieldCheck, CheckCircle2, ExternalLink, RefreshCw, AlertCircle, Save, Eye, Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { getAffiliateSettings, saveAffiliateSettings, convertUrlToAffiliateLink, shortenAffiliateLink, parseCurlCommand } from '../utils/affiliateLinkConverter';

export default function AffiliateSettingsModal() {
  const [settings, setSettings] = useState(() => getAffiliateSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState('');
  const [showCurlHelp, setShowCurlHelp] = useState(true);

  // Live link tester state
  const [testUrl, setTestUrl] = useState('https://www.mercadolivre.com.br/panela-pressao-brinox-ceramic-pressure-inducao-68l-vanilla/p/MLB22931744');
  const [convertedResult, setConvertedResult] = useState('');
  const [shortResult, setShortResult] = useState('');
  const [loadingShort, setLoadingShort] = useState(false);

  useEffect(() => {
    if (testUrl) {
      setConvertedResult(convertUrlToAffiliateLink(testUrl, settings));
      setShortResult('');
    }
  }, [testUrl, settings]);

  const handleGenerateShort = async () => {
    if (!testUrl) return;
    setLoadingShort(true);
    const short = await shortenAffiliateLink(testUrl, settings);
    setShortResult(short);
    setLoadingShort(false);
  };

  const handleImportCurl = () => {
    setImportError('');
    setImportSuccess(false);

    if (!curlInput.trim()) {
      setImportError('Por favor, cole o comando cURL copiado do seu navegador.');
      return;
    }

    const parsed = parseCurlCommand(curlInput);

    if (parsed && (parsed.cookie || parsed.csrfToken || parsed.tag)) {
      const updated = {
        ...settings,
        cookie: parsed.cookie || settings.cookie,
        csrfToken: parsed.csrfToken || settings.csrfToken,
        tag: parsed.tag || settings.tag,
        enabled: true
      };
      setSettings(updated);
      saveAffiliateSettings(updated);
      setImportSuccess(true);
      setCurlInput('');
      setTimeout(() => setImportSuccess(false), 4000);
    } else {
      setImportError('Não foi possível identificar o Cookie ou Token no cURL fornecido. Verifique se copiou a requisição "createLink".');
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    saveAffiliateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold w-fit">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Configuração Oficial Mercado Livre Afiliados
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Configurar Mercado Livre
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Importe seu cURL com 1 clique para conectar sua sessão e garantir que <strong>100% dos links e ofertas</strong> sejam convertidos com a sua tag de comissão.
          </p>
        </div>
      </div>

      {/* Accordion 1: Importar via cURL (RECOMENDADO) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        <button
          type="button"
          onClick={() => setShowCurlHelp(!showCurlHelp)}
          className="w-full p-5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between border-b border-gray-200 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Importar via cURL</h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  ⭐ RECOMENDADO
                </span>
              </div>
              <p className="text-xs text-gray-500">Copie o comando cURL do navegador e cole aqui (captura automática mais fácil e rápida).</p>
            </div>
          </div>

          {showCurlHelp ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showCurlHelp && (
          <div className="p-6 space-y-4">
            
            {/* Step by Step Guide Box */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-3 text-xs border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1">
                  📖 Como obter o cURL no Chrome:
                </span>
                <a
                  href="https://www.mercadolivre.com.br/afiliados/linkbuilder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Abrir LinkBuilder no Mercado Livre ↗
                </a>
              </div>

              <ol className="space-y-2 list-decimal list-inside text-slate-300 leading-relaxed font-medium">
                <li>Acesse pelo Chrome no computador: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">mercadolivre.com.br/afiliados/linkbuilder</code></li>
                <li>Pressione <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 font-mono text-[11px]">F12</kbd> no teclado para abrir as Ferramentas do Desenvolvedor e clique na aba <strong>Network</strong> (Rede).</li>
                <li>No campo de filtro, digite <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">create</code></li>
                <li>Gere qualquer link de afiliado normalmente na página do Mercado Livre.</li>
                <li>Clique com o botão direito na requisição <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">createLink</code> e selecione <strong>Copiar &gt; Copiar como cURL (cmd / bash)</strong>.</li>
                <li>Cole o comando no campo abaixo e clique em <strong>Importar</strong>.</li>
              </ol>
            </div>

            {/* Textarea for cURL */}
            <div className="space-y-2">
              <textarea
                rows={4}
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                placeholder="Cole aqui o comando cURL copiado do navegador..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              />

              {importError && (
                <div className="text-xs text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  Sucesso! Cookie da sessão, CSRF Token e Tag de Afiliado foram extraídos e salvos!
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleImportCurl}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2 transition-all active:scale-98"
                >
                  <Terminal className="w-4 h-4" />
                  Importar Dados do cURL
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
        
        {/* Toggle Auto Conversion */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Conversão Automática de Links</h3>
              <p className="text-xs text-gray-600">Injeta automaticamente suas tags de comissão em todos os links gerados ou copiados.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Credentials Inputs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            🔑 Dados da Sessão do Mercado Livre
          </h3>

          {/* Cookie */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cookie da sessão do Mercado Livre:
            </label>
            <input
              type="text"
              value={settings.cookie || ''}
              onChange={(e) => setSettings({ ...settings, cookie: e.target.value })}
              placeholder="Cookie da sessão do Mercado Livre"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* CSRF Token */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              CSRF Token (x-csrf-token):
            </label>
            <input
              type="text"
              value={settings.csrfToken || ''}
              onChange={(e) => setSettings({ ...settings, csrfToken: e.target.value })}
              placeholder="Token x-csrf-token"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Tag de Afiliado */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tag de Afiliado:
            </label>
            <input
              type="text"
              value={settings.tag || ''}
              onChange={(e) => setSettings({ ...settings, tag: e.target.value })}
              placeholder="Ex: divulganinja ou sua_tag"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Live Verification Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              Teste de Verificação de Link em Tempo Real
            </h4>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
              Verificação Garantida
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] text-slate-300">Cole qualquer link do Mercado Livre para testar a conversão:</label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Resultado Convertido Oficial (Tag Injetada):</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Garantia de Comissão Mercado Livre</span>
            </div>
            <div className="font-mono text-xs text-emerald-300 break-all leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              {convertedResult || testUrl}
            </div>

            {shortResult && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block mb-1">Link Curto Gerado (meli.la / encurtado):</span>
                <div className="font-mono text-xs text-amber-300 break-all leading-relaxed bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30">
                  {shortResult}
                </div>
              </div>
            )}
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 max-w-sm">
              {settings.tag ? `✅ Sua tag "${settings.tag}" está ativa!` : '⚠️ Importe ou preencha sua Tag acima.'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateShort}
                disabled={loadingShort}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all disabled:opacity-50"
              >
                {loadingShort ? 'Encurtando...' : 'Gerar Link Curto (meli.la) ⚡'}
              </button>

              <a
                href={shortResult || convertedResult || testUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-all"
              >
                Testar no Navegador ↗
              </a>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Configurações salvas com sucesso!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-2 transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>

      </form>
    </div>
  );
}
