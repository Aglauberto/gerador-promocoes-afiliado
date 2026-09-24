import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function testMatcher() {
  const deals = [];
  for (let page = 1; page <= 8; page++) {
    try {
      const res = await axios.get(`https://www.mercadolivre.com.br/ofertas?page=${page}`, { headers: AXIOS_HEADERS, timeout: 8000 });
      const $ = cheerio.load(res.data);
      $('.poly-card').each((i, el) => {
        let title = $(el).find('.poly-component__title, a[class*="title"]').first().text().trim();
        if (!title) title = $(el).find('a').first().text().trim();
        let link = $(el).find('a.poly-component__title, a').first().attr('href') || '';
        let image = $(el).find('img.poly-component__picture, img').first().attr('data-src') || $(el).find('img.poly-component__picture, img').first().attr('src') || '';
        if (title && link) {
          deals.push({ title, url: link, imageUrl: image });
        }
      });
    } catch (e) {}
  }

  console.log(`Total scraped deals: ${deals.length}`);

  function filterDeals(rawQuery, pool) {
    if (!rawQuery || rawQuery === 'ofertas' || rawQuery === 'todos') return pool;
    const stopwords = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'em', 'um', 'uma', 'a', 'o', 'as', 'os', 'no', 'na', 'nos', 'nas', 'por', 'sobre', 'coisas', 'desse', 'universo']);
    
    const rawClauses = rawQuery.includes(',') ? rawQuery.split(',') : [rawQuery];
    
    const clauseMatchers = rawClauses.map(clause => {
      return clause
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 1 && !stopwords.has(w));
    }).filter(words => words.length > 0);

    if (clauseMatchers.length === 0) return pool;

    return pool.filter(d => {
      const normTitle = d.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return clauseMatchers.some(words => {
        return words.every(w => {
          const rx = new RegExp(`\\b${w}`, 'i');
          return rx.test(normTitle);
        });
      });
    });
  }

  const nicheQuery = "plantas, decoração externa, mudas, orquideas, cactos, vasos, ferramentas, adubos, suportes, jardim, churrasqueira, panela, espelho, cadeira, mesa, kit";
  const matchedNiche = filterDeals(nicheQuery, deals);
  console.log(`\nQuery Niche match count: ${matchedNiche.length}`);
  matchedNiche.slice(0, 5).forEach((d, i) => console.log(`  [${i+1}] ${d.title}`));

  const singleQuery = "panela";
  const matchedSingle = filterDeals(singleQuery, deals);
  console.log(`\nQuery "panela" match count: ${matchedSingle.length}`);
  matchedSingle.slice(0, 3).forEach((d, i) => console.log(`  [${i+1}] ${d.title}`));
}

testMatcher();
