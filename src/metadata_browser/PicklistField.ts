import {
  AnyJson,
  get,
  getBoolean,
  getJsonArray,
  getJsonMap,
  hasJsonArray,
  hasJsonMap,
  hasString,
  JsonArray,
  JsonMap,
} from '@salesforce/ts-types';
import { decode } from 'html-entities';
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
  public activeValues(): string[] {
    const customFieldElement: JsonMap = getJsonMap(this.metadata(), 'CustomField');
    const valueSet: JsonMap = getJsonMap(customFieldElement, 'valueSet');
    const valueSetDefinition: JsonMap = getJsonMap(valueSet, 'valueSetDefinition');

    if (hasJsonArray(valueSetDefinition, 'value')) {
      // multiple <value> elements
      const valueArray: JsonArray = getJsonArray(valueSetDefinition, 'value');
      return valueArray.filter((v) => getBoolean(v, 'isActive') !== false).map((v) => this.extractValue(v));
    } else if (hasJsonMap(valueSetDefinition, 'value')) {
      // single <value> element
      const valueMap: JsonMap = getJsonMap(valueSetDefinition, 'value');
      if (getBoolean(valueMap, 'isActive') === false) {
        return [];
      } else {
        const value: string = this.extractValue(valueMap);
        return [value];
      }
    } else {
      // no <value> elements
      return [];
    }
  }

  // Converts the actual picklist value from a picklist value element, i.e. this:
  // ...
  // <value>
  //   <fullName>abc</fullName>
  //   <default>false</default>
  //   <label>ABC</label>
  // </value>
  // ...
  // to this: 'abc'
  // Also decodes special characters into the representation users would see in Salesforce.
  private extractValue(valueMap: AnyJson): string {
    // Use get() deliberately here instead of getString(), which returns undefined if the value is a number.
    // We always want to treat picklist values as strings, hence the .toString()
    // Related: XML parser has specific config to preserve leading zeros. See MetadataComponent.ts
    const value = get(valueMap, 'fullName').toString();

    // HTML decode <fullName> values because that's how Salesforce encodes them in picklist field definitions.
    // e.g. '&' is stored as '&amp;'. Note this is different from how they are encoded in record types.
    return decode(value);
  }
}
