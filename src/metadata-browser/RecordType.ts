import {
  AnyJson,
  getJsonArray,
  getJsonMap,
  getString,
  hasJsonArray,
  hasJsonMap,
  JsonArray,
  JsonMap,
} from '@salesforce/ts-types';
import { MetadataComponent } from './MetadataComponent';

export class RecordType extends MetadataComponent {
  // Extract a list of picklist names from the RecordType XML, e.g.
  // <RecordType>
  //   ...
  //   <picklistValues>
  //     <picklist>AccountSource</picklist> <-- this
  //     ...
  //   </picklistValues>
  //     <picklist>Account_Status__c</picklist> <-- and this
  //     ...
  public picklistFieldNames(): string[] {
    const recordTypeElement: JsonMap = getJsonMap(this.metadata(), 'RecordType');

    if (hasJsonArray(recordTypeElement, 'picklistValues')) {
      // multiple <picklistValues> elements
      const picklistValuesArray: JsonArray = getJsonArray(recordTypeElement, 'picklistValues');
      return picklistValuesArray.map((p) => getString(p, 'picklist'));
    } else if (hasJsonMap(recordTypeElement, 'picklistValues')) {
      // single <picklistValues> element
      const picklistValuesMap: JsonMap = getJsonMap(recordTypeElement, 'picklistValues');
      const picklist: string = getString(picklistValuesMap, 'picklist');
      return [picklist];
    } else {
      // no <picklistValues> elements
      return [];
    }
  }

  // Extract a list of picklist names and values from the RecordType XML, i.e. convert this:
  // <RecordType>
  //   ...
  //   <picklistValues>
  //     <picklist>Country__c</picklist>
  //     <values>
  //       <fullName>Australia</fullName>
  //       <default>false</default>
  //     </values>
  //   </picklistValues>
  //   <picklistValues>
  //     <picklist>Status__c</picklist>
  //     <values>
  //       <fullName>Active</fullName>
  //       <default>false</default>
  //     </values>
  //     <values>
  //       <fullName>Inactive</fullName>
  //       <default>false</default>
  //     </values>
  //   </picklistValues>
  //   ...
  // to a Map that looks like this:
  // {
  //   'Country__c' => [ 'Australia' ],
  //   'Status__c' => [ 'Active', 'Inactive' ]
  // }
  public picklistValues(): Map<string, string[]> {
    const recordTypeElement: JsonMap = getJsonMap(this.metadata(), 'RecordType');

    if (hasJsonArray(recordTypeElement, 'picklistValues')) {
      // multiple <picklistValues> elements
      const picklistValuesArray: JsonArray = getJsonArray(recordTypeElement, 'picklistValues');
      return new Map<string, string[]>(
        picklistValuesArray.map((pv) => [getString(pv, 'picklist'), this.extractPicklistValues(pv)])
      );
    } else if (hasJsonMap(recordTypeElement, 'picklistValues')) {
      // single <picklistValues> element
      const picklistValueMap: JsonMap = getJsonMap(recordTypeElement, 'picklistValues');
      const picklist: string = getString(picklistValueMap, 'picklist');
      const values: string[] = this.extractPicklistValues(picklistValueMap);
      return new Map<string, string[]>([[picklist, values]]);
    } else {
      // no <picklistValues> elements
      return new Map<string, string[]>();
    }
  }

  // Extract a list of picklist values for a field
  // i.e. convert the Json representation of this:
  // ...
  // <picklistValues>
  //   <picklist>Status__c</picklist>
  //   <values>
  //     <fullName>Draft</fullName>
  //     <default>false</default>
  //   </values>
  //   <values>
  //     <fullName>Active</fullName>
  //     <default>false</default>
  //   </values>
  // </picklistValues>
  // ...
  // to this: ['Draft', 'Active']
  private extractPicklistValues(picklistValuesElement: AnyJson): string[] {
    if (hasJsonArray(picklistValuesElement, 'values')) {
      // multiple <values> elements
      const valuesArray: JsonArray = getJsonArray(picklistValuesElement, 'values');
      return valuesArray.map((v) => getString(v, 'fullName'));
    } else if (hasJsonMap(picklistValuesElement, 'values')) {
      // single <values> element
      const valueMap: JsonMap = getJsonMap(picklistValuesElement, 'values');
      const value: string = getString(valueMap, 'fullName');
      return [value];
    } else {
      // no <values> elements
      return [];
    }
  }
}
