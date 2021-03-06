import { EmailToCaseRoutingAddress, EmailToCaseSettings } from '../metadata_browser/emailToCaseSettings';
import { MetadataError, MetadataProblem, MetadataWarning } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class EmailToCaseSettingsRuleset extends MetadataRuleset {
  public displayName = 'Email-to-Case settings';

  public run(): MetadataProblem[] {
    const emailToCaseSettings = this.sfdxProjectBrowser.emailToCaseSettings();
    return this.checkRoutingAddresses(emailToCaseSettings);
  }

  private checkRoutingAddresses(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return this.emailServicesAddressErrors(emailToCaseSettings)
      .concat(this.isVerifiedErrors(emailToCaseSettings))
      .concat(this.sortOrderWarnings(emailToCaseSettings));
  }

  // <emailServicesAddress> should not be stored in version control.
  // This field is set by Salesforce and it unique for each environment, so you can't deploy it.
  // In fact trying to change it during a deployment results in a Salesforce validation error.
  private emailServicesAddressErrors(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return emailToCaseSettings
      .routingAddresses()
      .filter((r) => r.emailServicesAddress !== undefined)
      .map((r) => this.fieldError(emailToCaseSettings, r, 'emailServicesAddress'));
  }

  // <isVerified> should not be stored in version control.
  // It specifies whether an email address as been verified and is specific to each environment.
  // As such it can't be modified in a deployment; doing so will result in a Salesforce validation error.
  private isVerifiedErrors(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    return emailToCaseSettings
      .routingAddresses()
      .filter((r) => r.isVerified !== undefined)
      .map((r) => this.fieldError(emailToCaseSettings, r, 'isVerified'));
  }

  private fieldError(
    settings: EmailToCaseSettings,
    routingAddress: EmailToCaseRoutingAddress,
    fieldName: string
  ): MetadataError {
    const componentName = 'EmailToCase:' + routingAddress.routingName;
    const message = `<${fieldName}> field should not be version-controlled`;
    return new MetadataError(componentName, 'CaseSettings', settings.fileName, message);
  }

  // First(ish) go at checking the sort order of metadata.
  // Definitely some potential here for a generic check-the-sort-order-of-something function, which I'll visit in the future.
  // Why is the sort order important? Because when you retrieve this metadata, Salesforce always sorts it by <routingName>.
  // So if you deploy, then immediately retrieve the file again, the retrieved order will be different.
  // This can lead to unexpected differences that you need to manage, which can in turn lead to merge conflicts and other problems.
  private sortOrderWarnings(emailToCaseSettings: EmailToCaseSettings): MetadataProblem[] {
    const results: MetadataProblem[] = [];
    const routingAddresses = emailToCaseSettings.routingAddresses();

    for (let i = 1; i < routingAddresses.length; i++) {
      const a = routingAddresses[i - 1];
      const b = routingAddresses[i];

      if (a.routingName > b.routingName) {
        results.push(this.sortOrderWarning(emailToCaseSettings, a, b));
      }
    }

    return results;
  }

  private sortOrderWarning(
    settings: EmailToCaseSettings,
    routingAddressA: EmailToCaseRoutingAddress,
    routingAddressB: EmailToCaseRoutingAddress
  ): MetadataWarning {
    const message = `<routingAddresses> should be sorted by <routingName>. Expect '${routingAddressB.routingName}' to be before '${routingAddressA.routingName}'`;
    return new MetadataWarning('EmailToCase', 'CaseSettings', settings.fileName, message);
  }
}
