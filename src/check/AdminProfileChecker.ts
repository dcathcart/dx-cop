import { CustomField } from '../metadata_browser/CustomField';
import { Profile, ProfileObjectPermission } from '../metadata_browser/Profile';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class AdminProfileChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const adminProfile = this.sfdxProjectBrowser.profileByName('Admin');
    const objectNames = this.sfdxProjectBrowser.customObjects().map((obj) => obj.name);

    const allFields: CustomField[] = [];
    for (const objectName of this.sfdxProjectBrowser.objectNames()) {
      allFields.push(...this.sfdxProjectBrowser.customFields(objectName));
    }

    return this.missingFields(adminProfile, allFields)
      .concat(this.missingObjects(adminProfile, objectNames))
      .concat(this.missingObjectPermissions(adminProfile));
  }

  private missingFields(profile: Profile, customFields: CustomField[]): MetadataProblem[] {
    const fieldNamesInProfile = profile.fieldPermissions().map((p) => p.objectFieldName);
    const missingFieldNames = customFields.filter((n) => !fieldNamesInProfile.includes(n.objectFieldName));
    return missingFieldNames.map((n) => this.missingFieldError(profile, n.objectFieldName));
  }

  private missingFieldError(profile: Profile, objectDotfieldName: string): MetadataWarning {
    const message = `<fieldPermissions> not found for ${objectDotfieldName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingObjects(profile: Profile, objectNames: string[]): MetadataProblem[] {
    const objectNamesInProfile = profile.objectPermissions().map((p) => p.objectName);
    const missingObjectNames = objectNames.filter((n) => !objectNamesInProfile.includes(n));
    return missingObjectNames.map((n) => this.missingObjectError(profile, n));
  }

  private missingObjectError(profile: Profile, objectName: string): MetadataWarning {
    const message = `<objectPermissions> not found for ${objectName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingObjectPermissions(profile: Profile): MetadataProblem[] {
    const results: MetadataProblem[] = [];

    for (const objectPermission of profile.objectPermissions()) {
      if (!objectPermission.allowCreate) {
        results.push(this.missingObjectPermissionError(profile, objectPermission, 'allowCreate'));
      }
      if (!objectPermission.allowDelete) {
        results.push(this.missingObjectPermissionError(profile, objectPermission, 'allowDelete'));
      }
      if (!objectPermission.allowEdit) {
        results.push(this.missingObjectPermissionError(profile, objectPermission, 'allowEdit'));
      }
      if (!objectPermission.allowRead) {
        results.push(this.missingObjectPermissionError(profile, objectPermission, 'allowRead'));
      }
      if (!objectPermission.modifyAllRecords) {
        results.push(this.missingObjectPermissionError(profile, objectPermission, 'modifyAllRecords'));
      }
      if (!objectPermission.viewAllRecords) {
        results.push(this.missingObjectPermissionError(profile, objectPermission, 'viewAllRecords'));
      }
    }

    return results;
  }

  private missingObjectPermissionError(
    profile: Profile,
    objectPermission: ProfileObjectPermission,
    permissionName: string
  ): MetadataProblem {
    const message = `<${permissionName}> permission not set for object ${objectPermission.objectName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }
}
