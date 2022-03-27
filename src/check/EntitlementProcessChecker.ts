import { EntitlementProcessVersion } from '../metadata_browser/EntitlementProcessVersion';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class EntitlementProcessChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    return this.checkNames().concat(this.checkVersions());
  }

  private checkNames(): MetadataProblem[] {
    return this.sfdxProjectBrowser
      .entitlementProcessVersions()
      .filter((v) => !this.hasValidName(v))
      .map((v) => this.nameWarning(v));
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

  private nameWarning(v: EntitlementProcessVersion): MetadataWarning {
    const message = `File name does not match metadata. Expected: '${this.expectedName(v)}'`;
    return new MetadataWarning(v.name, 'EntitlementProcess', v.fileName, message);
  }

  private checkVersions(): MetadataProblem[] {
    const results: MetadataProblem[] = [];

    const versions = this.sfdxProjectBrowser.entitlementProcessVersions();
    const grouped = this.groupByVersionMaster(versions);

    for (const group of grouped.values()) {
      const sorted = this.sortByVersionNumber(group);

      // expect version numbers to start at 1
      const firstVersion = sorted[0];
      if (firstVersion.versionNumber !== 1) {
        const message = `Version numbers should start from 1 (actual: ${firstVersion.versionNumber})`;
        results.push(new MetadataWarning(firstVersion.name, 'EntitlementProcess', firstVersion.fileName, message));
      }

      // expect version numbers to be consecutive
      for (let i = 1; i < sorted.length; i++) {
        const previousVersion = sorted[i - 1];
        const thisVersion = sorted[i];
        const expectedVersionNumber = previousVersion.versionNumber + 1;
        const actualVersionNumber = thisVersion.versionNumber;

        if (expectedVersionNumber !== actualVersionNumber) {
          const message = `Version numbers are not consecutive. Expected ${expectedVersionNumber} but saw ${actualVersionNumber}`;
          results.push(new MetadataWarning(thisVersion.name, 'EntitlementProcess', thisVersion.fileName, message));
        }
      }
    }

    return results;
  }

  // low-tech grouping of EntitlementProcessVersion objects by .versionMaster
  // will come back later to improve, but it does the job for now
  private groupByVersionMaster(versions: EntitlementProcessVersion[]): Map<string, EntitlementProcessVersion[]> {
    const grouped = new Map<string, EntitlementProcessVersion[]>();
    for (const v of versions) {
      if (grouped.has(v.versionMaster)) {
        grouped.get(v.versionMaster).push(v);
      } else {
        grouped.set(v.versionMaster, [v]);
      }
    }
    return grouped;
  }

  // abstracting the code I don't like down here & will come back later
  private sortByVersionNumber(versions: EntitlementProcessVersion[]): EntitlementProcessVersion[] {
    return versions.sort((a, b) => a.versionNumber - b.versionNumber);
  }
}
