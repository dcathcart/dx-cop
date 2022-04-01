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
import { ComponentBase } from './ComponentBase';

export class EmailToCaseSettings extends ComponentBase {
  protected fileExtension = 'settings';

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
    return getJsonMap(this.roolElement, 'emailToCase');
  }

  private get roolElement(): JsonMap {
    return getJsonMap(this.metadata, 'CaseSettings');
  }
}

export class EmailToCaseRoutingAddress {
  private readonly source: AnyJson;

  public constructor(source: AnyJson) {
    this.source = source;
  }

  public get emailServicesAddress(): string {
    return getString(this.source, 'emailServicesAddress');
  }

  public get isVerified(): boolean {
    return getBoolean(this.source, 'isVerified');
  }

  public get routingName(): string {
    return getString(this.source, 'routingName');
  }
}
