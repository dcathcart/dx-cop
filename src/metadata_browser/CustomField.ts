import { getString, getJsonMap, JsonMap } from '@salesforce/ts-types';
import { SubComponentBase } from './ComponentBase';

// Basic CustomField class
export class CustomField extends SubComponentBase {
  protected readonly fileExtension = 'field';

  public get objectFieldName(): string {
    return `${this.objectName}.${this.name}`;
  }

  public get type(): string {
    const customField: JsonMap = getJsonMap(this.metadata, 'CustomField');
    const type: string = getString(customField, 'type');
    return type;
  }

  public isCustom(): boolean {
    return this.name.endsWith('__c');
  }

  public isPicklist(): boolean {
    return ['Picklist', 'MultiselectPicklist'].includes(this.type);
  }
}
