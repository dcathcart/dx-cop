import * as fs from 'fs';

export class LwcMetadataChecker {

  public hasTrailingWhitespace(input: string) {
    return input != input.trimRight();
  }

  public fileHasTrailingWhitespace(filename: string) {
    let file = fs.readFileSync(filename);
    let fileContents = file.toString();
    let lines = fileContents.split('\r\n');

    for (let lineNo in lines) {
      let line = lines[lineNo];

      if (this.hasTrailingWhitespace(line))
        return true;
    }
    return false;
  }

  public checkLwcMetadata(folder: string) {
    fs.readdirSync(folder).forEach(entry => {
      if (entry == 'jsconfig.json')
        return;

      let jsMetaFileName = folder + entry + '/' + entry + '.js-meta.xml';

      if (this.fileHasTrailingWhitespace(jsMetaFileName))
        console.log("Trailing whitespace found: " + jsMetaFileName);
      else
        console.log("Passed: " + jsMetaFileName);
    });
  }
}
