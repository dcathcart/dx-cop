import { PicklistField } from '../metadata_browser/PicklistField';
import { RecordType } from '../metadata_browser/RecordType';
import { SfdxProjectBrowser } from '../metadata_browser/SfdxProjectBrowser';
import { MetadataError, MetadataProblem } from './MetadataProblem';

export class RecordTypePicklistValueChecker {
  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private IGNORE_PICKLISTS = ['Name', 'ForecastCategoryName'];

  private sfdxProjectBrowser: SfdxProjectBrowser;

  public constructor(sfdxProjectBrowser: SfdxProjectBrowser) {
    this.sfdxProjectBrowser = sfdxProjectBrowser;
  }

  // Run the record type picklist value checks. Returns an array of warning messages.
  public run(): MetadataProblem[] {
    return this.checkRecordTypesForAllObjects();
  }

  // Loop through all custom objects, checking record types in each one
  private checkRecordTypesForAllObjects(): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];
    for (const objectName of this.objectsToCheck()) {
      warnings.push(...this.checkAllRecordTypesForObject(objectName));
    }
    return warnings;
  }

  private objectsToCheck(): string[] {
    return this.sfdxProjectBrowser.objectNames().filter((o) => !this.IGNORE_OBJECTS.includes(o));
  }

  // Loop through the record types in a single custom object
  private checkAllRecordTypesForObject(objectName: string): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const recordTypes = this.sfdxProjectBrowser.recordTypes(objectName);
    const picklistFieldMap = this.sfdxProjectBrowser.picklistFieldMap(objectName);
    for (const recordType of recordTypes) {
      warnings.push(...this.checkAllPicklistsInRecordType(recordType, picklistFieldMap));
    }

    return warnings;
  }

  // Loop through the picklists in a record type
  private checkAllPicklistsInRecordType(
    recordType: RecordType,
    picklistFieldMap: Map<string, PicklistField>
  ): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const recordTypePicklistMap = recordType.picklistValues();
    for (const picklistName of recordTypePicklistMap.keys()) {
      if (this.IGNORE_PICKLISTS.includes(picklistName)) continue;

      warnings.push(
        ...this.checkPicklistValues(
          recordType,
          picklistName,
          picklistFieldMap.get(picklistName),
          recordTypePicklistMap.get(picklistName)
        )
      );
    }

    return warnings;
  }

  private checkPicklistValues(
    recordType: RecordType,
    picklistName: string,
    picklistField: PicklistField,
    valuesInRecordType: string[]
  ): MetadataProblem[] {
    // standard value sets / global value sets not supported for now
    if (picklistField.usesStandardValueSet() || picklistField.usesGlobalValueSet()) {
      return [];
    }

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
