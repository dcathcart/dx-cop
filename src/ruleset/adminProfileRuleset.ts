import { CustomField } from '../metadata_browser/customField';
import { CustomObject } from '../metadata_browser/customObject';
import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/profile';
import { MetadataProblem, MetadataWarning } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class AdminProfileRuleset extends MetadataRuleset {
  public displayName = 'Admin profile';

  public run(): MetadataProblem[] {
    const adminProfile = this.sfdxProjectBrowser.profileByName('Admin');

    const objects = this.sfdxProjectBrowser.objects();
    const objectsToCheck = this.filterObjects(objects);

    const fields = objects.map((obj) => this.sfdxProjectBrowser.fields(obj.name)).flat();
    const fieldsToCheck = this.filterFields(fields);

    return this.checkProfile(adminProfile, objectsToCheck, fieldsToCheck);
  }

  private filterObjects(objects: CustomObject[]): CustomObject[] {
    // Get a list of objects we should check in the profile.
    // Limit scope to custom objects for now. Don't include standard objects, custom settings etc.
    return objects.filter((obj) => obj.isCustomObject());
  }

  private filterFields(fields: CustomField[]): CustomField[] {
    // "Filter out" the fields we're not interested in checking
    // Only check custom fields for now. This means:
    //   - all fields on custom objects
    //   - custom fields on standard objects
    // Required fields do not appear in profiles, so don't try to check them.
    // Makes sense if you think about it: they *have* to be readable and editable (regardless of profile, or anything else) if they are to be required.
    return fields.filter((f) => f.isCustom() && !f.isRequired());
  }

  private checkProfile(profile: Profile, objects: CustomObject[], fields: CustomField[]): MetadataProblem[] {
    return this.fieldNotFoundWarnings(profile, fields)
      .concat(this.fieldPermissionWarnings(profile, fields))
      .concat(this.fieldSortOrderWarnings(profile))
      .concat(this.objectNotFoundWarnings(profile, objects))
      .concat(this.objectPermissionWarnings(profile))
      .concat(this.objectSortOrderWarnings(profile));
  }

  // Given a profile and a list of fields that are expected to be in that profile, return a collection of warnings for the fields that are not there.
  // Note this method does not decide what fields are "expected"; it simply checks and reports the missing ones.
  private fieldNotFoundWarnings(profile: Profile, expectedFields: CustomField[]): MetadataProblem[] {
    const fieldNamesInProfile = profile.fieldPermissions().map((p) => p.objectFieldName); // objectFieldName denotes a composite name "Object.Field"
    const results = expectedFields.filter((f) => !fieldNamesInProfile.includes(f.objectFieldName()));
    return results.map((f) => this.fieldNotFoundWarning(profile, f));
  }

  private fieldNotFoundWarning(profile: Profile, customField: CustomField): MetadataWarning {
    const message = `<fieldPermissions> not found for ${customField.objectFieldName()}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private fieldPermissionWarnings(profile: Profile, fieldsToCheck: CustomField[]): MetadataProblem[] {
    const results: MetadataProblem[] = [];
    const fieldNamesToCheck = fieldsToCheck.map((f) => f.objectFieldName());

    for (const fieldPermission of profile.fieldPermissions()) {
      // Only check field permissions for the supplied list of fields
      // This restriction is in place for now, mainly because some standard fields can't be editable
      if (fieldNamesToCheck.includes(fieldPermission.objectFieldName)) {
        if (!fieldPermission.editable) {
          results.push(this.fieldPermissionWarning(profile, fieldPermission, 'editable'));
        }
        if (!fieldPermission.readable) {
          results.push(this.fieldPermissionWarning(profile, fieldPermission, 'readable'));
        }
      }
    }

    return results;
  }

  private fieldPermissionWarning(
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

  private objectNotFoundWarnings(profile: Profile, expectedObjects: CustomObject[]): MetadataProblem[] {
    const objectNamesInProfile = profile.objectPermissions().map((p) => p.objectName);
    const results = expectedObjects.filter((obj) => !objectNamesInProfile.includes(obj.name));
    return results.map((obj) => this.objectNotFoundWarning(profile, obj));
  }

  private objectNotFoundWarning(profile: Profile, customObject: CustomObject): MetadataWarning {
    const message = `<objectPermissions> not found for ${customObject.name}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  private objectPermissionWarnings(profile: Profile): MetadataProblem[] {
    const results: MetadataProblem[] = [];

    for (const objectPermission of profile.objectPermissions()) {
      if (!objectPermission.allowCreate) {
        results.push(this.objectPermissionWarning(profile, objectPermission, 'allowCreate'));
      }
      if (!objectPermission.allowDelete) {
        results.push(this.objectPermissionWarning(profile, objectPermission, 'allowDelete'));
      }
      if (!objectPermission.allowEdit) {
        results.push(this.objectPermissionWarning(profile, objectPermission, 'allowEdit'));
      }
      if (!objectPermission.allowRead) {
        results.push(this.objectPermissionWarning(profile, objectPermission, 'allowRead'));
      }
      if (!objectPermission.modifyAllRecords) {
        results.push(this.objectPermissionWarning(profile, objectPermission, 'modifyAllRecords'));
      }
      if (!objectPermission.viewAllRecords) {
        results.push(this.objectPermissionWarning(profile, objectPermission, 'viewAllRecords'));
      }
    }

    return results;
  }

  private objectPermissionWarning(
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
