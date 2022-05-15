import { AnyJson, getBoolean, getJsonArray, getString } from '@salesforce/ts-types';
import { MetadataComponent } from './metadataComponent';

export class Profile extends MetadataComponent {
  protected readonly fileExtension = 'profile';
  protected readonly metadataType = 'Profile';

  public fieldPermissions(): ProfileFieldPermission[] {
    const permissions = getJsonArray(this.metadata, 'fieldPermissions');
    return permissions.map((p) => new ProfileFieldPermission(p));
  }

  public objectPermissions(): ProfileObjectPermission[] {
    const permissions = getJsonArray(this.metadata, 'objectPermissions');
    return permissions.map((p) => new ProfileObjectPermission(p));
  }
}

// Snippet of the profile's XML-converted-to-JSON that represents a field permission:
// <fieldPermissions>
//   <editable>false</editable>
//   <field>Account.AccountNumber</field>
//   <readable>true</readable>
// </fieldPermissions>
// --> converted to JSON this would look like { editable: false, field: 'Account.AccountNumber', readable: true }
export class ProfileFieldPermission {
  private readonly json: AnyJson;

  public constructor(json: AnyJson) {
    this.json = json;
  }

  public get editable(): boolean {
    return getBoolean(this.json, 'editable');
  }

  public get objectFieldName(): string {
    return getString(this.json, 'field');
  }

  public get readable(): boolean {
    return getBoolean(this.json, 'readable');
  }

  public fieldName(): string {
    return this.objectFieldName.split('.')[1];
  }

  public objectName(): string {
    return this.objectFieldName.split('.')[0];
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
// --> converted to JSON this would look like { allowCreate: true, allowDelete: true, ... }
export class ProfileObjectPermission {
  private readonly json: AnyJson;

  public constructor(json: AnyJson) {
    this.json = json;
  }

  public get allowCreate(): boolean {
    return getBoolean(this.json, 'allowCreate');
  }

  public get allowDelete(): boolean {
    return getBoolean(this.json, 'allowDelete');
  }

  public get allowEdit(): boolean {
    return getBoolean(this.json, 'allowEdit');
  }

  public get allowRead(): boolean {
    return getBoolean(this.json, 'allowRead');
  }

  public get modifyAllRecords(): boolean {
    return getBoolean(this.json, 'modifyAllRecords');
  }

  public get objectName(): string {
    return getString(this.json, 'object');
  }

  public get viewAllRecords(): boolean {
    return getBoolean(this.json, 'viewAllRecords');
  }
}
