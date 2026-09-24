import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

const CATEGORIES = [
  { name: 'Casa, Móveis e Decoração (Jardinagem)', url: 'https://www.mercadolivre.com.br/c/casa-moveis-e-decoracao' },
  { name: 'Ferramentas', url: 'https://www.mercadolivre.com.br/c/ferramentas' },
  { name: 'Construção', url: 'https://www.mercadolivre.com.br/c/construcao' },
  { name: 'Eletrodomésticos', url: 'https://www.mercadolivre.com.br/c/eletrodomesticos' },
  { name: 'Eletrônicos, Áudio e Vídeo', url: 'https://www.mercadolivre.com.br/c/eletronicos-audio-e-video' },
  { name: 'Celulares e Telefones', url: 'https://www.mercadolivre.com.br/c/celulares-e-telefones' },
  { name: 'Beleza e Cuidado Pessoal', url: 'https://www.mercadolivre.com.br/c/beleza-e-cuidado-pessoal' },
  { name: 'Calçados, Roupas e Bolsas', url: 'https://www.mercadolivre.com.br/c/calcados-roupas-e-bolsas' },
  { name: 'Esportes e Fitness', url: 'https://www.mercadolivre.com.br/c/esportes-e-fitness' },
  { name: 'Agro (Plantas & Sementes)', url: 'https://www.mercadolivre.com.br/c/agro' },
];

async function testAll() {
  for (const cat of CATEGORIES) {
    try {
      const res = await axios.get(cat.url, { headers: AXIOS_HEADERS, timeout: 8000 });
      const $ = cheerio.load(res.data);
      const deals = [];

      $('.poly-card, .ui-search-result__wrapper, .ui-search-layout__item, [class*="card"]').each((i, el) => {
        let title = $(el).find('.poly-component__title, .ui-search-item__title, a[class*="title"]').first().text().trim();
        if (!title) title = $(el).find('a').first().text().trim();

        let link = $(el).find('a.poly-component__title, a.ui-search-link, a').first().attr('href') || '';
        if (link.startsWith('//')) link = 'https:' + link;

        let image = $(el).find('img.poly-component__picture, img.ui-search-result-image__element, img').first().attr('data-src') ||
                    $(el).find('img.poly-component__picture, img.ui-search-result-image__element, img').first().attr('src') || '';
        if (image.startsWith('//')) image = 'https:' + image;

        let price = 0;
        const currentPriceEl = $(el).find('.poly-price__current .andes-money-amount, .ui-search-price__part--medium .andes-money-amount, .andes-money-amount').first();
        if (currentPriceEl.length) {
          const text = currentPriceEl.text().trim();
          const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
          if (m) price = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
        }

        if (title && price > 0 && link && link.includes('mercadolivre.com.br') && !link.includes('/c/')) {
          deals.push({ title, price, link, image });
        }
      });

      console.log(`[${cat.name}]: Found ${deals.length} real product deals! Sample: ${deals[0]?.title || 'none'}`);
    } catch (e) {
      console.log(`[${cat.name}]: Error ${e.message}`);
    }
  }
}

testAll();
