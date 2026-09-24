/**
 * Smart Plant & Product Slogan Generator
 * Analyzes title for plant characteristics and creates tailored hooks of <= 10 words
 */
export function getSmartPlantSlogan(title = '', existingSlogan = '') {
  if (existingSlogan && existingSlogan.trim() && !existingSlogan.includes('Deixe sua casa ainda mais aconchegante')) {
    return existingSlogan.trim();
  }

  const t = (title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (t.includes('anturio')) return 'Florada vibrante e perfeita para ambientes internos ✨';
  if (t.includes('rosa do deserto') || t.includes('rosas do deserto')) return 'Florada exuberante e muito fácil de cultivar ao sol 🌸';
  if (t.includes('orquidea') || t.includes('orquideas')) return 'Elegância pura e florada marcante para seu lar 🌺';
  if (t.includes('cacto') || t.includes('suculenta')) return 'Super resistente, estilosa e não dá trabalho 🌵';
  if (t.includes('lirio')) return 'Purifica o ar e traz elegância para dentro de casa 🌿';
  if (t.includes('jiboia')) return 'Folhagem pendente linda e super fácil de cuidar 🪴';
  if (t.includes('samambaia')) return 'Volume verde exuberante e ar renovado no seu ambiente 🌿';
  if (t.includes('zamioculca')) return 'Super resistente, folhas brilhantes e zero complicação 🌱';
  if (t.includes('espada de') || t.includes('espada de sao jorge')) return 'Proteção, beleza e baixíssima manutenção no lar 🛡️🌿';
  if (t.includes('bonsai')) return 'Arte viva encantadora para trazer tranquilidade e paz 🎋';
  if (t.includes('kokedama') || t.includes('suporte')) return 'Valorize suas plantas com muito charme na decoração ✨';
  if (t.includes('vaso') || t.includes('vasos')) return 'Design elegante para destacar a beleza das suas plantas 🪴';
  if (t.includes('adubo') || t.includes('fertilizante') || t.includes('npk')) return 'Nutrição poderosa para acelerar floradas e raízes fortes 🌱';
  if (t.includes('ferramenta') || t.includes('tesoura') || t.includes('regador')) return 'Praticidade essencial para cuidar do seu jardim com carinho ✂️';
  if (t.includes('muda') || t.includes('planta') || t.includes('flor')) return 'Flor bonita e perfeita para decorar seu ambiente com vida 🌸';
  if (t.includes('cadeira') || t.includes('mesa') || t.includes('espreguicadeira')) return 'Conforto e charme para transformar seu espaço externo 🛋️';
  if (t.includes('espelho') || t.includes('quadro') || t.includes('luminaria')) return 'Iluminação e estilo para renovar seu ambiente ✨';

  return 'Flor bonita e perfeita para decorar seu ambiente com vida 🌸';
}

/**
 * Replaces placeholders in template string with product data
 * Enforces rule: "De R$ X por R$ Y (Economize R$ Z)" ONLY if economy >= R$ 5.00
 */
export function formatTemplate(templateText, productData) {
  if (!templateText) return '';

  const {
    title = '',
    price = '',
    originalPrice = '',
    link = '',
    coupon = '',
    slogan = '',
    sku = ''
  } = productData;

  const numPrice = parseFloat(String(price).replace(',', '.'));
  const numOrig = parseFloat(String(originalPrice).replace(',', '.'));

  let economyAmount = 0;
  let hasMinEconomy = false;

  if (!isNaN(numPrice) && !isNaN(numOrig) && numOrig > numPrice) {
    economyAmount = numOrig - numPrice;
    if (economyAmount >= 5.00) {
      hasMinEconomy = true;
    }
  }

  // Format currency display strings
  const formattedPrice = !isNaN(numPrice) ? numPrice.toFixed(2).replace('.', ',') : price;
  const formattedOrig = !isNaN(numOrig) ? numOrig.toFixed(2).replace('.', ',') : originalPrice;
  const formattedEconomy = economyAmount.toFixed(2).replace('.', ',');

  // Build price block based on economy rule
  let blocoPreco = '';
  if (hasMinEconomy) {
    blocoPreco = `🏷️ De ~R$ ${formattedOrig}~ por *R$ ${formattedPrice}* (Economize R$ ${formattedEconomy})`;
  } else {
    blocoPreco = `💰 *Por apenas:* R$ ${formattedPrice}`;
  }

  // Calculate discount percentage
  let discountPerc = '';
  if (hasMinEconomy && numOrig > 0) {
    discountPerc = Math.round((economyAmount / numOrig) * 100).toString();
  }

  // Smart plant/product contextual slogan
  const finalSlogan = getSmartPlantSlogan(title, slogan);

  let formatted = templateText
    .replace(/\{slogan\}/g, finalSlogan)
    .replace(/\{titulo\}/g, title)
    .replace(/\{bloco_preco\}/g, blocoPreco)
    .replace(/\{preco_por\}/g, formattedPrice)
    .replace(/\{preco_de\}/g, formattedOrig || formattedPrice)
    .replace(/\{economize\}/g, formattedEconomy)
    .replace(/\{link\}/g, link)
    .replace(/\{cupom\}/g, coupon || '')
    .replace(/\{sku\}/g, sku || '')
    .replace(/\{desconto\}/g, discountPerc || '0');

  // Clean orphan lines if cupom is empty
  if (!coupon) {
    formatted = formatted.replace(/^.*🎟️.*Cupom:.*$/gm, '').replace(/^.*Cupom:.*$/gm, '');
  }

  return formatted.replace(/\n{3,}/g, '\n\n').trim();
}
