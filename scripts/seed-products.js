require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require("@supabase/supabase-js");

// We can just require the ES module using dynamic import, but products.js uses ES module export.
// Let's read and parse it manually or just define the client.

// Oh, wait, Next.js uses .env. So we just need to pass the URL and key manually or from process.env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cbkduvrkyzpzvdpgzrdq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: existing, error: fetchErr } = await supabase.from("products").select("id");
  if (fetchErr) {
    process.exit(1);
  }

  if (existing.length > 0) {
    const ids = existing.map(e => e.id);
    const { error: deleteErr } = await supabase.from("products").delete().in("id", ids);
    if (deleteErr) {
      process.exit(1);
    }
  }

  // We need the data from products.js
  // Since products.js is an ES module (export const PRODUCTS), we can just import it.
  const fs = require("fs");
  const path = require("path");
  const productsCode = fs.readFileSync(path.join(__dirname, "../src/data/products.js"), "utf-8");
  
  // Extract the array using simple eval (it's safe here)
  const codeToEval = productsCode.replace("export const PRODUCTS = productsList;", "module.exports = productsList;");
  const tmpPath = path.join(__dirname, "tmp-products.js");
  fs.writeFileSync(tmpPath, codeToEval);
  
  const productsList = require("./tmp-products.js");
  
  
  const { error: insertErr } = await supabase.from("products").insert(productsList);
  
  fs.unlinkSync(tmpPath);
  
  if (insertErr) {
    process.exit(1);
  }
  
}

run();
