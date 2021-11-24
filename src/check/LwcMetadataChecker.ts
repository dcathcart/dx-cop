import * as fs from 'fs';
import * as path from 'path';

export class LwcMetadataChecker {
  // Checks over all of the lightning web components in a given lwc folder (full path expected).
  // Right now the only check performed is for trailing whitespace. Any trailing whitespace in a .js-meta.xml file
  // can, for reasons unknown, cause even more whitespace to be added _between_ lines during a Salesforce deployment
  // (which can result in noisy diffs later when the lwc is retrieved). Best to avoid in the first place.
  public checkLwcFolder(lwcFolder: string): string[] {
    const lwcs = fs.readdirSync(lwcFolder).filter((entry) => entry !== 'jsconfig.json');
    const warnings: string[] = [];

    lwcs.forEach((entry) => {
      const jsMetaFileName = path.join(lwcFolder, entry, entry + '.js-meta.xml');
      warnings.push(...this.checkJsMetaFile(jsMetaFileName));
    });

    return warnings;
  }

  // Check a single .js-meta.xml file (full path expected).
  // Returns an array of warnings about the file.
  public checkJsMetaFile(jsMetaFilename: string): string[] {
    const warnings: string[] = [];

    if (this.fileHasTrailingWhitespace(jsMetaFilename)) {
      warnings.push(`Trailing whitespace detected: ${jsMetaFilename}`);
    }

    return warnings;
  }

  public fileHasTrailingWhitespace(filename: string): boolean {
    const file = fs.readFileSync(filename);
    const fileContents = file.toString();
    const lines = fileContents.split('\r\n');
    const result = lines.some((line) => this.hasTrailingWhitespace(line));
    return result;
  }

  public hasTrailingWhitespace(input: string): boolean {
    return input !== input.trimRight();
  }
}
