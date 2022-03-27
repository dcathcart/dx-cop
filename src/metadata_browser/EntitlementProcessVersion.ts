import { getNumber, getString, getJsonMap, JsonMap } from '@salesforce/ts-types';
import { ComponentBase } from './ComponentBase';

// Represents a specific version of an Entitlement Process
// https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_entitlementprocess.htm
export class EntitlementProcessVersion extends ComponentBase {
  protected readonly fileExtension = 'entitlementProcess';

  // Identifies the sequence of versions to which this entitlement process belongs.
  // This field's contents can be any value as long as it is identical among all versions of the entitlement process.
  public get versionMaster(): string {
    return getString(this.rootNode, 'versionMaster');
  }

  // The name of the entitlement process as it displays in the user interface.
  public get versionName(): string {
    return getString(this.rootNode, 'name');
  }

  // The version number of the entitlement process. Must be 1 or greater.
  public get versionNumber(): number {
    return getNumber(this.rootNode, 'versionNumber');
  }

  private get rootNode(): JsonMap {
    return getJsonMap(this.metadata, 'EntitlementProcess');
  }
}
