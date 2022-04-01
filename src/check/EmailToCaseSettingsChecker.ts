import { EmailToCaseRoutingAddress, EmailToCaseSettings } from '../metadata_browser/EmailToCaseSettings';
import { CheckerBase } from './CheckerBase';
import { MetadataError, MetadataProblem } from './MetadataProblem';

export class EmailToCaseSettingsChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const emailToCaseSettings = this.sfdxProjectBrowser.emailToCaseSettings();
    return this.checkIsVerified(emailToCaseSettings);
  }

  private checkIsVerified(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return emailToCaseSettings
      .routingAddresses()
      .filter((r) => r.isVerified !== undefined)
      .map((r) => this.metadataError(emailToCaseSettings, r));
  }

  private metadataError(settings: EmailToCaseSettings, routingAddress: EmailToCaseRoutingAddress): MetadataError {
    const componentName = 'EmailToCase:' + routingAddress.routingName;
    const message = '<isVerified> field should not be version-controlled';
    return new MetadataError(componentName, 'CaseSettings', settings.fileName, message);
  }
}
