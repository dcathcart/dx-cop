import { CustomField } from '../metadata_browser/customField';
import { CustomObject } from '../metadata_browser/customObject';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/profile';
import { MetadataProblem, MetadataWarning } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class AdminProfileRuleset extends MetadataRuleset {
  public displayName = 'Admin profile';

  public run(): MetadataProblem[] {
    const adminProfile = this.sfdxProjectBrowser.profileByName('Admin');
    const expectedObjects = this.expectedObjects();
    const expectedFields = this.expectedFields(expectedObjects);

    return this.checkProfile(adminProfile, expectedObjects, expectedFields);
  }

  private expectedObjects(): CustomObject[] {
    // Get a list of objects we should 'expect' to see in a profile.
    // Limit scope to custom objects for now. Don't include standard objects, custom settings etc.
    const objects = this.sfdxProjectBrowser.objects();
    return objects.filter((obj) => obj.isCustomObject());
  }

  private expectedFields(objects: CustomObject[]): CustomField[] {
    // For the given list of objects, get a list of fields we should 'expect' to see in a profile.
    // Required fields do not appear in profiles, so filter them out.
    // Makes sense if you think about it: they *have* to be readable and editable (regardless of profile, or anything else) if they are to be required.
    const fields = objects.map((obj) => this.sfdxProjectBrowser.fields(obj.name)).flat();
    return fields.filter((f) => !f.isRequired());
  }

  private checkProfile(
    profile: Profile,
    expectedObjects: CustomObject[],
    expectedFields: CustomField[]
  ): MetadataProblem[] {
    return this.missingFields(profile, expectedFields)
      .concat(this.missingFieldPermissions(profile))
      .concat(this.fieldSortOrderWarnings(profile))
      .concat(this.missingObjects(profile, expectedObjects))
      .concat(this.missingObjectPermissions(profile))
      .concat(this.objectSortOrderWarnings(profile));
  }

  // Given a profile and a list of fields that are expected to be in that profile, return a collection of warnings for the fields that are not there.
  // Note this method does not decide what fields are "expected"; it simply checks and reports the missing ones.
  private missingFields(profile: Profile, expectedFields: CustomField[]): MetadataProblem[] {
    const fieldNamesInProfile = profile.fieldPermissions().map((p) => p.objectFieldName); // objectFieldName denotes a composite name "Object.Field"
    const missingFields = expectedFields.filter((f) => !fieldNamesInProfile.includes(f.objectFieldName()));
    return missingFields.map((f) => this.missingFieldWarning(profile, f));
  }

  private missingFieldWarning(profile: Profile, customField: CustomField): MetadataWarning {
    const message = `<fieldPermissions> not found for ${customField.objectFieldName()}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingFieldPermissions(profile: Profile): MetadataProblem[] {
    const results: MetadataProblem[] = [];

    for (const fieldPermission of profile.fieldPermissions()) {
      if (!fieldPermission.editable) {
        results.push(this.missingFieldPermissionWarning(profile, fieldPermission, 'editable'));
      }
      if (!fieldPermission.readable) {
        results.push(this.missingFieldPermissionWarning(profile, fieldPermission, 'readable'));
      }
    }

    return results;
  }

  private missingFieldPermissionWarning(
    profile: Profile,
    fieldPermission: ProfileFieldPermission,
    permissionName: string
  ): MetadataWarning {
    const message = `<${permissionName}> permission not set for field ${fieldPermission.objectFieldName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private fieldSortOrderWarnings(profile: Profile): MetadataProblem[] {
    const results: MetadataWarning[] = [];
    const fieldPermissions = profile.fieldPermissions();

    for (let i = 1; i < fieldPermissions.length; i++) {
      const a = fieldPermissions[i - 1];
      const b = fieldPermissions[i];

      if (a.objectFieldName > b.objectFieldName) {
        results.push(this.fieldSortOrderWarning(profile, a, b));
      }
    }

    return results;
  }

  private fieldSortOrderWarning(
    profile: Profile,
    a: ProfileFieldPermission,
    b: ProfileFieldPermission
  ): MetadataWarning {
    const message = `<fieldPermissions> should be sorted by <field>. Expect ${b.objectFieldName} to be before ${a.objectFieldName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingObjects(profile: Profile, expectedObjects: CustomObject[]): MetadataProblem[] {
    const objectNamesInProfile = profile.objectPermissions().map((p) => p.objectName);
    const missingObjects = expectedObjects.filter((obj) => !objectNamesInProfile.includes(obj.name));
    return missingObjects.map((obj) => this.missingObjectWarning(profile, obj));
  }

  private missingObjectWarning(profile: Profile, customObject: CustomObject): MetadataWarning {
    const message = `<objectPermissions> not found for ${customObject.name}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private missingObjectPermissions(profile: Profile): MetadataProblem[] {
    const results: MetadataProblem[] = [];

    for (const objectPermission of profile.objectPermissions()) {
      if (!objectPermission.allowCreate) {
        results.push(this.missingObjectPermissionWarning(profile, objectPermission, 'allowCreate'));
      }
      if (!objectPermission.allowDelete) {
        results.push(this.missingObjectPermissionWarning(profile, objectPermission, 'allowDelete'));
      }
      if (!objectPermission.allowEdit) {
        results.push(this.missingObjectPermissionWarning(profile, objectPermission, 'allowEdit'));
      }
      if (!objectPermission.allowRead) {
        results.push(this.missingObjectPermissionWarning(profile, objectPermission, 'allowRead'));
      }
      if (!objectPermission.modifyAllRecords) {
        results.push(this.missingObjectPermissionWarning(profile, objectPermission, 'modifyAllRecords'));
      }
      if (!objectPermission.viewAllRecords) {
        results.push(this.missingObjectPermissionWarning(profile, objectPermission, 'viewAllRecords'));
      }
    }

    return results;
  }

  private missingObjectPermissionWarning(
    profile: Profile,
    objectPermission: ProfileObjectPermission,
    permissionName: string
  ): MetadataWarning {
    const message = `<${permissionName}> permission not set for object ${objectPermission.objectName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private objectSortOrderWarnings(profile: Profile): MetadataProblem[] {
    const results: MetadataWarning[] = [];
    const objectPermissions = profile.objectPermissions();

    for (let i = 1; i < objectPermissions.length; i++) {
      const a = objectPermissions[i - 1];
      const b = objectPermissions[i];

      if (a.objectName > b.objectName) {
        results.push(this.objectSortOrderWarning(profile, a, b));
      }
    }

    return results;
  }

  private objectSortOrderWarning(
    profile: Profile,
    a: ProfileObjectPermission,
    b: ProfileObjectPermission
  ): MetadataWarning {
    const message = `<objectPermissions> should be sorted by <object>. Expect ${b.objectName} to be before ${a.objectName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }
}
