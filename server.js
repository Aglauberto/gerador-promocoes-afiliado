import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

function getAxiosHeaders() {
  const randomUa = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent': randomUa,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };
}

const AXIOS_HEADERS = getAxiosHeaders();

function detectStore(urlStr) {
  const url = urlStr.toLowerCase();
  if (url.includes('mercadolivre') || url.includes('meli.la') || url.includes('mercadolibre')) {
    return { name: 'Mercado Livre', code: 'mercadolivre', icon: '🛒' };
  }
  if (url.includes('amazon') || url.includes('amzn.to')) {
    return { name: 'Amazon', code: 'amazon', icon: '📦' };
  }
  if (url.includes('shopee') || url.includes('shope.ee')) {
    return { name: 'Shopee', code: 'shopee', icon: '🛍️' };
  }
  if (url.includes('magazineluiza') || url.includes('magalu') || url.includes('luiza.com')) {
    return { name: 'Magazine Luiza', code: 'magalu', icon: '💙' };
  }
  if (url.includes('aliexpress')) {
    return { name: 'AliExpress', code: 'aliexpress', icon: '🌐' };
  }
  if (url.includes('shein')) {
    return { name: 'Shein', code: 'shein', icon: '👗' };
  }
  return { name: 'Loja Online', code: 'outros', icon: '🏪' };
}

// Scrape product endpoint (Supports both /api/scrape and /scrape on Vercel)
app.post(['/api/scrape', '/scrape'], async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL do produto é obrigatória' });
  }

  try {
    const response = await axios.get(url, {
      headers: getAxiosHeaders(),
      maxRedirects: 10,
      timeout: 8000,
    });

    const finalUrl = response.request?.res?.responseUrl || url;
    const storeInfo = detectStore(finalUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    let title = '';
    let image = '';
    let price = '';
    let originalPrice = '';
    let currency = 'R$';
    let coupon = '';
    let slogan = '';

    // 1. STORE-SPECIFIC PARSER (HIGHEST PRIORITY - Exact live prices displayed on page)
    if (storeInfo.code === 'mercadolivre') {
      title = $('.ui-pdp-title, .poly-component__title').first().text().trim();

      // Original strike price (De)
      const origPriceEl = $('.ui-pdp-price__part--original .andes-money-amount, s .andes-money-amount, .andes-money-amount--previous, .ui-pdp-price__original-value').first();
      if (origPriceEl.length) {
        const text = origPriceEl.text().trim();
        const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
        if (m) originalPrice = m[1].replace(/\./g, '').replace(',', '.');
      }

      // Active promotional price (Por)
      const currentPriceEl = $('.ui-pdp-price__second-line .andes-money-amount, .poly-price__current .andes-money-amount, .ui-pdp-price__part--medium .andes-money-amount').first();
      if (currentPriceEl.length) {
        const text = currentPriceEl.text().trim();
        const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
        if (m) price = m[1].replace(/\./g, '').replace(',', '.');
      }

      // Swap if price was assigned higher value than originalPrice
      if (originalPrice && price && parseFloat(price) > parseFloat(originalPrice)) {
        const temp = price;
        price = originalPrice;
        originalPrice = temp;
      }
    } else if (storeInfo.code === 'amazon') {
      title = $('#productTitle').text().trim();
      const priceWhole = $('.a-price-whole').first().text().replace(/[^\d]/g, '');
      const priceFraction = $('.a-price-fraction').first().text().trim();
      if (priceWhole) {
        price = priceFraction ? `${priceWhole}.${priceFraction}` : priceWhole;
      }
      const strikePrice = $('.a-text-price .a-offscreen').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
      if (strikePrice && strikePrice !== price) {
        originalPrice = strikePrice;
      }
    }

    // 2. JSON-LD FALLBACK (If price or title missing)
    if (!price || !title) {
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonText = $(el).html();
          if (!jsonText) return;
          const data = JSON.parse(jsonText);
          const schemas = Array.isArray(data) ? data : [data];
          for (const schema of schemas) {
            if (schema['@type'] === 'Product' || schema['@type'] === 'ItemPage') {
              if (!title && schema.name) title = schema.name;
              if (!image && schema.image) {
                image = Array.isArray(schema.image) ? schema.image[0] : (schema.image.url || schema.image);
              }
              if (!price && schema.offers) {
                const offer = Array.isArray(schema.offers) ? schema.offers[0] : schema.offers;
                if (offer.price && parseFloat(offer.price) > 0) {
                  price = String(offer.price);
                }
              }
            }
          }
        } catch (err) {}
      });
    }

    // 3. OPENGRAPH / META TAGS FALLBACK
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || 
              $('meta[name="twitter:title"]').attr('content') || 
              $('title').text().trim();
    }

    if (!image) {
      image = $('meta[property="og:image"]').attr('content') || 
              $('meta[name="twitter:image"]').attr('content') || 
              $('link[rel="image_src"]').attr('href') || '';
    }

    if (image && image.startsWith('//')) {
      image = 'https:' + image;
    }

    // 4. PRIMARY DOM SCANNER FALLBACK (If price still missing)
    if (!price || parseFloat(price) === 0) {
      const domPrices = [];
      $('.andes-money-amount, [class*="price"], [class*="Price"]').each((i, el) => {
        if (i > 4) return;
        const text = $(el).text().trim();
        const match = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
        if (match) {
          const numStr = match[1].replace(/\./g, '').replace(',', '.');
          const val = parseFloat(numStr);
          if (!isNaN(val) && val > 0 && val < 500000) {
            domPrices.push(val);
          }
        }
      });

      if (domPrices.length >= 2) {
        if (domPrices[0] > domPrices[1]) {
          originalPrice = domPrices[0].toFixed(2);
          price = domPrices[1].toFixed(2);
        } else {
          price = domPrices[0].toFixed(2);
        }
      } else if (domPrices.length === 1) {
        price = domPrices[0].toFixed(2);
      }
    }

    // Clean title (Instant Smart Title Cleaner)
    const cleanProductTitle = (rawTitle) => {
      if (!rawTitle) return 'Produto sem título';
      let cleaned = rawTitle
        .replace(/\s*[\-\|]\s*(Amazon|Mercado Livre|Shopee|Magazine Luiza|Magalu|AliExpress|Shein|MercadoLibre).*$/gi, '')
        .replace(/\s*[\(\[\{][^\)\}\]]*[\)\}\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.length > 70) {
        cleaned = cleaned.substring(0, 70).replace(/\s+[^\s]*$/, '') + '...';
      }
      return cleaned;
    };

    const finalTitle = cleanProductTitle(title);

    const formatPriceVal = (val) => {
      if (!val) return '';
      const num = parseFloat(String(val).replace(',', '.'));
      if (isNaN(num) || num <= 0) return '';
      return num.toFixed(2);
    };

    return res.json({
      success: true,
      originalUrl: url,
      finalUrl,
      store: storeInfo,
      product: {
        title: finalTitle,
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        currency,
        imageUrl: image,
        coupon,
        slogan,
      }
    });

  } catch (error) {
    console.error('Erro na raspagem:', error.message);
    return res.status(500).json({
      error: 'Não foi possível extrair os dados do link fornecido. Verifique se o link está correto.',
      details: error.message
    });
  }
});

// Endpoint to generate official short affiliate link (meli.la) via Mercado Livre cURL session
app.post(['/api/affiliate/shorten', '/affiliate/shorten'], async (req, res) => {
  const { url, cookie, csrfToken, tag } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL do produto é obrigatória' });
  }

  // 1. Attempt official Mercado Livre LinkBuilder API request using imported cURL session
  if (cookie && csrfToken) {
    try {
      const mlResponse = await axios.post(
        'https://www.mercadolivre.com.br/afiliados/linkbuilder/api/createLink',
        {
          url: url.trim(),
          tag: tag ? tag.trim() : undefined
        },
        {
          headers: {
            'Cookie': cookie.trim(),
            'x-csrf-token': csrfToken.trim(),
            'Content-Type': 'application/json',
            'User-Agent': AXIOS_HEADERS['User-Agent'],
            'Origin': 'https://www.mercadolivre.com.br',
            'Referer': 'https://www.mercadolivre.com.br/afiliados/linkbuilder',
            'Accept': 'application/json'
          },
          timeout: 6000
        }
      );

      const data = mlResponse.data;
      const shortUrl = data?.shortLink || data?.url || data?.link || data?.short_url || data?.data?.shortLink;

      if (shortUrl && typeof shortUrl === 'string' && shortUrl.includes('http')) {
        return res.json({
          success: true,
          shortUrl,
          originalUrl: url,
          source: 'mercadolivre_official'
        });
      }
    } catch (err) {
      console.log('Tentativa de encurtamento via API Mercado Livre:', err.response?.data || err.message);
    }
  }

  // 2. Build parameter-appended affiliate link fallback
  let fullAffiliateUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('mercadolivre') || parsed.hostname.includes('mercadolibre')) {
      if (tag && tag.trim()) {
        parsed.searchParams.set('matt_tool', '12345678');
        parsed.searchParams.set('matt_word', tag.trim());
      }
      fullAffiliateUrl = parsed.toString();
    }
  } catch (e) {}

  // 3. Clean Shortener Fallback (TinyURL) so links are never huge in WhatsApp
  try {
    const tinyRes = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(fullAffiliateUrl)}`, { timeout: 4000 });
    if (tinyRes.data && typeof tinyRes.data === 'string' && tinyRes.data.startsWith('http')) {
      return res.json({
        success: true,
        shortUrl: tinyRes.data,
        fullUrl: fullAffiliateUrl,
        source: 'tinyurl_fallback'
      });
    }
  } catch (e) {}

  return res.json({
    success: true,
    shortUrl: fullAffiliateUrl,
    fullUrl: fullAffiliateUrl,
    source: 'full_param'
  });
});

// AI route dedicated exclusively to Google Gemini
app.post(['/api/generate-ai', '/generate-ai'], async (req, res) => {
  const { apiKey, action, productData, customPrompt } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Chave de API do Google Gemini não fornecida.' });
  }

  try {
    let promptText = '';

    if (action === 'generate_slogan') {
      promptText = `Você é um especialista em vendas de plantas, jardinagem e decoração de ambientes.
Analise este produto: "${productData.title}".
Identifique exatamente qual é a planta ou item (ex: Antúrio, Rosa do Deserto, Orquídea, Cacto, Vaso, Suporte, Adubo, etc.).
Crie 1 (um) gancho promocional/slogan chamativo de NO MÁXIMO 10 palavras em português.
O gancho DEVE destacar obrigatoriamente uma característica marcante da planta ou do item, como por exemplo:
- "Florada vibrante e perfeita para ambientes internos ✨"
- "Não dá trabalho, é super resistente e linda 🌵"
- "Floresce fácil dentro de casa e ilumina a decoração 🌸"
- "Folhagem exuberante e de fácil cuidado para seu lar 🌿"

Responda APENAS com o texto do gancho de até 10 palavras com 1 ou 2 emojis adequados, sem aspas ou explicações.`;
    } else if (action === 'improve_title') {
      promptText = `Resuma e otimize este título de produto para ser mais amigável em um anúncio do WhatsApp: "${productData.title}". Mantenha as informações mais importantes. Responda apenas com o novo título limpo.`;
    } else if (action === 'custom_caption') {
      promptText = customPrompt || `Escreva uma legenda de oferta para WhatsApp sobre o produto: ${productData.title}, Preço: R$ ${productData.price}.`;
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastErr = null;
    let generatedText = '';

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
            {
              contents: [{ parts: [{ text: promptText }] }]
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 15000
            }
          );
          generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (generatedText) break;
        } catch (err) {
          lastErr = err;
          if (err.response?.status === 503 && attempt < 2) {
            await new Promise(r => setTimeout(r, 1000));
          } else {
            // Try next model if 404/400 or other error
            break;
          }
        }
      }
      if (generatedText) break;
    }

    if (!generatedText && lastErr) {
      const errMsg = lastErr.response?.data?.error?.message || lastErr.message;
      return res.status(500).json({
        error: `Falha ao comunicar com a IA do Google Gemini. ${errMsg}`,
        details: errMsg
      });
    }

    return res.json({ success: true, result: generatedText });

  } catch (error) {
    console.error('Erro na API do Gemini:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Falha ao comunicar com a IA do Google Gemini. Verifique sua chave de API.',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Search and track deals endpoint
app.post(['/api/deals/search', '/deals/search'], async (req, res) => {
  const { query, niche, store = 'mercadolivre', minDiscount = 10 } = req.body;
  const rawQuery = (query || '').toLowerCase().trim();
  const minDiscNum = Number(minDiscount) || 10;

  // Build target scraping URLs based on selected niche & general offer pages
  const CATEGORY_SOURCES = {
    jardinagem: [
      'https://www.mercadolivre.com.br/c/casa-moveis-e-decoracao',
      'https://www.mercadolivre.com.br/c/agro',
      'https://www.mercadolivre.com.br/ofertas?category=MLB1574'
    ],
    casa: [
      'https://www.mercadolivre.com.br/c/casa-moveis-e-decoracao',
      'https://www.mercadolivre.com.br/ofertas?category=MLB1574'
    ],
    eletronicos: [
      'https://www.mercadolivre.com.br/c/eletronicos-audio-e-video',
      'https://www.mercadolivre.com.br/c/celulares-e-telefones',
      'https://www.mercadolivre.com.br/ofertas?category=MLB1051'
    ],
    eletro: [
      'https://www.mercadolivre.com.br/c/eletrodomesticos',
      'https://www.mercadolivre.com.br/ofertas?category=MLB5726'
    ],
    beleza: [
      'https://www.mercadolivre.com.br/c/beleza-e-cuidado-pessoal',
      'https://www.mercadolivre.com.br/ofertas?category=MLB1246'
    ],
    moda: [
      'https://www.mercadolivre.com.br/c/calcados-roupas-e-bolsas',
      'https://www.mercadolivre.com.br/ofertas?category=MLB1430'
    ]
  };

  const urlsToScrape = [
    'https://www.mercadolivre.com.br/ofertas?page=1',
    'https://www.mercadolivre.com.br/ofertas?page=2',
    'https://www.mercadolivre.com.br/ofertas?page=3',
    'https://www.mercadolivre.com.br/ofertas?page=4',
    'https://www.mercadolivre.com.br/ofertas?page=5'
  ];

  if (niche && CATEGORY_SOURCES[niche]) {
    urlsToScrape.push(...CATEGORY_SOURCES[niche]);
  } else {
    // If no specific niche, scrape across all major category pages
    Object.values(CATEGORY_SOURCES).forEach(arr => urlsToScrape.push(...arr));
  }

  // Deduplicate target URLs
  const uniqueUrls = Array.from(new Set(urlsToScrape));

  try {
    const deals = [];

    const scrapePromises = uniqueUrls.slice(0, 5).map(async (url, pageIdx) => {
      try {
        const response = await axios.get(url, { headers: getAxiosHeaders(), timeout: 5000 });
        const $ = cheerio.load(response.data);
        const pageDeals = [];

        $('.poly-card, .ui-search-result__wrapper, .ui-search-layout__item, [class*="card"]').each((i, element) => {
          const el = $(element);
          let title = el.find('.poly-component__title, .ui-search-item__title, a[class*="title"]').first().text().trim();
          if (!title) title = el.find('a').first().text().trim();

          const cleanTitle = title
            .replace(/\s*[\-\|]\s*(Amazon|Mercado Livre|Shopee|Magazine Luiza|Magalu|AliExpress|Shein|MercadoLibre).*$/gi, '')
            .replace(/\s*[\(\[\{][^\)\}\]]*[\)\}\]]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          let link = el.find('a.poly-component__title, a.ui-search-link, a').first().attr('href') || '';
          if (link.startsWith('//')) link = 'https:' + link;

          let image = el.find('img.poly-component__picture, img.ui-search-result-image__element, img').first().attr('data-src') ||
                      el.find('img.poly-component__picture, img.ui-search-result-image__element, img').first().attr('src') || '';
          if (image.startsWith('//')) image = 'https:' + image;

          let price = 0;
          let originalPrice = 0;

          // 1. Original strike price ("De")
          const origPriceEl = el.find('s .andes-money-amount, .andes-money-amount--previous, .poly-price__original .andes-money-amount, .ui-search-price__part--original .andes-money-amount').first();
          if (origPriceEl.length) {
            const text = origPriceEl.text().trim();
            const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
            if (m) originalPrice = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
          }

          // 2. Active promotional price ("Por")
          const currentPriceEl = el.find('.poly-price__current .andes-money-amount, .ui-search-price__second-line .andes-money-amount, .ui-search-price__part--medium .andes-money-amount, .andes-money-amount:not(s .andes-money-amount):not(.andes-money-amount--previous):not(.poly-price__original .andes-money-amount)').first();
          if (currentPriceEl.length) {
            const text = currentPriceEl.text().trim();
            const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
            if (m) price = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
          }

          // Safety Swap: If price was parsed higher than originalPrice, swap them so price is ALWAYS the lower promotional price!
          if (originalPrice > 0 && price > originalPrice) {
            const temp = price;
            price = originalPrice;
            originalPrice = temp;
          }

          let discountPerc = 0;
          const discountTag = el.find('.poly-discount-tag, [class*="discount"]').first().text().trim();
          if (discountTag) {
            const matchDisc = discountTag.match(/(\d+)%/);
            if (matchDisc) discountPerc = parseInt(matchDisc[1], 10);
          }

          if (!discountPerc && originalPrice > price && price > 0) {
            discountPerc = Math.round(((originalPrice - price) / originalPrice) * 100);
          }

          if (cleanTitle && price > 0 && link && link.includes('mercadolivre.com.br') && !link.includes('/c/')) {
            pageDeals.push({
              id: `ml_${pageIdx}_${i}_${Math.random().toString(36).substr(2, 5)}`,
              title: cleanTitle.length > 70 ? cleanTitle.substring(0, 70) + '...' : cleanTitle,
              price: price.toFixed(2),
              originalPrice: originalPrice > price ? originalPrice.toFixed(2) : '',
              discountPerc,
              url: link,
              imageUrl: image,
              store: { name: 'Mercado Livre', code: 'mercadolivre', icon: '🛒' },
              slogan: '🔥 Oferta imperdível do dia no Mercado Livre!'
            });
          }
        });
        return pageDeals;
      } catch (e) {
        return [];
      }
    });

    const resultsArray = await Promise.all(scrapePromises);
    
    // Deduplicate by URL
    const seenUrls = new Set();
    for (const pageDeals of resultsArray) {
      for (const d of pageDeals) {
        const cleanUrl = d.url.split('#')[0].split('?')[0];
        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          deals.push(d);
        }
      }
    }

    let combined = [...deals];

    // Smart Keyword Filtering (Supports comma-separated OR clauses, single-clause AND tokens, strict word boundaries)
    if (rawQuery && rawQuery !== 'ofertas' && rawQuery !== 'todos' && niche !== 'todos') {
      const stopwords = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'em', 'um', 'uma', 'a', 'o', 'as', 'os', 'no', 'na', 'nos', 'nas', 'por', 'sobre', 'coisas', 'desse', 'universo']);
      
      const rawClauses = rawQuery.includes(',') ? rawQuery.split(',') : [rawQuery];
      
      const clauseMatchers = rawClauses.map(clause => {
        return clause
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .split(/\s+/)
          .filter(w => w.length > 1 && !stopwords.has(w));
      }).filter(words => words.length > 0);

      if (clauseMatchers.length > 0) {
        combined = combined.filter(d => {
          const normTitle = d.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return clauseMatchers.some(words => {
            return words.every(w => {
              const rx = new RegExp(`\\b${w}`, 'i');
              return rx.test(normTitle);
            });
          });
        });
      }
    }

    // Filter by minDiscount (If minDiscount is 0 or less, include all active deals)
    let filteredByDiscount = combined;
    if (minDiscNum > 0) {
      filteredByDiscount = combined.filter(d => Number(d.discountPerc) >= minDiscNum);
    }

    // Fallback: If filtered list is empty, return combined or all scraped deals so the feed is never empty!
    if (filteredByDiscount.length === 0) {
      filteredByDiscount = combined.length > 0 ? combined : deals;
    }

    filteredByDiscount.sort((a, b) => b.discountPerc - a.discountPerc);

    return res.json({
      success: true,
      count: filteredByDiscount.length,
      deals: filteredByDiscount
    });
  } catch (error) {
    console.error('Erro na busca de ofertas:', error.message);
    return res.status(500).json({ error: 'Erro ao rastrear ofertas.', details: error.message });
  }
});

// Serve frontend build in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor do Gerador de Promoções rodando na porta ${PORT}`);
  });
}

export default app;
