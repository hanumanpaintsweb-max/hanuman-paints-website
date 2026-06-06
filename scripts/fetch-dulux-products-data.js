const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCategoryFromSlug(slug) {
  if (slug.includes('interior')) return 'Interior';
  if (slug.includes('exterior')) return 'Exterior';
  if (slug.includes('enamel')) return 'Enamel';
  if (slug.includes('primer')) return 'Primer';
  if (slug.includes('waterproof')) return 'Waterproofing';
  if (slug.includes('wood')) return 'Wood';
  if (slug.includes('floor')) return 'Floor';
  if (slug.includes('putty')) return 'Putty';
  if (slug.includes('texture')) return 'Texture';
  return 'Interior'; // default
}

async function fetchProductData() {
  const slugsFile = 'scripts/dulux-product-urls.json';
  if (!fs.existsSync(slugsFile)) {
    return;
  }
  
  const slugs = JSON.parse(fs.readFileSync(slugsFile, 'utf8'));
  const results = [];
  
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
    const batchSlugs = slugs.slice(i, i + BATCH_SIZE);
    
    const promises = batchSlugs.map(async (slug) => {
      const url = `https://www.dulux.in/en/products/${slug}`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        const name = $('h1').first().text().trim() || $('.c-page-header__title').text().trim() || slug;
        const description = $('.c-article__text').first().text().trim() || $('div[data-component="ProductDescription"] .c-article__text').text().trim() || $('div.body-copy-s').filter((i, el) => $(el).text().includes('is a')).first().text().trim();
        
        let coverage = '';
        $('.item-label').each((i, el) => {
          if ($(el).text().trim() === 'Coverage') {
            coverage = $(el).parent().text().replace('Coverage', '').trim();
          }
        });
        
        let imageUrl = '';
        $('img').each((i, el) => {
          const src = $(el).attr('data-src') || $(el).attr('src');
          if (src && (src.includes('packshot') || src.includes('pack-') || src.includes('super_'))) {
            imageUrl = src;
            return false;
          }
        });
        if (!imageUrl) {
          $('img').each((i, el) => {
            const src = $(el).attr('data-src') || $(el).attr('src');
            if (src && !src.includes('logo') && !src.includes('akzo-nobel') && !src.includes('sadolin') && !src.includes('DULUX_RGB') && !src.includes('height2')) {
              imageUrl = src;
              return false;
            }
          });
        }
        
        if (imageUrl && imageUrl.includes('packshot_medium')) {
            imageUrl = imageUrl.replace('packshot_medium', 'packshot_large');
        } else if (imageUrl && imageUrl.includes('pack-small')) {
            imageUrl = imageUrl.replace('pack-small', 'pack-large');
        }
        
        const features = [];
        $('[data-icon="checkmark"]').each((i, el) => {
          const text = $(el).closest('li').find('.item-label').text().trim();
          if (text) features.push(text);
        });
        
        // Remove duplicates in features just in case
        const uniqueFeatures = [...new Set(features)];
        
        let category = getCategoryFromSlug(slug);
        
        return {
          slug,
          name,
          category,
          imageUrl,
          description,
          features: uniqueFeatures,
          coverage
        };
      } catch (err) {
        return { slug, name: slug, imageUrl: "", description: "", features: [], coverage: "", category: "Unknown" };
      }
    });
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    fs.writeFileSync('scripts/dulux-all-products.json', JSON.stringify(results, null, 2));
    
    await delay(1000); // 1s delay
  }
  
  let emptyImages = 0;
  for (const item of results) {
    if (!item.imageUrl || item.imageUrl.trim() === '') {
      emptyImages++;
    }
  }
  
}

fetchProductData();
