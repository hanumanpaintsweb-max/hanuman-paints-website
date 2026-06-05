const fetch = require('node-fetch');
async function test() {
  const url = 'https://api.firecrawl.dev/v2/scrape';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer fc-76dfad7a06a2482ca63d4ddd401a7b7a',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://www.dulux.in/en/colour-palettes',
      formats: ['markdown']
    })
  });
  const data = await res.json();
  console.log(data);
}
test();
