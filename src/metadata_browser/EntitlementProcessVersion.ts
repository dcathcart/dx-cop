import { getNumber, getString, getJsonMap, JsonMap } from '@salesforce/ts-types';
import { ComponentBase } from './ComponentBase';

export class EntitlementProcessVersion extends ComponentBase {
  protected readonly fileExtension = 'entitlementProcess';

  public get versionName(): string {
    return getString(this.rootNode, 'name');
  }

  public get versionNumber(): number {
    return getNumber(this.rootNode, 'versionNumber');
  }

  private get rootNode(): JsonMap {
    return getJsonMap(this.metadata, 'EntitlementProcess');
  }
}
