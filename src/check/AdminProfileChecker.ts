import { Profile } from '../metadata_browser/Profile';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class AdminProfileChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const adminProfile = this.sfdxProjectBrowser.profileByName('Admin');
    const objectNames = this.sfdxProjectBrowser.objectNames();

    return this.ensureObjectsExist(adminProfile, objectNames);
  }

  private ensureObjectsExist(profile: Profile, objectNames: string[]): MetadataProblem[] {
    const objectNamesInProfile = profile.objectPermissions().map((p) => p.objectName);
    const missingObjectNames = objectNames.filter((n) => !objectNamesInProfile.includes(n));
    return missingObjectNames.map((n) => this.missingObjectError(profile, n));
  }

  private missingObjectError(profile: Profile, objectName: string): MetadataWarning {
    const message = `Object ${objectName} is missing from Admin profile <objectPermissions>`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }
}
