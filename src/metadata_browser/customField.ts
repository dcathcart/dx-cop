import { getString } from '@salesforce/ts-types';
import { ObjectSubComponent } from './metadataComponent';

// Basic CustomField class
export class CustomField extends ObjectSubComponent {
  protected readonly fileExtension = 'field';
  protected readonly metadataType = 'CustomField';

  public get dataType(): string {
    return getString(this.metadata, 'type');
  }

  public isPicklist(): boolean {
    return ['Picklist', 'MultiselectPicklist'].includes(this.dataType);
  }
}
