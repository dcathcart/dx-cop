import { getBoolean, getString, getJsonMap, JsonMap } from '@salesforce/ts-types';
import { ObjectSubComponent } from './MetadataComponent';

// Basic CustomField class
export class CustomField extends ObjectSubComponent {
  protected readonly fileExtension = 'field';
  protected readonly metadataType = 'CustomField';

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

  public get dataType(): string {
    return getString(this.metadata, 'type');
  }

  public isPicklist(): boolean {
    return ['Picklist', 'MultiselectPicklist'].includes(this.dataType);
  }

  private get customField(): JsonMap {
    return getJsonMap(this.metadata, 'CustomField');
  }
}
