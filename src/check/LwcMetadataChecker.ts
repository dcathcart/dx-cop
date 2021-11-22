import * as fs from 'fs';
import * as path from 'path';
import { AnyJson } from '@salesforce/ts-types';

export class LwcMetadataChecker {
  public checkLwcFolder(lwcFolder: string): AnyJson {
    const lwcs = fs.readdirSync(lwcFolder).filter((entry) => entry !== 'jsconfig.json');
    const warnings: string[] = [];

    lwcs.forEach((entry) => {
      const jsMetaFileName = path.join(lwcFolder, entry, entry + '.js-meta.xml');
      warnings.push(...this.checkJsMetaFile(jsMetaFileName));
    });

    return { warnings };
  }

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
