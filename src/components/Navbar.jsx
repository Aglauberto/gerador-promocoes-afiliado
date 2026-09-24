import React from 'react';
import { Sparkles, LayoutTemplate, Settings, Zap, MessageSquareCode, Flame, Tag, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiKey, credits = 8 }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight flex items-center gap-2">
                Gerador de Promoções
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">Afiliado Pro</span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Transforme links em mensagens prontas para WhatsApp</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'generator'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageSquareCode className="w-4 h-4" />
              <span className="hidden md:inline">Gerar Promoção</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Feed de Ofertas 🔥</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span className="hidden md:inline">Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('affiliate')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'affiliate'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Afiliado 🎯</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === 'ai'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Configurar IA</span>
              {apiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="IA Conectada" />
              )}
            </button>
          </nav>

          {/* Right Status / Actions */}
          <div className="flex items-center gap-3">
          </div>

        </div>
      </div>
    </header>
  );
}
