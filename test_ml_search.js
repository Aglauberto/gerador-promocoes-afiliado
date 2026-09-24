import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9'
};

async function testSearch(query) {
  const url = `https://lista.mercadolivre.com.br/${encodeURIComponent(query)}`;
  console.log(`\n--- Fetching search results for: ${query} (${url}) ---`);
  try {
    const resp = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 10000 });
    const $ = cheerio.load(resp.data);
    const items = [];

    $('.poly-card, .ui-search-result__wrapper, .ui-search-layout__item').each((i, element) => {
      const el = $(element);
      let title = el.find('.poly-component__title, .ui-search-item__title').first().text().trim();
      if (!title) title = el.find('a').first().text().trim();

      let link = el.find('a.poly-component__title, a.ui-search-link, a.ui-search-item__group__element').first().attr('href') || '';
      if (link.startsWith('//')) link = 'https:' + link;

      let image = el.find('img.poly-component__picture, img.ui-search-result-image__element').first().attr('data-src') ||
                  el.find('img.poly-component__picture, img.ui-search-result-image__element').first().attr('src') || '';
      if (image.startsWith('//')) image = 'https:' + image;

      let price = 0;
      let originalPrice = 0;

      const currentPriceEl = el.find('.poly-price__current .andes-money-amount, .ui-search-price__part--medium .andes-money-amount').first();
      if (currentPriceEl.length) {
        const text = currentPriceEl.text().trim();
        const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
        if (m) price = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      }

      const origPriceEl = el.find('s .andes-money-amount, .andes-money-amount--previous').first();
      if (origPriceEl.length) {
        const text = origPriceEl.text().trim();
        const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
        if (m) originalPrice = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      }

      if (title && link && link.includes('mercadolivre.com.br')) {
        items.push({
          title,
          link: link.split('#')[0],
          image,
          price,
          originalPrice
        });
      }
    });

    console.log(`Found ${items.length} real products on Mercado Livre for "${query}":`);
    items.slice(0, 3).forEach((item, idx) => {
      console.log(`  [${idx + 1}] ${item.title}`);
      console.log(`      Link: ${item.link}`);
      console.log(`      Img:  ${item.image}`);
      console.log(`      Price: R$ ${item.price} (Was: R$ ${item.originalPrice})`);
    });
  } catch (err) {
    console.error('Search failed:', err.message);
  }
}

async function run() {
  await testSearch('geladeira');
  await testSearch('rosa-do-deserto');
}

run();
