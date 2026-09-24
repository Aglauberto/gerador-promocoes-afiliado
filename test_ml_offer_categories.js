import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

const TEST_URLS = [
  'https://www.mercadolivre.com.br/ofertas?category=MLB1574', // Casa, Moveis e Decoracao
  'https://www.mercadolivre.com.br/ofertas?category=MLB5726', // Eletrodomesticos
  'https://www.mercadolivre.com.br/ofertas?category=MLB1051', // Celulares
  'https://www.mercadolivre.com.br/ofertas?category=MLB1430', // Calcados, Roupas
  'https://www.mercadolivre.com.br/c/casa-moveis-e-decoracao',
  'https://www.mercadolivre.com.br/c/ferramentas',
  'https://www.mercadolivre.com.br/c/eletrodomesticos',
  'https://www.mercadolivre.com.br/c/celulares-e-telefones',
  'https://www.mercadolivre.com.br/c/calcados-roupas-e-bolsas',
  'https://www.mercadolivre.com.br/c/beleza-e-cuidado-pessoal'
];

async function run() {
  for (const url of TEST_URLS) {
    try {
      const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 8000 });
      const $ = cheerio.load(res.data);
      const items = [];

      $('.poly-card, .ui-search-result__wrapper, .ui-search-layout__item, [class*="card"]').each((i, el) => {
        let title = $(el).find('.poly-component__title, .ui-search-item__title, a[class*="title"]').first().text().trim();
        if (!title) title = $(el).find('a').first().text().trim();

        let link = $(el).find('a.poly-component__title, a.ui-search-link, a').first().attr('href') || '';
        if (link.startsWith('//')) link = 'https:' + link;

        let image = $(el).find('img.poly-component__picture, img.ui-search-result-image__element, img').first().attr('data-src') ||
                    $(el).find('img.poly-component__picture, img.ui-search-result-image__element, img').first().attr('src') || '';
        if (image.startsWith('//')) image = 'https:' + image;

        let price = 0;
        let originalPrice = 0;

        const currentPriceEl = $(el).find('.poly-price__current .andes-money-amount, .ui-search-price__part--medium .andes-money-amount, .andes-money-amount').first();
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

        if (title && price > 0 && link && link.includes('mercadolivre.com.br') && !link.includes('/c/')) {
          items.push({ title, price, originalPrice, discountPerc, link, image });
        }
      });

      console.log(`URL [${url}]: Found ${items.length} items. Sample 1: "${items[0]?.title}" (${items[0]?.discountPerc}% OFF)`);
    } catch (e) {
      console.log(`URL [${url}]: Error ${e.message}`);
    }
  }
}

run();
