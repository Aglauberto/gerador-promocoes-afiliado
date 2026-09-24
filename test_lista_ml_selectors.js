import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function testLista(query) {
  const url = `https://lista.mercadolivre.com.br/${encodeURIComponent(query)}`;
  console.log(`\n=== Testing lista.mercadolivre.com.br for "${query}" (${url}) ===`);
  try {
    const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 8000 });
    const $ = cheerio.load(res.data);

    const items = [];
    $('.ui-search-result, .ui-search-layout__item, .poly-card, [class*="ui-search-result"]').each((i, el) => {
      const title = $(el).find('.ui-search-item__title, .poly-component__title, h2, a[title]').first().text().trim();
      const link = $(el).find('a.ui-search-link, a.poly-component__title, a').first().attr('href');
      const img = $(el).find('img.ui-search-result-image__element, img.poly-component__picture, img').first().attr('data-src') ||
                  $(el).find('img.ui-search-result-image__element, img.poly-component__picture, img').first().attr('src');
      
      const priceText = $(el).find('.ui-search-price__part--medium .andes-money-amount__fraction, .poly-price__current .andes-money-amount__fraction, .andes-money-amount__fraction').first().text().trim();

      if (title && link) {
        items.push({ title, link, img, price: priceText });
      }
    });

    console.log(`Items found: ${items.length}`);
    if (items.length > 0) {
      console.log('Sample 1:', items[0]);
      console.log('Sample 2:', items[1]);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

async function run() {
  await testLista('plantas');
  await testLista('geladeira');
  await testLista('rosa do deserto');
}

run();
