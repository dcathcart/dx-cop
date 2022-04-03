import { CustomField } from '../metadata_browser/CustomField';
import { CustomObject } from '../metadata_browser/CustomObject';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/Profile';
import { CheckerBase } from './CheckerBase';
import { MetadataProblem, MetadataWarning } from './MetadataProblem';

export class AdminProfileChecker extends CheckerBase {
  public run(): MetadataProblem[] {
    const adminProfile = this.sfdxProjectBrowser.profileByName('Admin');

    const objects = this.sfdxProjectBrowser.objects();
    const expectedObjects = this.filterObjects(objects);

    const fields = expectedObjects.map((obj) => this.sfdxProjectBrowser.fields(obj.name)).reduce((a, b) => a.concat(b));
    const expectedFields = this.filterFields(fields);

    return this.checkProfile(adminProfile, expectedObjects, expectedFields);
  }

  private filterObjects(objects: CustomObject[]): CustomObject[] {
    // Filter out anything that is not a custom object, i.e. don't include standard objects, custom settings etc.
    return objects.filter((obj) => obj.isCustomObject());
  }

  private filterFields(fields: CustomField[]): CustomField[] {
    // Filter out anything that is not a custom field
    //
    // Required fields do not appear in profiles.
    // Makes sense if you think about it: they *have* to be readable and editable (regardless of profile, or anything else) if they are to be required.
    //
    // MasterDetail fields also do not appear in profiles.
    // Also make sense; master-detail relationships appear to be like foreign key relationships, but "stronger",
    // in that "detail" records can't exist on their own without a "master" record.
    // So the field that links a detail record back to a master record is implicitly a required field.
    return fields.filter((f) => f.isCustom() && !f.required && !f.isMasterDetail());
  }

  private checkProfile(
    profile: Profile,
    expectedObjects: CustomObject[],
    expectedFields: CustomField[]
  ): MetadataProblem[] {
    return this.missingFields(profile, expectedFields)
      .concat(this.missingFieldPermissions(profile))
      .concat(this.missingObjects(profile, expectedObjects))
      .concat(this.missingObjectPermissions(profile));
  }

  // Given a profile and a list of fields that are expected to be in that profile, return a collection of warnings for the fields that are not there.
  // Note this method does not decide what fields are "expected"; it simply checks and reports the missing ones.
  private missingFields(profile: Profile, expectedFields: CustomField[]): MetadataProblem[] {
    const fieldNamesInProfile = profile.fieldPermissions().map((p) => p.objectFieldName); // objectFieldName denotes a composite name "Object.Field"
    const missingFields = expectedFields.filter((f) => !fieldNamesInProfile.includes(f.objectFieldName));
    return missingFields.map((f) => this.missingFieldError(profile, f));
  }

  private missingFieldError(profile: Profile, customField: CustomField): MetadataWarning {
    const message = `<fieldPermissions> not found for ${customField.objectFieldName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingFieldPermissions(profile: Profile): MetadataProblem[] {
    const results: MetadataProblem[] = [];

    for (const fieldPermission of profile.fieldPermissions()) {
      if (!fieldPermission.editable) {
        results.push(this.missingFieldPermissionError(profile, fieldPermission, 'editable'));
      }
      if (!fieldPermission.readable) {
        results.push(this.missingFieldPermissionError(profile, fieldPermission, 'readable'));
      }
    }

    return results;
  }

  private missingFieldPermissionError(
    profile: Profile,
    fieldPermission: ProfileFieldPermission,
    permissionName: string
  ): MetadataWarning {
    const message = `<${permissionName}> permission not set for field ${fieldPermission.objectFieldName}`;
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
