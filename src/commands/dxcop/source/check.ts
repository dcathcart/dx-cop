import * as os from 'os';
import rc = require('rc');

import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxProject } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

import defaultConfig from '../../../config/DefaultConfig';
import { SfdxProjectBrowser } from '../../../metadata_browser/SfdxProjectBrowser';
import { EmailToCaseSettingsRuleset } from '../../../ruleset/EmailToCaseSettingsRuleset';
import { LwcMetadataRuleset } from '../../../ruleset/LwcMetadataRuleset';
import { MetadataProblem } from '../../../ruleset/MetadataProblem';
import { MetadataRuleset } from '../../../ruleset/MetadataRuleset';
import { RecordTypePicklistRuleset } from '../../../ruleset/RecordTypePicklistRuleset';
import { RecordTypePicklistValueRuleset } from '../../../ruleset/RecordTypePicklistValueRuleset';

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

    const metadataProblems = this.rulesetsToRun(sfdxProject)
      .map((ruleset) => {
        this.ux.log(ruleset.displayName);
        return ruleset.run(); // returns an array of metadata problems for each ruleset
      })
      .flat(); // which are then flattened into one big array

    // Log output as a pretty table. Note it won't be shown if --json was passed
    this.ux.log(); // blank line first
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

  private rulesetsToRun(sfdxProject: SfdxProject): MetadataRuleset[] {
    const config = this.loadConfig();

    const sfdxProjectBrowser = new SfdxProjectBrowser(sfdxProject);
    const rulesets: MetadataRuleset[] = [];

    if (config.ruleSets.emailToCaseSettings.enabled) {
      rulesets.push(new EmailToCaseSettingsRuleset(sfdxProjectBrowser));
    }
    if (config.ruleSets.lightningWebComponents.enabled) {
      rulesets.push(new LwcMetadataRuleset(sfdxProjectBrowser));
    }
    if (config.ruleSets.recordTypePicklists.enabled) {
      rulesets.push(new RecordTypePicklistRuleset(sfdxProjectBrowser));
    }
    if (config.ruleSets.recordTypePicklistValues.enabled) {
      rulesets.push(new RecordTypePicklistValueRuleset(sfdxProjectBrowser));
    }

    return rulesets;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private loadConfig() {
    return rc('dxcop', defaultConfig());
  }
}
