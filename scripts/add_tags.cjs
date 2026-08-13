const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '../src/data/products.json');
const data = fs.readFileSync(productsFile, 'utf-8');
const products = JSON.parse(data);

products.forEach(p => {
    const cat = p.category;
    const name = p.name.toLowerCase();

    // Flavor profile
    if (['Chocolates', 'Cream Biscuits', 'Ice Cream', 'Milkshakes', 'Health Drinks'].includes(cat)) {
        p.flavor_profile = 'sweet';
    } else if (['Chips & Snacks'].includes(cat)) {
        p.flavor_profile = 'salty';
    } else {
        p.flavor_profile = 'standard';
    }

    // Indulgence tier
    if (cat === 'Cream Biscuits') {
        p.indulgence_tier = 'cream-filled';
    } else if (cat === 'Chocolates') {
        p.indulgence_tier = 'chocolate';
    } else if (cat === 'Ice Cream') {
        p.indulgence_tier = 'frozen-dessert';
    } else if (cat === 'Chips & Snacks') {
        p.indulgence_tier = name.includes('baked') ? 'baked-snack' : 'fried-snack';
    } else if (name.includes('cream')) {
        p.indulgence_tier = 'cream-filled';
    } else if (name.includes('choc') || name.includes('cocoa')) {
        p.indulgence_tier = 'chocolate-coated';
    } else if (name.includes('fruit') || name.includes('nut')) {
        p.indulgence_tier = 'fruit-nut';
    } else if (['Milk', 'Dairy Drinks'].includes(cat)) {
        p.indulgence_tier = 'dairy-drink';
    } else if (cat === 'Drinks') {
        p.indulgence_tier = 'sweetened-beverage';
    } else {
        p.indulgence_tier = 'plain';
    }
});

fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Updated ${products.length} products with indulgence_tier and flavor_profile.`);
