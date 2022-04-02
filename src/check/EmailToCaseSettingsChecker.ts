import { EmailToCaseRoutingAddress, EmailToCaseSettings } from '../metadata_browser/EmailToCaseSettings';
import { CheckerBase } from './CheckerBase';
import { MetadataError, MetadataProblem } from './MetadataProblem';

export class EmailToCaseSettingsChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const emailToCaseSettings = this.sfdxProjectBrowser.emailToCaseSettings();
    return this.checkRoutingAddresses(emailToCaseSettings);
  }

  private checkRoutingAddresses(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return this.checkEmailServicesAddress(emailToCaseSettings).concat(this.checkIsVerified(emailToCaseSettings));
  }

  // <emailServicesAddress> should not be stored in version control.
  // This field is set by Salesforce and it unique for each environment, so you can't deploy it.
  // In fact trying to change it during a deployment results in a Salesforce validation error.
  private checkEmailServicesAddress(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return emailToCaseSettings
      .routingAddresses()
      .filter((r) => r.emailServicesAddress !== undefined)
      .map((r) => this.metadataError(emailToCaseSettings, r, 'emailServicesAddress'));
  }

  // <isVerified> should not be stored in version control.
  // It specifies whether an email address as been verified and is specific to each environment.
  // As such it can't be modified in a deployment; doing so will result in a Salesforce validation error.
  private checkIsVerified(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return emailToCaseSettings
      .routingAddresses()
      .filter((r) => r.isVerified !== undefined)
      .map((r) => this.metadataError(emailToCaseSettings, r, 'isVerified'));
  }

  private metadataError(
    settings: EmailToCaseSettings,
    routingAddress: EmailToCaseRoutingAddress,
    fieldName: string
  ): MetadataError {
    const componentName = 'EmailToCase:' + routingAddress.routingName;
    const message = `<${fieldName}> field should not be version-controlled`;
    return new MetadataError(componentName, 'CaseSettings', settings.fileName, message);
  }
}
