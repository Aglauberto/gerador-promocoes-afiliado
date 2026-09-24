export const DEFAULT_TEMPLATES = [
  {
    id: 'padrao-regra-afiliado',
    name: 'Padrão Afiliado ⭐ (Gancho + Produto + Preço + Link)',
    isDefault: true,
    content: `{slogan}

📦 *{titulo}*

{bloco_preco}

🔗 *Garanta o seu aqui:* {link}`
  },
  {
    id: 'oferta-direta',
    name: 'Direto e Objetivo ⚡',
    content: `🔥 *{titulo}*

{bloco_preco}

🛒 Compre pelo link seguro: {link}`
  },
  {
    id: 'completo-com-cupom',
    name: 'Com Cupom de Desconto 🎟️',
    content: `{slogan}

📦 *{titulo}*

{bloco_preco}
🎟️ *Cupom:* {cupom}

👇 *Acesse pelo link oficial:*
{link}`
  }
];
