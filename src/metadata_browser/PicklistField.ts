import {
  getJsonArray,
  getJsonMap,
  getString,
  hasJsonArray,
  hasJsonMap,
  hasString,
  JsonArray,
  JsonMap,
} from '@salesforce/ts-types';
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

  // Extract a list of picklist values from the field's XML. API Names only; we don't care about the labels.
  // Convert this:
  // ...
  // <CustomField>
  //   <fullName>Account_Status__c</fullName>
  //   ...
  //   <valueSet>
  //     <valueSetDefinition>
  //       <sorted>false</sorted>
  //       <value>
  //         <fullName>active</fullName>  <-- this
  //         <default>false</default>
  //         <label>Active</label>
  //       </value>
  //       <value>
  //         <fullName>suspended</fullName>  <-- and this
  //         ...
  // to an array of strings: [ 'active', 'suspended', ... ]
  public values(): string[] {
    const customFieldElement: JsonMap = getJsonMap(this.metadata(), 'CustomField');
    const valueSet: JsonMap = getJsonMap(customFieldElement, 'valueSet');
    const valueSetDefinition: JsonMap = getJsonMap(valueSet, 'valueSetDefinition');

    if (hasJsonArray(valueSetDefinition, 'value')) {
      // multiple <value> elements
      const valueArray: JsonArray = getJsonArray(valueSetDefinition, 'value');
      return valueArray.map((v) => getString(v, 'fullName'));
    } else if (hasJsonMap(valueSetDefinition, 'value')) {
      // single <value> element
      const valueMap: JsonMap = getJsonMap(valueSetDefinition, 'value');
      const value: string = getString(valueMap, 'fullName');
      return [value];
    } else {
      // no <value> elements
      return [];
    }
  }
}
