import { getString } from '@salesforce/ts-types';
import { MetadataComponent } from './metadataComponent';

// Class that represents a Salesforce Object. "Object" being a thing that stores records, like a database table.
// The naming gets tricky here. There are standard objects which come out of the box, and there are custom objects that you add yourself.
// These latter "custom" objects have a "__c" suffix. However, the metadata type for both standard and custom objects is <CustomObject>.
export class CustomObject extends MetadataComponent {
  protected readonly fileExtension = 'object';
  protected readonly metadataType = 'CustomObject';

  public isCustomMetadataType(): boolean {
    return this.name.endsWith('__mdt');
  }

  public isCustomObject(): boolean {
    // standard objects don't have a suffix, custom objects end with '__c'
    // custom settings also end in '__c' so we need to filter them out here
    return this.name.endsWith('__c') && !this.isCustomSetting();
  }

  public isCustomSetting(): boolean {
    // if the object's metadata has a <customSettingsType> field, then this is a custom settings object.
    return this.customSettingsType !== undefined;
  }

  public isExternalObject(): boolean {
    return this.name.endsWith('__x');
  }

  public isStandardObject(): boolean {
    // assumption: standard Salesforce objects don't have a double-underscore anywhere in their name
    return !this.name.includes('__');
  }

  private get customSettingsType(): string {
    return getString(this.metadata, 'customSettingsType');
  }
}
