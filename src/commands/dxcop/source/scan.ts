import * as os from 'os';
import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxProject } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

import { EmailToCaseSettingsScanner } from '../../../scan/EmailToCaseSettingsScanner';
import { LwcMetadataScanner } from '../../../scan/LwcMetadataScanner';
import { MetadataProblem } from '../../../scan/MetadataProblem';
import { RecordTypePicklistScanner } from '../../../scan/RecordTypePicklistScanner';
import { RecordTypePicklistValueScanner } from '../../../scan/RecordTypePicklistValueScanner';
import { SfdxProjectBrowser } from '../../../metadata_browser/SfdxProjectBrowser';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('dx-cop', 'scan');

export default class Scan extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static examples = messages.getMessage('examples').split(os.EOL);

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    this.ux.log('Resolving SFDX project...');
    const sfdxProject = await SfdxProject.resolve();
    const sfdxProjectBrowser = new SfdxProjectBrowser(sfdxProject);

    this.ux.log('Scanning metadata...');
    const metadataProblems: MetadataProblem[] = [];
    metadataProblems.push(...this.scanEmailToCaseSettings(sfdxProjectBrowser));
    metadataProblems.push(...this.scanLwcMetadata(sfdxProjectBrowser));
    metadataProblems.push(...this.scanRecordTypeMetadata(sfdxProjectBrowser));
    metadataProblems.push(...this.scanRecordTypePicklistMetadata(sfdxProjectBrowser));

    // Log output as a pretty table. Note it won't be shown if --json was passed
    this.ux.log(); // blank line first
    const problemCount = metadataProblems.length;
    if (problemCount === 0) {
      this.ux.log('Successfully scanned metadata. No problems found!');
    } else {
      const tableData = metadataProblems.map((p) => p.tableOutput());
      this.ux.log(`=== Metadata Problems [${problemCount}]`);
      this.ux.table(tableData, MetadataProblem.tableOutputKeys);
    }

    // Return non-zero exit code if there are any metadata problems; useful for use in CI jobs
    // Not sure whether this is the "correct" way to set the exit code, but it works!
    if (metadataProblems.length > 0) {
      process.exitCode = 1;
    }

    // Return an object to be displayed with --json
    return { problems: metadataProblems.map((p) => p.jsonOutput()) };
  }

  public scanEmailToCaseSettings(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('email-to-case settings');
    return new EmailToCaseSettingsScanner(sfdxProjectBrowser).run();
  }

  public scanLwcMetadata(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('lwc metadata');
    return new LwcMetadataScanner(sfdxProjectBrowser).run();
  }

  public scanRecordTypeMetadata(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('record type picklists');
    return new RecordTypePicklistScanner(sfdxProjectBrowser).run();
  }

  public scanRecordTypePicklistMetadata(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('record type picklist values');
    return new RecordTypePicklistValueScanner(sfdxProjectBrowser).run();
  }
}
