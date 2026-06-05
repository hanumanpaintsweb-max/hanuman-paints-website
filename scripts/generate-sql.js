const fs = require('fs');
// Mocking ES Module import by using eval
const productsCode = fs.readFileSync('./src/data/products.js', 'utf-8');
const codeToEval = productsCode.replace("export const PRODUCTS = productsList;", "module.exports = productsList;");
fs.writeFileSync(__dirname + '/tmp-products-sql.js', codeToEval);
const products = require('./tmp-products-sql.js');

let sql = 'INSERT INTO public.products (id, name, category, "categoryId", image, description, popular, features, sizes) VALUES\n';
const values = products.map(p => {
  const id = `'${p.id.replace(/'/g, "''")}'`;
  const name = `'${p.name.replace(/'/g, "''")}'`;
  const category = `'${p.category.replace(/'/g, "''")}'`;
  const catId = `'${p.categoryId.replace(/'/g, "''")}'`;
  const image = `'${p.image.replace(/'/g, "''")}'`;
  const desc = `'${p.description.replace(/'/g, "''")}'`;
  const popular = p.popular ? 'true' : 'false';
  const features = `ARRAY[${p.features.map(f => `'${f.replace(/'/g, "''")}'`).join(',')}]::text[]`;
  const sizes = `ARRAY[${p.sizes.map(s => `'${JSON.stringify(s).replace(/'/g, "''")}'::jsonb`).join(',')}]::jsonb[]`;
  return `(${id}, ${name}, ${category}, ${catId}, ${image}, ${desc}, ${popular}, ${features}, ${sizes})`;
}).join(',\n') + ';';

sql += values;
fs.writeFileSync('insert_products.sql', sql);
fs.unlinkSync(__dirname + '/tmp-products-sql.js');
console.log('SQL generated to insert_products.sql');
