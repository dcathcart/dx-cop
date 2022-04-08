import * as fs from 'fs';
import * as path from 'path';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class LwcMetadataChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const lwcFolders = this.sfdxProjectBrowser.lwcFolders();
    return this.checkLwcFolders(lwcFolders);
  }

  // Checks over all of the given lightning web components.
  // Right now the only check performed is for trailing whitespace. Any trailing whitespace in a .js-meta.xml file
  // can, for reasons unknown, cause even more whitespace to be added _between_ lines during a Salesforce deployment
  // (which can result in noisy diffs later when the lwc is retrieved). Best to avoid in the first place.
  private checkLwcFolders(lwcFolders: Map<string, string>): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    lwcFolders.forEach((lwcFolder, lwcName) => {
      const jsMetaFileName = path.join(lwcFolder, lwcName + '.js-meta.xml');
      warnings.push(...this.checkJsMetaFile(lwcName, jsMetaFileName));
    });

    return warnings;
  }

  // Check a single .js-meta.xml file (full path expected).
  // Returns an array of warnings about the file.
  // (okay, so right now there will only every be zero or one warnings, because we only check for one thing,
  // i.e. trailing whitespace. Writing it this way with the future in mind)
  private checkJsMetaFile(lwcName: string, jsMetaFilename: string): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    if (this.fileHasTrailingWhitespace(jsMetaFilename)) {
      warnings.push(
        new MetadataWarning(
          lwcName,
          'LightningComponentBundle',
          jsMetaFilename,
          'Whitespace characters detected at the end of one or more lines in .js-meta.xml file'
        )
      );
    }

    return warnings;
  }

  private fileHasTrailingWhitespace(filename: string): boolean {
    const file = fs.readFileSync(filename);
    const fileContents = file.toString();
    const lines = fileContents.split(/\r\n|\n|\r/); // handle DOS|Unix|old Mac line endings
    const result = lines.some((line) => this.hasTrailingWhitespace(line));
    return result;
  }

  private hasTrailingWhitespace(input: string): boolean {
    return input !== input.trimEnd();
  }
}
