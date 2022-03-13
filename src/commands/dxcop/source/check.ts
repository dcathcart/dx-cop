import * as os from 'os';
import * as path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, NamedPackageDir, SfdxProject } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

import { LwcMetadataChecker } from '../../../check/LwcMetadataChecker';
import { MetadataProblem } from '../../../check/MetadataProblem';
import { RecordTypeChecker } from '../../../check/RecordTypeChecker';
import { RecordTypePicklistValueChecker } from '../../../check/RecordTypePicklistValueChecker';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('dx-cop', 'org');

export default class Check extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    name: flags.string({
      char: 'n',
      description: messages.getMessage('nameFlagDescription'),
    }),
    force: flags.boolean({
      char: 'f',
      description: messages.getMessage('forceFlagDescription'),
    }),
  };

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const sfdxProject = await SfdxProject.resolve();
    const defaultPackage = sfdxProject.getDefaultPackage();

    const lwcWarnings = this.checkLwcMetadata(defaultPackage);
    const rtWarnings = this.checkRecordTypeMetadata(defaultPackage);
    const rtPicklistWarnings = this.checkRecordTypePicklistMetadata(defaultPackage);

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

  public checkLwcMetadata(sfdxPackage: NamedPackageDir): MetadataProblem[] {
    const lwcPath = path.join(sfdxPackage.fullPath, 'main', 'default', 'lwc');
    const lwcMetadataChecker = new LwcMetadataChecker();
    return lwcMetadataChecker.checkLwcFolder(lwcPath);
  }

  public checkRecordTypeMetadata(sfdxPackage: NamedPackageDir): MetadataProblem[] {
    const baseDir = path.join(sfdxPackage.fullPath, 'main', 'default');
    const recordTypeChecker = new RecordTypeChecker(baseDir);
    return recordTypeChecker.run();
  }

  public checkRecordTypePicklistMetadata(sfdxPackage: NamedPackageDir): MetadataProblem[] {
    const baseDir = path.join(sfdxPackage.fullPath, 'main', 'default');
    const recordTypePicklistChecker = new RecordTypePicklistValueChecker(baseDir);
    return recordTypePicklistChecker.run();
  }
}
