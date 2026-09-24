import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Copy, Info, RotateCcw } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../utils/defaultTemplates';

export default function TemplateManager({ templates, setTemplates, selectedTemplateId, setSelectedTemplateId }) {
  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const placeholders = [
    { code: '{titulo}', label: 'Título do Produto' },
    { code: '{preco_de}', label: 'Preço Original (De)' },
    { code: '{preco_por}', label: 'Preço Promocional (Por)' },
    { code: '{link}', label: 'Link de Afiliado' },
    { code: '{cupom}', label: 'Cupom de Desconto' },
    { code: '{slogan}', label: 'Slogan / Frase' },
    { code: '{sku}', label: 'Código SKU' },
    { code: '{desconto}', label: '% de Desconto' },
  ];

  const handleStartEdit = (tpl) => {
    setEditingId(tpl.id);
    setNameInput(tpl.name);
    setContentInput(tpl.content);
  };

  const handleSaveEdit = () => {
    if (!nameInput.trim() || !contentInput.trim()) return;

    setTemplates(prev => prev.map(t => {
      if (t.id === editingId) {
        return { ...t, name: nameInput.trim(), content: contentInput.trim() };
      }
      return t;
    }));
    setEditingId(null);
  };

  const handleCreateNew = () => {
    if (!nameInput.trim() || !contentInput.trim()) return;
    const newTpl = {
      id: `custom-${Date.now()}`,
      name: nameInput.trim(),
      content: contentInput.trim()
    };
    setTemplates(prev => [...prev, newTpl]);
    setSelectedTemplateId(newTpl.id);
    setShowCreateModal(false);
    setNameInput('');
    setContentInput('');
  };

  const handleDelete = (id) => {
    if (templates.length <= 1) {
      alert('Você precisa manter pelo menos 1 template salvo!');
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(templates.find(t => t.id !== id)?.id || templates[0].id);
    }
  };

  const handleResetDefault = () => {
    if (confirm('Deseja restaurar os templates padrão originais?')) {
      setTemplates(DEFAULT_TEMPLATES);
      setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
    }
  };

  const insertPlaceholder = (code) => {
    setContentInput(prev => prev + ' ' + code);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🎨 Gerenciador de Templates
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Crie e personalize os formatos das suas mensagens. O template selecionado será usado automaticamente em novos links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </button>
          <button
            onClick={() => {
              setNameInput('');
              setContentInput('*{titulo}*\n\n💰 Por: R$ {preco_por}\n🔗 {link}');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Template
          </button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          const isEditing = editingId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Nome do Template"
                    className="w-full text-sm font-bold border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                  <textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    rows={6}
                    className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                  />
                  
                  {/* Tag helpers */}
                  <div className="flex flex-wrap gap-1">
                    {placeholders.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => insertPlaceholder(p.code)}
                        className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-emerald-100 text-gray-700 font-mono"
                      >
                        + {p.code}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{tpl.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(tpl)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tpl.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <pre className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {tpl.content}
                    </pre>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {isSelected ? 'Usado em todas as gerações' : 'Clique para usar este template'}
                    </span>
                    <button
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Template Ativo ✓' : 'Usar este template'}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal to Create Template */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Criar Novo Template</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Template *</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Formato Stories ⭐"
                className="w-full text-sm border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Conteúdo do Template *</label>
              <textarea
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                rows={6}
                className="w-full text-xs font-mono border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-gray-600 mb-1.5">Clique nas variáveis para inserir:</span>
              <div className="flex flex-wrap gap-1">
                {placeholders.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => insertPlaceholder(p.code)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 hover:bg-emerald-100 text-gray-700 font-mono"
                  >
                    + {p.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                Criar Template
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
