const fs = require('fs');

async function scrapeDuluxColors() {
  console.log("Starting Firecrawl extraction...");
  const url = 'https://api.firecrawl.dev/v1/scrape';
  
  const payload = {
    url: 'https://www.dulux.in/en/colours',
    formats: ['extract'],
    extract: {
      prompt: "Extract exactly 15 real Dulux paint colors for EACH of these 8 color families: Reds, Oranges/Browns, Yellows, Greens/Olives, Greens/Teals, Teals/Blues, Blues, Purples/Mauves. Ensure the 15 colors go from dark to light. Provide real Dulux names, color codes (e.g. '00YY 00/000'), and exact hex codes. I need a total of 120 colors.",
      schema: {
        type: 'object',
        properties: {
          families: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                family: { type: 'string', enum: ['Reds', 'Oranges/Browns', 'Yellows', 'Greens/Olives', 'Greens/Teals', 'Teals/Blues', 'Blues', 'Purples/Mauves'] },
                colors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      code: { type: 'string' },
                      hex: { type: 'string' }
                    },
                    required: ['name', 'code', 'hex']
                  }
                }
              },
              required: ['family', 'colors']
            }
          }
        },
        required: ['families']
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer fc-76dfad7a06a2482ca63d4ddd401a7b7a',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("HTTP Error", res.status, await res.text());
      return;
    }

    const data = await res.json();
    if (data.success && data.data && data.data.extract) {
      const extracted = data.data.extract;
      let total = 0;
      extracted.families?.forEach(f => total += (f.colors?.length || 0));
      console.log(`Successfully extracted ${total} colors across ${extracted.families?.length || 0} families.`);
      
      fs.writeFileSync('./src/data/dulux-colors.json', JSON.stringify(extracted.families, null, 2));
      console.log("Saved to src/data/dulux-colors.json");
    } else {
      console.error("Extraction failed or returned unexpected format:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Request failed", err);
  }
}

scrapeDuluxColors();
