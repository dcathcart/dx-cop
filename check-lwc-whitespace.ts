import * as fs from 'fs';
let f = fs.readFileSync('C:/Dev/salesforce/unpackaged/main/default/lwc/articleSearch/articleSearch.js-meta.xml');

let fileContents = f.toString();
let lines = fileContents.split('\r\n');

for (let lineNo in lines) {
    let line = lines[lineNo];
    let trimmedLine = line.trimRight();
    let hasTrailingWhitespace = (line != trimmedLine);
    let trailingWhitespace = hasTrailingWhitespace ? "********* TRAILING WHITESPACE *********" : "(no trailing whitespace)";

    console.log(lineNo + ': ' + lines[lineNo] + ' ' + trailingWhitespace);
}
