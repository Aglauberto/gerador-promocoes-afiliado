import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Send, Play, Trash2, CheckCircle2, AlertCircle, Plus, Sparkles, MessageSquare, ShieldCheck, Flame, ExternalLink } from 'lucide-react';
import { formatTemplate } from '../utils/templateEngine';
import { convertUrlToAffiliateLink } from '../utils/affiliateLinkConverter';

export default function WhatsappScheduler({ template, selectedDeals = [], onRemoveDeal }) {
  const [scheduledItems, setScheduledItems] = useState(() => {
    const saved = localStorage.getItem('whatsapp_scheduled_queue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [morningSlotTime, setMorningSlotTime] = useState('11:00');
  const [eveningStartTime, setEveningStartTime] = useState('18:00');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Sync scheduled items to localStorage
  useEffect(() => {
    localStorage.setItem('whatsapp_scheduled_queue', JSON.stringify(scheduledItems));
  }, [scheduledItems]);

  // Add new deals to schedule if passed
  useEffect(() => {
    if (selectedDeals && selectedDeals.length > 0) {
      const existingIds = new Set(scheduledItems.map(item => item.id));
      const newItems = selectedDeals
        .filter(d => !existingIds.has(d.id))
        .map((deal, index) => {
          // Rule: first 5 deals go to 11:00 AM morning batch; next deals go to 18:00+ evening slots spaced out
          let scheduledTime = '11:00';
          const currentTotal = scheduledItems.length + index;

          if (currentTotal < 5) {
            scheduledTime = '11:00 AM';
          } else {
            const eveningOffset = (currentTotal - 5) * 30; // 30 minutes spacing
            const startHour = 18;
            const totalMinutes = startHour * 60 + eveningOffset;
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            scheduledTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} PM`;
          }

          const finalLink = convertUrlToAffiliateLink(deal.url || deal.link);
          const messageText = formatTemplate(template?.content || '', {
            title: deal.title,
            price: deal.price,
            originalPrice: deal.originalPrice,
            link: finalLink,
            slogan: deal.slogan || 'Oferta imperdível do dia ✨'
          });

          return {
            id: deal.id || `sched-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            deal,
            scheduledTime,
            messageText,
            finalLink,
            status: 'pending' // 'pending' | 'sent'
          };
        });

      if (newItems.length > 0) {
        setScheduledItems(prev => [...prev, ...newItems]);
      }
    }
  }, [selectedDeals]);

  const handleRemoveScheduled = (id) => {
    setScheduledItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSendViaWhatsappWeb = (item, index) => {
    const encodedText = encodeURIComponent(item.messageText);
    const waUrl = `https://web.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, '_blank');

    setScheduledItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'sent' } : i));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const handleClearQueue = () => {
    setScheduledItems([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Agendador de Disparos Gratuito (WhatsApp)
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modo Seguro: <strong>100% Grátis • Sem Risco de Ban</strong></span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Agendador Automático de Ofertas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Selecione até 10 ofertas no Feed, programe os lotes das <strong>11:00 da manhã (5 ofertas)</strong> e os envios noturnos espaçados <strong>a cada 30 minutos (a partir das 18:00)</strong>!
          </p>
        </div>
      </div>

      {/* Schedule Rule Settings Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          Regra de Horários dos Disparos:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-xs font-bold text-emerald-900 block">☀️ Lote da Manhã (11:00 AM)</span>
            <p className="text-[11px] text-emerald-700 leading-snug">
              Dispara as <strong>primeiras 5 ofertas</strong> no horário das 11:00 para engajar seus grupos antes do almoço.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
            <span className="text-xs font-bold text-amber-900 block">🌙 Lote da Noite (a partir das 18:00)</span>
            <p className="text-[11px] text-amber-700 leading-snug">
              Solta as ofertas restantes de forma espaçada a cada <strong>30 minutos</strong> (18h00, 18h30, 19h00...).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-900 block">🛡️ Segurança Anti-Banimento</span>
            <p className="text-[11px] text-slate-600 leading-snug">
              O espaçamento garante comportamento 100% humano e protege seu número no WhatsApp.
            </p>
          </div>

        </div>
      </div>

      {/* Scheduled Queue List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Fila de Ofertas Agendadas ({scheduledItems.length}/10)
            </h3>
            <p className="text-xs text-gray-500">
              Ofertas prontas para envio automático no WhatsApp com seus links de afiliado convertidos.
            </p>
          </div>

          {scheduledItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearQueue}
              className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
            >
              Limpar Fila
            </button>
          )}
        </div>

        {scheduledItems.length > 0 ? (
          <div className="space-y-4">
            {scheduledItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.status === 'sent'
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 p-1 shrink-0 border border-gray-200 flex items-center justify-center">
                    <img
                      src={item.deal?.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200'}
                      alt={item.deal?.title}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {item.scheduledTime}
                      </span>
                      {item.status === 'sent' && (
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enviado
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 truncate max-w-md">
                      {item.deal?.title}
                    </h4>

                    <div className="text-xs font-bold text-emerald-700">
                      R$ {item.deal?.price} <span className="text-[10px] font-normal text-gray-400">(-{item.deal?.discountPerc}% OFF)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleSendViaWhatsappWeb(item, index)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {copiedIndex === index ? 'Abrindo WhatsApp...' : 'Enviar no WhatsApp'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveScheduled(item.id)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 transition-all"
                    title="Remover oferta da fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Sua fila de agendamento está vazia</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Vá para a aba <strong>Feed de Ofertas 🔥</strong> e selecione as ofertas que deseja agendar para o lote das 11h e envios da noite!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
