import * as fs from 'fs';
import { LightningComponentBundle } from '../metadata_browser/LightningComponentBundle';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';
import { MetadataRuleset } from './MetadataRuleset';

export class LwcMetadataRuleset extends MetadataRuleset {
  public displayName = 'Lightning web components';

  // Checks over all lightning web components in the project.
  // Right now the only check performed is for trailing whitespace.
  // Any trailing whitespace in a .js-meta.xml file can, for reasons unknown, cause even more whitespace to be added
  // *between* lines during a Salesforce deployment (which can result in noisy diffs later when the lwc is retrieved).
  // Best to avoid in the first place.
  public run(): MetadataProblem[] {
    const lwcBundles = this.sfdxProjectBrowser.lwcBundles();
    return this.trailingWhitespaceWarnings(lwcBundles);
  }

  private trailingWhitespaceWarnings(lwcBundles: LightningComponentBundle[]): MetadataProblem[] {
    return lwcBundles
      .filter((lwc) => this.fileHasTrailingWhitespace(lwc.jsMetaFileName))
      .map((lwc) => this.trailingWhitespaceWarning(lwc));
  }

  private fileHasTrailingWhitespace(filename: string): boolean {
    const file: Buffer = fs.readFileSync(filename);
    const lines: string[] = file.toString().split(/\r\n|\n|\r/); // handle DOS|Unix|old Mac line endings
    return lines.some((line) => this.lineHasTrailingWhitespace(line));
  }

  private lineHasTrailingWhitespace(line: string): boolean {
    return line !== line.trimEnd();
  }

  private trailingWhitespaceWarning(lwc: LightningComponentBundle): MetadataWarning {
    return new MetadataWarning(
      lwc.name,
      lwc.metadataType,
      lwc.jsMetaFileName,
      'Whitespace characters detected at the end of one or more lines in .js-meta.xml'
    );
  }
}
