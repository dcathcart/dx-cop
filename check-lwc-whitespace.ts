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

function checkLwcMetadata(folder: string) {
    fs.readdirSync(folder).forEach(entry => {
        if (entry == 'jsconfig.json')
            return;

        let jsMetaFileName = folder + entry + '/' + entry + '.js-meta.xml';

        if (fileHasTrailingWhitespace(jsMetaFileName))
            console.log("Trailing whitespace found: " + jsMetaFileName);
        else
            console.log("Passed: " + jsMetaFileName);
    });
}

const folder = 'C:/Dev/salesforce/unpackaged/main/default/lwc/';
checkLwcMetadata(folder);
