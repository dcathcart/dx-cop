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
    const fieldwarnings = profile
      .fieldPermissions()
      .map((fp) => this.fieldPermissionWarnings(fp))
      .flat();

    const objectWarnings = profile
      .objectPermissions()
      .map((op) => this.objectPermissionWarnings(op))
      .flat();

    return fieldwarnings.concat(objectWarnings);
  }

  // Rule 1:
  // In a Minimum Access profile, no <fieldPermission> may be editable or readable
  private fieldPermissionWarnings(fieldPermission: ProfileFieldPermission): MetadataWarning[] {
    const results: MetadataWarning[] = [];

    if (fieldPermission.editable) {
      results.push(this.newFieldPermissionWarning(fieldPermission, 'editable'));
    }

    if (fieldPermission.readable) {
      results.push(this.newFieldPermissionWarning(fieldPermission, 'readable'));
    }

    return results;
  }

  private newFieldPermissionWarning(fieldPermission: ProfileFieldPermission, permissionName: string): MetadataWarning {
    const message = `<${permissionName}> permission should not be true for ${fieldPermission.objectFieldName} field`;
    return new MetadataWarning(fieldPermission.profile.name, 'Profile', fieldPermission.profile.fileName, message);
  }

  // Rule 2:
  // In a Minimum Access profile, no <objectPermissions> may be true
  private objectPermissionWarnings(objectPermission: ProfileObjectPermission): MetadataWarning[] {
    const results: MetadataWarning[] = [];

    if (objectPermission.allowCreate) {
      results.push(this.newObjectPermissionWarning(objectPermission, 'allowCreate'));
    }
    if (objectPermission.allowDelete) {
      results.push(this.newObjectPermissionWarning(objectPermission, 'allowDelete'));
    }
    if (objectPermission.allowEdit) {
      results.push(this.newObjectPermissionWarning(objectPermission, 'allowEdit'));
    }
    if (objectPermission.allowRead) {
      results.push(this.newObjectPermissionWarning(objectPermission, 'allowRead'));
    }
    if (objectPermission.modifyAllRecords) {
      results.push(this.newObjectPermissionWarning(objectPermission, 'modifyAllRecords'));
    }
    if (objectPermission.viewAllRecords) {
      results.push(this.newObjectPermissionWarning(objectPermission, 'viewAllRecords'));
    }

    return results;
  }

  private newObjectPermissionWarning(
    objectPermission: ProfileObjectPermission,
    permissionName: string
  ): MetadataWarning {
    const message = `<${permissionName}> permission should not be true for ${objectPermission.objectName} object`;
    return new MetadataWarning(objectPermission.profile.name, 'Profile', objectPermission.profile.fileName, message);
  }
}
