import * as fs from 'fs';
import * as path from 'path';

export class LwcMetadataChecker {
  public hasTrailingWhitespace(input: string): boolean {
    return input !== input.trimRight();
  }

  public fileHasTrailingWhitespace(filename: string): boolean {
    const file = fs.readFileSync(filename);
    const fileContents = file.toString();
    const lines = fileContents.split('\r\n');
    const result = lines.some((line) => this.hasTrailingWhitespace(line));
    return result;
  }

  public checkJsMetaFile(jsMetaFilename: string): void {
    if (this.fileHasTrailingWhitespace(jsMetaFilename)) {
      console.log(`Trailing whitespace detected: ${jsMetaFilename}`);
    }
  }

  public checkLwcFolder(lwcFolder: string): void {
    const lwcs = fs.readdirSync(lwcFolder).filter((entry) => entry !== 'jsconfig.json');

    lwcs.forEach((entry) => {
      const jsMetaFileName = path.join(lwcFolder, entry, entry + '.js-meta.xml');
      this.checkJsMetaFile(jsMetaFileName);
    });
  }
}
