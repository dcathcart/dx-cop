import { getJsonMap, hasJsonMap, hasString, JsonMap } from '@salesforce/ts-types';
import { MetadataComponent } from './MetadataComponent';

// Class that represents a CustomField of Picklsit type
export class PicklistField extends MetadataComponent {
  public usesStandardValueSet(): boolean {
    const customFieldElement: JsonMap = getJsonMap(this.metadata(), 'CustomField');
    const hasValueSet: boolean = hasJsonMap(customFieldElement, 'valueSet');
    // if there is no <valueSet> element, assume the field uses a standard value set
    return !hasValueSet;
  }

  public usesGlobalValueSet(): boolean {
    const customFieldElement: JsonMap = getJsonMap(this.metadata(), 'CustomField');
    // global value sets have a <valueSet> that contains a <valueSetName>
    if (hasJsonMap(customFieldElement, 'valueSet')) {
      const valueSet: JsonMap = getJsonMap(customFieldElement, 'valueSet');
      return hasString(valueSet, 'valueSetName');
    } else {
      return false;
    }
  }
}
