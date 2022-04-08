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
import { CustomField } from './CustomField';

// Class that represents a CustomField of Picklist type
export class PicklistField extends CustomField {
  public usesStandardValueSet(): boolean {
    const hasValueSet: boolean = hasJsonMap(this.metadata, 'valueSet');
    // if there is no <valueSet> element, assume the field uses a standard value set
    return !hasValueSet;
  }

  public usesGlobalValueSet(): boolean {
    // global value sets have a <valueSet> that contains a <valueSetName>
    if (hasJsonMap(this.metadata, 'valueSet')) {
      const valueSet: JsonMap = getJsonMap(this.metadata, 'valueSet');
      return hasString(valueSet, 'valueSetName');
    } else {
      return false;
    }
  }

  // List of *active* picklist values for this field
  public activeValues(): string[] {
    const isActiveFunction = (valueMap: AnyJson): boolean => getBoolean(valueMap, 'isActive') !== false;
    return this.filterValues(isActiveFunction);
  }

  // Extracts picklist values from the field's XML. Filters results using the supplied filter function.
  // Returns API Names only; we don't care about the labels. Converts this:
  // ...
  // <CustomField>
  //   <fullName>Account_Status__c</fullName>
  //   ...
  //   <valueSet>
  //     <valueSetDefinition>
  //       <sorted>false</sorted>
  //       <value>
  //         <fullName>active</fullName>  <-- pick me!
  //         <default>false</default>
  //         <label>Active</label>
  //       </value>
  //       <value>
  //         <fullName>suspended</fullName>  <-- and me!
  //         ...
  // to an array of strings: [ 'active', 'suspended', ... ]
  private filterValues(filterFunction: (valueMap: AnyJson) => boolean): string[] {
    const valueSet: JsonMap = getJsonMap(this.metadata, 'valueSet');
    const valueSetDefinition: JsonMap = getJsonMap(valueSet, 'valueSetDefinition');

    if (hasJsonArray(valueSetDefinition, 'value')) {
      // multiple <value> elements
      const valueArray: JsonArray = getJsonArray(valueSetDefinition, 'value');
      return valueArray.filter(filterFunction).map((v) => this.extractValue(v));
    } else if (hasJsonMap(valueSetDefinition, 'value')) {
      // single <value> element
      const valueMap: JsonMap = getJsonMap(valueSetDefinition, 'value');
      return filterFunction(valueMap) ? [this.extractValue(valueMap)] : [];
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
