import { PicklistField } from '../metadata_browser/picklistField';
import { RecordType } from '../metadata_browser/recordType';
import { MetadataError, MetadataProblem } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class RecordTypePicklistValueRuleset extends MetadataRuleset {
  public displayName = 'Record type picklist values';

  private IGNORE_OBJECTS = ['PersonAccount'];
  private IGNORE_PICKLISTS = ['ForecastCategoryName'];

  // Run the record type picklist value checks. Returns an array of warning messages.
  public run(): MetadataProblem[] {
    return this.checkRecordTypesForAllObjects();
  }

  // Loop through all custom objects, then through all record types in each object
  private checkRecordTypesForAllObjects(): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];
    for (const objectName of this.objectsToCheck()) {
      const recordTypes = this.sfdxProjectBrowser.recordTypes(objectName);
      const picklistFields = this.sfdxProjectBrowser.picklistFields(objectName);

      // convert the array of PicklistFields to a map; more useful in subsequent methods
      const picklistFieldMap = new Map<string, PicklistField>(
        picklistFields.map((f) => [f.name, new PicklistField(f.fileName)])
      );

      for (const recordType of recordTypes) {
        warnings.push(...this.checkAllPicklistsInRecordType(recordType, picklistFieldMap));
      }
    }
    return warnings;
  }

  private objectsToCheck(): string[] {
    return this.sfdxProjectBrowser.objectNames().filter((o) => !this.IGNORE_OBJECTS.includes(o));
  }

  // Loop through the picklists in a record type
  private checkAllPicklistsInRecordType(
    recordType: RecordType,
    picklistFieldMap: Map<string, PicklistField> // picklist field definitions from object
  ): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];
    const recordTypePicklistMap = recordType.picklistValueMap();

    for (const picklistName of recordTypePicklistMap.keys()) {
      if (this.IGNORE_PICKLISTS.includes(picklistName)) continue;

      // If the record type references a picklist that doesn't exist, or a field that is not a picklist, then ignore it here.
      // It will be picked up as a problem by the RecordTypePicklistRuleset.
      if (!picklistFieldMap.has(picklistName)) continue;

      const picklist = picklistFieldMap.get(picklistName);

      // Don't check picklists that use standard or global value sets (not supported for now)
      if (picklist.usesStandardValueSet() || picklist.usesGlobalValueSet()) continue;

      const valuesInRecordType = recordTypePicklistMap.get(picklistName);
      warnings.push(...this.checkPicklistValues(recordType, valuesInRecordType, picklist));
    }

    return warnings;
  }

  // Check the picklist values in one picklist in a record type
  private checkPicklistValues(
    recordType: RecordType,
    valuesInRecordType: string[],
    picklistField: PicklistField
  ): MetadataProblem[] {
    const lowerCasedValuesFromObject = picklistField.activeValues().map((v) => v.toLowerCase());

    // Every picklist value referenced in the record type needs to be a valid value from the object's picklist definition.
    // Lower-case the values for comparison purposes, to filter out any noise from differences in casing.
    // (Salesforce allows case differences, so we should too)
    const dodgyValues: string[] = valuesInRecordType.filter(
      (v) => !lowerCasedValuesFromObject.includes(v.toLowerCase())
    );

    return dodgyValues.map((v) => this.metadataError(recordType, picklistField.name, v));
  }

  private metadataError(recordType: RecordType, picklistName: string, picklistValue: string): MetadataError {
    const componentName = `${recordType.objectName}.${recordType.name}`;
    const message = `Invalid value '${picklistValue}' in picklist ${picklistName}`;
    return new MetadataError(componentName, 'RecordType', recordType.fileName, message);
  }
}
