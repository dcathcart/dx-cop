import { AnyJson, getBoolean, getJsonArray, getJsonMap, getString } from '@salesforce/ts-types';
import { ComponentBase } from './ComponentBase';

export class Profile extends ComponentBase {
  protected readonly fileExtension = 'profile';

  public fieldPermissions(): ProfileFieldPermission[] {
    const topLevelNode = getJsonMap(this.metadata, 'Profile');
    const fieldPermissionArray = getJsonArray(topLevelNode, 'fieldPermissions');
    return fieldPermissionArray.map((p) => new ProfileFieldPermission(p));
  }

  public objectPermissions(): ProfileObjectPermission[] {
    const topLevelNode = getJsonMap(this.metadata, 'Profile');
    const objectPermissionArray = getJsonArray(topLevelNode, 'objectPermissions');
    return objectPermissionArray.map((p) => new ProfileObjectPermission(p));
  }
}

// Snippet of the profile's XML-converted-to-JSON that represents a field permission:
// <fieldPermissions>
//   <editable>false</editable>
//   <field>Account.AccountNumber</field>
//   <readable>true</readable>
// </fieldPermissions>
export class ProfileFieldPermission {
  private readonly source: AnyJson;

  public constructor(source: AnyJson) {
    this.source = source;
  }

  public get editable(): boolean {
    return getBoolean(this.source, 'editable');
  }

  public get fieldName(): string {
    return this.objectFieldName.split('.')[1];
  }

  public get objectFieldName(): string {
    return getString(this.source, 'field');
  }

  public get objectName(): string {
    return this.objectFieldName.split('.')[0];
  }

  public get readable(): boolean {
    return getBoolean(this.source, 'readable');
  }
}

// Snippet of the profile's XML-converted-to-JSON that represents the permissions for an object:
// <objectPermissions>
//   <allowCreate>true</allowCreate>
//   <allowDelete>true</allowDelete>
//   <allowEdit>true</allowEdit>
//   <allowRead>true</allowRead>
//   <modifyAllRecords>true</modifyAllRecords>
//   <object>Account</object>
//   <viewAllRecords>true</viewAllRecords>
// </objectPermissions>
export class ProfileObjectPermission {
  private readonly source: AnyJson;

  public constructor(source: AnyJson) {
    this.source = source;
  }

  public get allowCreate(): boolean {
    return getBoolean(this.source, 'allowCreate');
  }

  public get allowDelete(): boolean {
    return getBoolean(this.source, 'allowDelete');
  }

  public get allowEdit(): boolean {
    return getBoolean(this.source, 'allowDelete');
  }

  public get allowRead(): boolean {
    return getBoolean(this.source, 'allowRead');
  }

  public get modifyAllRecords(): boolean {
    return getBoolean(this.source, 'modifyAllRecords');
  }

  public get objectName(): string {
    return getString(this.source, 'object');
  }

  public get viewAllRecords(): boolean {
    return getBoolean(this.source, 'viewAllRecords');
  }
}
