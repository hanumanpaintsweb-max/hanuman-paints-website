const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('scripts/dulux-all-products.json', 'utf8'));

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    }).on('timeout', () => {
      resolve(false);
    }).end();
  });
}

async function run() {
  const valid = [];
  const invalid = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const isValid = await checkUrl(item.imageUrl);
    if (isValid) {
      valid.push(item);
    } else {
      invalid.push(item);
    }
  }

  fs.writeFileSync('scripts/valid-images.json', JSON.stringify(valid, null, 2));
  fs.writeFileSync('scripts/no-images.json', JSON.stringify(invalid, null, 2));


  // Generate SQL
  if (invalid.length > 0) {
    const slugs = invalid.map(item => "'" + item.slug + "'").join(', ');
    const sql = `DELETE FROM products WHERE id IN (${slugs});`;
    fs.writeFileSync('delete_invalid_products.sql', sql);
  } else {
  }

  // Update products.js
  const POPULAR_SLUGS = [
    'velvet-touch-diamond-glo',
    'dulux-promise-sheen-interior',
    'dulux-promise-sheen-exterior',
    'dulux-weathershield-powerflexx-15yr',
    'dulux-aquatech-damp-protect-plus',
    'dulux-aquatech-damp-protect-2in1',
    'dulux-floor-plus'
  ];

  const mapped = valid.map(item => {
    const isPopular = POPULAR_SLUGS.some(ps => item.slug.includes(ps)) || 
                      item.name.toLowerCase().includes('velvet touch diamond glo') ||
                      item.name.toLowerCase().includes('promise sheen') ||
                      item.name.toLowerCase().includes('weathershield powerflexx') ||
                      item.name.toLowerCase().includes('aquatech') ||
                      item.name.toLowerCase().includes('floor plus');
                      
    let categoryId = item.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (categoryId === 'waterproof') categoryId = 'waterproofing';

    return {
      id: item.slug,
      name: item.name,
      category: item.category,
      categoryId: categoryId,
      image: item.imageUrl,
      description: item.description,
      features: item.features,
      coverage: item.coverage,
      popular: isPopular,
      sizes: [
        { size: '1L', mrp: 0, discountedPrice: 0 }
      ]
    };
  });

  const fileContent = 'export const PRODUCTS = ' + JSON.stringify(mapped, null, 2) + ';\n';
  fs.writeFileSync('src/data/products.js', fileContent);
}

run();
