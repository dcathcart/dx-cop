import * as fs from 'fs';

function hasTrailingWhitespace(input: string) {
    return input != input.trimRight();
}

function fileHasTrailingWhitespace(filename: string) {
    let file = fs.readFileSync(filename);
    let fileContents = file.toString();
    let lines = fileContents.split('\r\n');

    for (let lineNo in lines) {
        let line = lines[lineNo];

        if (hasTrailingWhitespace(line))
            return true;
    }
    return false;
}

let filename = 'C:/Dev/salesforce/unpackaged/main/default/lwc/articleSearch/articleSearch.js-meta.xml';
let result = fileHasTrailingWhitespace(filename);
console.log(result);
