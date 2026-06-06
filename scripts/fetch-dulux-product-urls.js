const fetch = require('node-fetch');
const fs = require('fs');

async function getProductUrls() {
  const urlsToScrape = [
    "https://www.dulux.in/en/products/filters/t_Enamel/b_Dulux",
    "https://www.dulux.in/en/products/filters/t_Primer/b_Dulux",
    "https://www.dulux.in/en/products/filters/s_Floor",
    "https://www.dulux.in/en/products/filters/t_Putty",
    "https://www.dulux.in/en/products/filters/t_Varnish",
    "https://www.dulux.in/en/products/filters/s_Metal",
    "https://www.dulux.in/en/products/filters/t_Waterproofing",
    "https://www.dulux.in/en/products/filters/t_Tinter",
    "https://www.dulux.in/en/products/filters/s_Texture"
  ];

  let existingSlugs = [];
  try {
    const data = fs.readFileSync('scripts/dulux-product-urls.json', 'utf8');
    existingSlugs = JSON.parse(data);
  } catch (err) {
    console.warn("Could not read existing file, starting fresh.");
  }
  
  const productSlugs = new Set(existingSlugs);
  console.log(`Starting with ${productSlugs.size} existing unique slugs.`);
  
  for (const targetUrl of urlsToScrape) {
    console.log(`Scraping ${targetUrl}...`);
    try {
      const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer fc-76dfad7a06a2482ca63d4ddd401a7b7a',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ['links']
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        console.error("Failed to scrape:", targetUrl, data);
        continue;
      }
      
      const links = data.data.links || [];
      
      for (const link of links) {
        if (link.includes('/en/products/') && !link.endsWith('/en/products') && !link.endsWith('/en/products/')) {
          const parts = link.split('/en/products/');
          if (parts.length > 1) {
            let slug = parts[1].split('?')[0].split('#')[0]; // clean up query params or hash
            if (slug && !slug.startsWith('filters/')) {
              productSlugs.add(slug);
            }
          }
        }
      }
      
      console.log(`Current unique count: ${productSlugs.size}`);
    } catch (e) {
      console.error(`Error scraping ${targetUrl}:`, e);
    }
    
    // Add a small delay between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const uniqueSlugs = Array.from(productSlugs).sort();
  fs.writeFileSync('scripts/dulux-product-urls.json', JSON.stringify(uniqueSlugs, null, 2));
  
  console.log(`\nFinished! Found ${uniqueSlugs.length} unique product slugs in total.`);
}

getProductUrls();
