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

    const metadataProblems = lwcWarnings.concat(rtWarnings);
    const warnings = rtPicklistWarnings;

    // Return an object to be displayed with --json
    return { problems: metadataProblems.map((p) => p.toJSON()), warnings };
  }

  public checkLwcMetadata(sfdxPackage: NamedPackageDir): MetadataProblem[] {
    const lwcPath = path.join(sfdxPackage.fullPath, 'main', 'default', 'lwc');
    const lwcMetadataChecker = new LwcMetadataChecker();
    return lwcMetadataChecker.checkLwcFolder(lwcPath);
  }

  public checkRecordTypeMetadata(sfdxPackage: NamedPackageDir): string[] {
    const baseDir = path.join(sfdxPackage.fullPath, 'main', 'default');
    const recordTypeChecker = new RecordTypeChecker(baseDir);
    return recordTypeChecker.run();
  }

  public checkRecordTypePicklistMetadata(sfdxPackage: NamedPackageDir): string[] {
    const baseDir = path.join(sfdxPackage.fullPath, 'main', 'default');
    const recordTypePicklistChecker = new RecordTypePicklistValueChecker(baseDir);
    return recordTypePicklistChecker.run();
  }
}
