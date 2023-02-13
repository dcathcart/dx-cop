import { getBoolean, getString, hasBoolean, Nullable } from '@salesforce/ts-types';
import { MetadataComponent } from './metadataComponent';

export class InstalledPackage extends MetadataComponent {
  protected readonly fileExtension = 'installedPackage';
  protected readonly metadataType = 'InstalledPackage';

  // Gets the value of the <activateRSS> element
  // Returns true/false if there is a value; null if there is no value
  // Returns undefined if the element does not exist, or the value is not a valid boolean
  public get activateRSS(): Nullable<boolean> {
    if (hasBoolean(this.metadata, 'activateRSS')) {
      return getBoolean(this.metadata, 'activateRSS');
    } else if (getString(this.metadata, 'activateRSS') === '') {
      // this happens when <activateRSS xsi:nil="true"/>
      return null;
    } else {
      return undefined;
    }
  }

  // Gets the value of the <securityType> element
  // Returns the value as a string, or an empty string if there is no value
  // Returns undefined if the element does not exist
  public get securityType(): Nullable<string> {
    return getString(this.metadata, 'securityType');
  }
}
