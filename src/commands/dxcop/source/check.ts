import * as os from 'os';
import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxProject } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

import { LwcMetadataChecker } from '../../../check/LwcMetadataChecker';
import { MetadataProblem } from '../../../check/MetadataProblem';
import { RecordTypePicklistChecker } from '../../../check/RecordTypePicklistChecker';
import { RecordTypePicklistValueChecker } from '../../../check/RecordTypePicklistValueChecker';
import { SfdxProjectBrowser } from '../../../metadata_browser/SfdxProjectBrowser';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('dx-cop', 'check');

export default class Check extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static examples = messages.getMessage('examples').split(os.EOL);

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const sfdxProject = await SfdxProject.resolve();
    const sfdxProjectBrowser = new SfdxProjectBrowser(sfdxProject);

    const lwcWarnings = this.checkLwcMetadata(sfdxProjectBrowser);
    const rtWarnings = this.checkRecordTypeMetadata(sfdxProjectBrowser);
    const rtPicklistWarnings = this.checkRecordTypePicklistMetadata(sfdxProjectBrowser);

    const metadataProblems = lwcWarnings.concat(rtWarnings).concat(rtPicklistWarnings);

    // Log output as a pretty table. Note it won't be shown if --json was passed
    const problemCount = metadataProblems.length;
    if (problemCount === 0) {
      this.ux.log('Successfully checked metadata. No problems found!');
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

  public checkLwcMetadata(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('Checking LWCs...');
    return new LwcMetadataChecker(sfdxProjectBrowser).run();
  }

  public checkRecordTypeMetadata(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('Checking record type picklists...');
    return new RecordTypePicklistChecker(sfdxProjectBrowser).run();
  }

  public checkRecordTypePicklistMetadata(sfdxProjectBrowser: SfdxProjectBrowser): MetadataProblem[] {
    this.ux.log('Checking record type picklist values...');
    return new RecordTypePicklistValueChecker(sfdxProjectBrowser).run();
  }
}
