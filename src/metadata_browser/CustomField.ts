import { getBoolean, getString } from '@salesforce/ts-types';
import { ObjectSubComponent } from './MetadataComponent';

// Basic CustomField class
export class CustomField extends ObjectSubComponent {
  protected readonly fileExtension = 'field';
  protected readonly metadataType = 'CustomField';

  // Deliberately don't call this 'type'
  // Want to keep a clear distinction between the data type of the field and the metadata type of the object
  public get dataType(): string {
    return getString(this.metadata, 'type');
  }

  public get required(): boolean {
    return getBoolean(this.metadata, 'required');
  }

  public isCustom(): boolean {
    return this.name.endsWith('__c');
  }

  public isMasterDetail(): boolean {
    return this.dataType === 'MasterDetail';
  }

  public isPicklist(): boolean {
    return ['Picklist', 'MultiselectPicklist'].includes(this.dataType);
  }

  public objectFieldName(): string {
    return `${this.objectName}.${this.name}`;
  }
}
