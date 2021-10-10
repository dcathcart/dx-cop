import * as os from 'os';
import * as path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxProject } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { LwcMetadataChecker } from '../../../check/LwcMetadataChecker';

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
    const name = (this.flags.name || 'world') as string;

    const outputString = `Hello ${name}!`;
    this.ux.log(outputString);

    const sfdxProject = await SfdxProject.resolve();
    const defaultPackage = sfdxProject.getDefaultPackage();
    const lwcPath = path.join(defaultPackage.fullPath, 'main/default/lwc/');

    const lwcMetadataChecker = new LwcMetadataChecker();
    lwcMetadataChecker.checkLwcFolder(lwcPath);

    // Return an object to be displayed with --json
    return { output: outputString, outputString };
  }
}
