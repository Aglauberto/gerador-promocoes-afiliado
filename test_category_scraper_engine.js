import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function scrapeSources(urls) {
  const deals = [];
  const promises = urls.map(async (url) => {
    try {
      const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 8000 });
      const $ = cheerio.load(res.data);
      const pageDeals = [];

      $('.poly-card, .ui-search-result__wrapper, .ui-search-layout__item, [class*="card"]').each((i, el) => {
        let title = $(el).find('.poly-component__title, .ui-search-item__title, a[class*="title"]').first().text().trim();
        if (!title) title = $(el).find('a').first().text().trim();

        const cleanTitle = title
          .replace(/\s*[\-\|]\s*(Amazon|Mercado Livre|Shopee|Magazine Luiza|Magalu|AliExpress|Shein|MercadoLibre).*$/gi, '')
          .replace(/\s*[\(\[\{][^\)\}\]]*[\)\}\]]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

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

        if (cleanTitle && price > 0 && link && link.includes('mercadolivre.com.br') && !link.includes('/c/')) {
          pageDeals.push({
            title: cleanTitle.length > 70 ? cleanTitle.substring(0, 70) + '...' : cleanTitle,
            price: price.toFixed(2),
            originalPrice: originalPrice > price ? originalPrice.toFixed(2) : '',
            discountPerc,
            url: link,
            imageUrl: image,
            store: { name: 'Mercado Livre', code: 'mercadolivre', icon: '🛒' }
          });
        }
      });
      return pageDeals;
    } catch (e) {
      return [];
    }
  });

  const results = await Promise.all(promises);
  for (const arr of results) {
    deals.push(...arr);
  }
  return deals;
}

async function testCategoryFilter(catName, urls, query) {
  console.log(`\n=== Testing Category: [${catName}] ===`);
  const deals = await scrapeSources(urls);
  console.log(`Total Scraped for [${catName}]: ${deals.length}`);

  let filtered = [...deals];
  if (query && query !== 'ofertas') {
    const stopwords = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'em', 'um', 'uma', 'a', 'o', 'as', 'os', 'no', 'na', 'nos', 'nas', 'por', 'sobre', 'coisas', 'desse', 'universo']);
    const rawClauses = query.includes(',') ? query.split(',') : [query];
    const clauseMatchers = rawClauses.map(clause => {
      return clause.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(w => w.length > 1 && !stopwords.has(w));
    }).filter(words => words.length > 0);

    if (clauseMatchers.length > 0) {
      filtered = filtered.filter(d => {
        const normTitle = d.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return clauseMatchers.some(words => {
          return words.every(w => new RegExp(`\\b${w}`, 'i').test(normTitle));
        });
      });
    }
  }

  console.log(`Filtered deals count for "${query}": ${filtered.length}`);
  if (filtered.length > 0) {
    console.log('Sample 1:', filtered[0].title);
    console.log('Sample 2:', filtered[1]?.title);
  }
}

async function run() {
  await testCategoryFilter('Moda & Calçados', [
    'https://www.mercadolivre.com.br/ofertas?category=MLB1430',
    'https://www.mercadolivre.com.br/c/calcados-roupas-e-bolsas'
  ], 'tenis, sandalia, mochila, camiseta, vestido, calca, casaco, bolsa, relogio, sapato, cueca, meias');

  await testCategoryFilter('Eletrodomésticos', [
    'https://www.mercadolivre.com.br/ofertas?category=MLB5726',
    'https://www.mercadolivre.com.br/c/eletrodomesticos'
  ], 'geladeira, airfryer, cafeteira, panela, aspirador, ventilador, batedeira, liquidificador, microondas, fogao, lavadora');

  await testCategoryFilter('Plantas & Jardinagem', [
    'https://www.mercadolivre.com.br/c/casa-moveis-e-decoracao',
    'https://www.mercadolivre.com.br/c/agro',
    'https://www.mercadolivre.com.br/ofertas?category=MLB1574'
  ], 'plantas, mudas, orquideas, cactos, suculentas, vasos, jardinagem, ferramentas, adubos, suportes, jardim, espelho, mesa, cadeira, regador, tesoura, sementes');
}

run();
