import axios from 'axios';

async function testCategory(niche, query) {
  try {
    const resp = await axios.post('http://localhost:3001/api/deals/search', {
      niche,
      query,
      store: 'mercadolivre',
      minDiscount: 10
    });
    console.log(`\n=== Live Test NICHE [${niche || 'query: ' + query}] ===`);
    console.log('COUNT:', resp.data.count);
    if (resp.data.deals && resp.data.deals.length > 0) {
      console.log('Sample 1:', resp.data.deals[0].title);
      console.log('Sample 2:', resp.data.deals[1]?.title);
      console.log('Sample 3:', resp.data.deals[2]?.title);
    }
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

async function run() {
  await testCategory('jardinagem', 'plantas, mudas, orquideas, cactos, suculentas, vasos, jardinagem, ferramentas, adubos, suportes, jardim, espelho, mesa, cadeira, regador, tesoura, sementes, churrasqueira, panela, torneira, mangueira, organizador, ducha, chuveiro, colchao, decoracao, armario, luminaria, suporte, estante, cabeceira, jogo');
  await testCategory('casa', 'casa, decoracao, espelho, moveis, mesa, cadeira, lustre, quadro, organizador, cama, banho, tapete, sofa, cortina, armario, colchao');
}

run();
