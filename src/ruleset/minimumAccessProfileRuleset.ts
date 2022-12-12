import { Profile, ProfileFieldPermission, ProfileObjectPermission } from '../metadata_browser/profile';
import { MetadataProblem, MetadataWarning } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class MinimumAccessProfileRuleset extends MetadataRuleset {
  public displayName = 'Minimum Access profile';

  public run(): MetadataProblem[] {
    const minAccessProfile = this.sfdxProjectBrowser.profileByName('Minimum Access');
    return this.checkProfile(minAccessProfile);
  }

  private checkProfile(profile: Profile): MetadataProblem[] {
    return this.fieldPermissionWarnings(profile).concat(this.objectPermissionWarnings(profile));
  }

  // Rule 1:
  // In a Minimum Access profile, no <fieldPermission> may be editable or readable
  private fieldPermissionWarnings(profile: Profile): MetadataWarning[] {
    const results: MetadataWarning[] = [];

    for (const fieldPermission of profile.fieldPermissions()) {
      if (fieldPermission.editable) {
        results.push(this.newFieldPermissionWarning(profile, fieldPermission, 'editable'));
      }
      if (fieldPermission.readable) {
        results.push(this.newFieldPermissionWarning(profile, fieldPermission, 'readable'));
      }
    }

    return results;
  }

  private newFieldPermissionWarning(
    profile: Profile,
    fieldPermission: ProfileFieldPermission,
    permissionName: string
  ): MetadataWarning {
    const message = `<${permissionName}> permission should not be true for field ${fieldPermission.objectFieldName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }

  // Rule 2:
  // In a Minimum Access profile, no <objectPermissions> may be true
  private objectPermissionWarnings(profile: Profile): MetadataWarning[] {
    const results: MetadataWarning[] = [];

    for (const objectPermission of profile.objectPermissions()) {
      if (objectPermission.allowCreate) {
        results.push(this.newObjectPermissionWarning(profile, objectPermission, 'allowCreate'));
      }
      if (objectPermission.allowDelete) {
        results.push(this.newObjectPermissionWarning(profile, objectPermission, 'allowDelete'));
      }
      if (objectPermission.allowEdit) {
        results.push(this.newObjectPermissionWarning(profile, objectPermission, 'allowEdit'));
      }
      if (objectPermission.allowRead) {
        results.push(this.newObjectPermissionWarning(profile, objectPermission, 'allowRead'));
      }
      if (objectPermission.modifyAllRecords) {
        results.push(this.newObjectPermissionWarning(profile, objectPermission, 'modifyAllRecords'));
      }
      if (objectPermission.viewAllRecords) {
        results.push(this.newObjectPermissionWarning(profile, objectPermission, 'viewAllRecords'));
      }
    }

    return results;
  }

  private newObjectPermissionWarning(
    profile: Profile,
    objectPermission: ProfileObjectPermission,
    permissionName: string
  ): MetadataWarning {
    const message = `<${permissionName}> permission should not be true for object ${objectPermission.objectName}`;
    return new MetadataWarning(profile.name, 'Profile', profile.fileName, message);
  }
}
