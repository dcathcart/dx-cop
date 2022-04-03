import { CustomField } from '../metadata_browser/CustomField';
import { CustomObject } from '../metadata_browser/CustomObject';
import { Profile, ProfileObjectPermission } from '../metadata_browser/Profile';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class AdminProfileChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const adminProfile = this.sfdxProjectBrowser.profileByName('Admin');
    const customObjects = this.sfdxProjectBrowser.customObjects();

    const customFields: CustomField[] = [];
    for (const obj of customObjects) {
      customFields.push(...this.sfdxProjectBrowser.customFields(obj.name));
    }

    return this.missingFields(adminProfile, customFields)
      .concat(this.missingObjects(adminProfile, customObjects))
      .concat(this.missingObjectPermissions(adminProfile));
  }

  private missingFields(profile: Profile, customFields: CustomField[]): MetadataProblem[] {
    const fieldNamesInProfile = profile.fieldPermissions().map((p) => p.objectFieldName);
    const missingFields = customFields.filter((f) => !fieldNamesInProfile.includes(f.objectFieldName));
    return missingFields.map((f) => this.missingFieldError(profile, f));
  }

  private missingFieldError(profile: Profile, customField: CustomField): MetadataWarning {
    const message = `<fieldPermissions> not found for ${customField.objectFieldName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingObjects(profile: Profile, customObjects: CustomObject[]): MetadataProblem[] {
    const objectNamesInProfile = profile.objectPermissions().map((p) => p.objectName);
    const missingObjects = customObjects.filter((obj) => !objectNamesInProfile.includes(obj.name));
    return missingObjects.map((obj) => this.missingObjectError(profile, obj));
  }

  private missingObjectError(profile: Profile, customObject: CustomObject): MetadataWarning {
    const message = `<objectPermissions> not found for ${customObject.name}`;
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
