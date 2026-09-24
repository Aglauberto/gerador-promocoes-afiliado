import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function scrapePureMercadoLivreDeals() {
  const deals = [];
  const pages = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const page of pages) {
    const url = `https://www.mercadolivre.com.br/ofertas?page=${page}`;
    try {
      const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 10000 });
      const $ = cheerio.load(res.data);

      $('.poly-card').each((i, el) => {
        let title = $(el).find('.poly-component__title, a[class*="title"]').first().text().trim();
        if (!title) title = $(el).find('a').first().text().trim();

        const cleanTitle = title
          .replace(/\s*[\-\|]\s*(Amazon|Mercado Livre|Shopee|Magazine Luiza|Magalu|AliExpress|Shein|MercadoLibre).*$/gi, '')
          .replace(/\s*[\(\[\{][^\)\}\]]*[\)\}\]]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        let link = $(el).find('a.poly-component__title, a').first().attr('href') || '';
        if (link.startsWith('//')) link = 'https:' + link;

        let image = $(el).find('img.poly-component__picture, img').first().attr('data-src') ||
                    $(el).find('img.poly-component__picture, img').first().attr('src') || '';
        if (image.startsWith('//')) image = 'https:' + image;

        let price = 0;
        let originalPrice = 0;

        const currentPriceEl = $(el).find('.poly-price__current .andes-money-amount').first();
        if (currentPriceEl.length) {
          const text = currentPriceEl.text().trim();
          const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
          if (m) price = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
        }

        const origPriceEl = $(el).find('s .andes-money-amount, .andes-money-amount--previous').first();
        if (origPriceEl.length) {
          const text = origPriceEl.text().trim();
          const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
          if (m) originalPrice = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
        }

        let discountPerc = 0;
        const discountTag = $(el).find('.poly-discount-tag, [class*="discount"]').first().text().trim();
        if (discountTag) {
          const matchDisc = discountTag.match(/(\d+)%/);
          if (matchDisc) discountPerc = parseInt(matchDisc[1], 10);
        }

        if (!discountPerc && originalPrice > price && price > 0) {
          discountPerc = Math.round(((originalPrice - price) / originalPrice) * 100);
        }

        if (cleanTitle && price > 0 && link && link.includes('mercadolivre.com.br')) {
          deals.push({
            id: `ml_${page}_${i}_${Math.random().toString(36).substr(2, 5)}`,
            title: cleanTitle.length > 70 ? cleanTitle.substring(0, 70) + '...' : cleanTitle,
            price: price.toFixed(2),
            originalPrice: originalPrice > price ? originalPrice.toFixed(2) : '',
            discountPerc,
            url: link,
            imageUrl: image,
            store: { name: 'Mercado Livre', code: 'mercadolivre', icon: '🛒' },
            slogan: '🔥 Oferta imperdível do dia com super desconto!'
          });
        }
      });
    } catch (e) {
      console.log(`Page ${page} error: ${e.message}`);
    }
  }

  console.log(`Extraídas ${deals.length} ofertas 100% REAIS do Mercado Livre!`);
  console.log('Primeiras 3 Ofertas:');
  console.log(JSON.stringify(deals.slice(0, 3), null, 2));

  // Check if any deals match plant/home/tools/etc.
  const plantRegexes = [
    /\bplantas?\b/i, /\bmudas?\b/i, /\borqu[íi]deas?\b/i, /\bcactos?\b/i, /\bsuculentas?\b/i,
    /\bvasos?\b/i, /\bjardinagem\b/i, /\bferramentas?\b/i, /\badubos?\b/i, /\bsuportes?\b/i,
    /\bjardim\b/i, /\bpanela\b/i, /\bfritadeira\b/i, /\bespelho\b/i, /\bchurrasqueira\b/i,
    /\bpressao\b/i, /\bkit\b/i, /\blustre\b/i, /\bmesa\b/i, /\bcadeira\b/i
  ];

  const matched = deals.filter(d => plantRegexes.some(rx => rx.test(d.title)));
  console.log(`Encontradas ${matched.length} ofertas do universo Casa, Jardim & Ferramentas!`);
}

scrapePureMercadoLivreDeals();
