import axios from 'axios';

// Test intelligent search filtering without stopwords
const testDeals = [
  { title: 'Whey Protein Concentrado 100% 900g Refil Dark Lab Sabor Baunilha', discountPerc: 73 },
  { title: 'Muda De Rosa Do Deserto Enxertada Flor Dobrada Vermelha', discountPerc: 30 },
  { title: 'Sementes De Rosa Do Deserto Polinizada 10 Unidades', discountPerc: 25 },
  { title: 'Vaso Cuia Plastico Para Rosa Do Deserto E Suculentas', discountPerc: 40 },
  { title: 'Kit 5 Peças All Black Dry 3 Camisetas E 2 Bermudas Alpha', discountPerc: 47 }
];

const stopwords = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'em', 'um', 'uma', 'a', 'o', 'as', 'os']);

function smartSearch(query, deals) {
  const cleanWords = query
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Strip accents
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopwords.has(w));

  console.log(`Query: "${query}" -> Clean keywords:`, cleanWords);

  if (cleanWords.length === 0) return [];

  // Match items that contain ALL clean keywords (highest precision)
  let matches = deals.filter(d => {
    const normTitle = d.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cleanWords.every(w => normTitle.includes(w));
  });

  // If no items match ALL words, match ANY of the clean keywords
  if (matches.length === 0) {
    matches = deals.filter(d => {
      const normTitle = d.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return cleanWords.some(w => normTitle.includes(w));
    });
  }

  return matches;
}

console.log('--- TEST 1: "rosa do deserto" ---');
const r1 = smartSearch('rosa do deserto', testDeals);
console.log('Results count:', r1.length);
console.log('Titles:', r1.map(x => x.title));

console.log('\n--- TEST 2: "orquídea" ---');
const r2 = smartSearch('orquídea', testDeals);
console.log('Results count:', r2.length);
console.log('Titles:', r2.map(x => x.title));
