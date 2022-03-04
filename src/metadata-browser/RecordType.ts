import { hasJsonArray, getJsonArray, getJsonMap, getString, JsonArray, JsonMap } from '@salesforce/ts-types';
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

    if (!hasJsonArray(recordTypeElement, 'picklistValues')) {
      return [];
    }

    const picklistValuesArray: JsonArray = getJsonArray(recordTypeElement, 'picklistValues');
    const picklists: string[] = picklistValuesArray.map((p) => getString(p, 'picklist'));
    return picklists;
  }
}
