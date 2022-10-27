import { getBoolean, getString, hasString } from '@salesforce/ts-types';
import { ObjectSubComponent } from './metadataComponent';

// Basic CustomField class
export class CustomField extends ObjectSubComponent {
  protected readonly fileExtension = 'field';
  protected readonly metadataType = 'CustomField';

  // Deliberately don't call this 'type'
  // Want to keep a clear distinction between the data type of the field and the metadata type of the object
  public get dataType(): string {
    return getString(this.metadata, 'type');
  }

  public isCustom(): boolean {
    return this.name.endsWith('__c');
  }

  public isFormula(): boolean {
    return hasString(this.metadata, 'formula');
  }

  public isPicklist(): boolean {
    return ['Picklist', 'MultiselectPicklist'].includes(this.dataType);
  }

  public isRequired(): boolean {
    // Master-Detail fields are required fields.
    // Master-Detail relationships are like foreign key relationships, but "stronger", in that detail records can't exist on their own without a master record.
    // So the field that links a detail record back to a master record is implicitly a required field.
    return this.required || this.dataType === 'MasterDetail';
  }

  public objectFieldName(): string {
    return `${this.objectName}.${this.name}`;
  }

  private get required(): boolean {
    return getBoolean(this.metadata, 'required');
  }
}
