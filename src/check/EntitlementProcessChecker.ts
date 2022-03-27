import { EntitlementProcessVersion } from '../metadata_browser/EntitlementProcessVersion';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class EntitlementProcessChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    return this.sfdxProjectBrowser
      .entitlementProcessVersions()
      .filter((v) => !this.hasValidName(v))
      .map((v) => this.metadataWarning(v));
  }

  private hasValidName(v: EntitlementProcessVersion): boolean {
    return decodeURIComponent(v.name) === this.expectedName(v);
  }

  private expectedName(v: EntitlementProcessVersion): string {
    // Rule: file name should be lower cased <name> + '_v' + <versionNumber>, e.g.:
    // <name>Enquiries</name>
    // <versionNumber>1</versionNumber>
    // --> "enquiries_v1"
    return v.versionName.toLowerCase() + '_v' + v.versionNumber.toString();
  }

  private metadataWarning(v: EntitlementProcessVersion): MetadataWarning {
    const message = `File name does not match metadata. Expected: '${this.expectedName(v)}'`;
    return new MetadataWarning(v.name, 'EntitlementProcess', v.fileName, message);
  }
}
