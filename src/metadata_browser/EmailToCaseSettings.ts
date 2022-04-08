import {
  AnyJson,
  JsonMap,
  getBoolean,
  getJsonArray,
  getJsonMap,
  getString,
  hasJsonArray,
  hasJsonMap,
} from '@salesforce/ts-types';
import { MetadataComponent } from './MetadataComponent';

export class EmailToCaseSettings extends MetadataComponent {
  protected fileExtension = 'settings';
  protected metadataType = 'CaseSettings';

  public routingAddresses(): EmailToCaseRoutingAddress[] {
    if (hasJsonArray(this.emailToCaseSettings, 'routingAddresses')) {
      const routingAddressArray = getJsonArray(this.emailToCaseSettings, 'routingAddresses');
      return routingAddressArray.map((r) => new EmailToCaseRoutingAddress(r));
    } else if (hasJsonMap(this.emailToCaseSettings, 'routingAddresses')) {
      const routingAddressMap = getJsonMap(this.emailToCaseSettings, 'routingAddresses');
      const routingAddress = new EmailToCaseRoutingAddress(routingAddressMap);
      return [routingAddress];
    } else {
      return [];
    }
  }

  private get emailToCaseSettings(): JsonMap {
    return getJsonMap(this.metadata, 'emailToCase');
  }
}

export class EmailToCaseRoutingAddress {
  private readonly json: AnyJson;

  public constructor(json: AnyJson) {
    this.json = json;
  }

  public get emailServicesAddress(): string {
    return getString(this.json, 'emailServicesAddress');
  }

  public get isVerified(): boolean {
    return getBoolean(this.json, 'isVerified');
  }

  public get routingName(): string {
    return getString(this.json, 'routingName');
  }
}
