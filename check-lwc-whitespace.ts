const fs = require('fs');
const f = fs.readFileSync('C:/Dev/salesforce/unpackaged/main/default/lwc/articleSearch/articleSearch.js-meta.xml');
console.log(f.toString());
