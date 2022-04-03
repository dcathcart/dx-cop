import { getBoolean, getString, getJsonMap, JsonMap } from '@salesforce/ts-types';
import { SubComponentBase } from './ComponentBase';

// Basic CustomField class
export class CustomField extends SubComponentBase {
  protected readonly fileExtension = 'field';

  public get objectFieldName(): string {
    return `${this.objectName}.${this.name}`;
  }

  public get required(): boolean {
    return getBoolean(this.customField, 'required');
  }

  public get type(): string {
    return getString(this.customField, 'type');
  }

  public isCustom(): boolean {
    return this.name.endsWith('__c');
  }

  public isMasterDetail(): boolean {
    return this.type === 'MasterDetail';
  }

  public isPicklist(): boolean {
    return ['Picklist', 'MultiselectPicklist'].includes(this.type);
  }

  private get customField(): JsonMap {
    return getJsonMap(this.metadata, 'CustomField');
  }
}
