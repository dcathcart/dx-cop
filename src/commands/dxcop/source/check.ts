import * as fs from 'fs';
import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

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

    let outputString = `Hello ${name}!`;
    this.ux.log(outputString);

    // Return an object to be displayed with --json
    return { output: outputString, outputString };
  }

  public hasTrailingWhitespace(input: string) {
      return input != input.trimRight();
  }

  public fileHasTrailingWhitespace(filename: string) {
      let file = fs.readFileSync(filename);
      let fileContents = file.toString();
      let lines = fileContents.split('\r\n');

      for (let lineNo in lines) {
          let line = lines[lineNo];

          if (hasTrailingWhitespace(line))
              return true;
      }
      return false;
  }

  public checkLwcMetadata(folder: string) {
      fs.readdirSync(folder).forEach(entry => {
          if (entry == 'jsconfig.json')
              return;

          let jsMetaFileName = folder + entry + '/' + entry + '.js-meta.xml';

          if (fileHasTrailingWhitespace(jsMetaFileName))
              console.log("Trailing whitespace found: " + jsMetaFileName);
          else
              console.log("Passed: " + jsMetaFileName);
      });
  }
}
