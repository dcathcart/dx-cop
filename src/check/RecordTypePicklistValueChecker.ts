import * as fs from 'fs';
import * as path from 'path';
import { RecordType } from '../metadata_browser/RecordType';
import { PicklistField } from '../metadata_browser/PicklistField';
import { MetadataError, MetadataProblem } from './MetadataProblem';

export class RecordTypePicklistValueChecker {
  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private IGNORE_PICKLISTS = ['ForecastCategoryName'];

  private baseDir: string;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  // Run the record type picklist value checks. Returns an array of warning messages.
  public run(): MetadataProblem[] {
    return this.checkRecordTypesForAllObjects();
  }

  public checkRecordTypesForAllObjects(): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const objectsToCheck = this.listObjects().filter((o) => !this.IGNORE_OBJECTS.includes(o));
    for (const objectName of objectsToCheck) {
      warnings.push(...this.checkAllRecordTypesForObject(objectName));
    }

    return warnings;
  }

  public listObjects(): string[] {
    return fs.readdirSync(this.objectsDir());
  }

  public checkAllRecordTypesForObject(objectName: string): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const recordTypes: string[] = this.recordTypesForObject(objectName);
    for (const recordType of recordTypes) {
      warnings.push(...this.checkAllPicklistValuesInRecordType(objectName, recordType));
    }

    return warnings;
  }

  public recordTypesForObject(objectName: string): string[] {
    const recordTypesDir = this.recordTypesDir(objectName);
    const recordTypes = fs.existsSync(recordTypesDir) ? fs.readdirSync(recordTypesDir) : [];

    return recordTypes.map((rt) => path.basename(rt, '.recordType-meta.xml'));
  }

  public checkAllPicklistValuesInRecordType(objectName: string, recordTypeName: string): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const recordTypeFileName = this.recordTypeFileName(objectName, recordTypeName);
    const recordType = new RecordType(recordTypeFileName);
    const picklistMap = recordType.picklistValues();

    for (const picklistName of picklistMap.keys()) {
      if (this.IGNORE_PICKLISTS.includes(picklistName)) continue;

      warnings.push(
        ...this.checkPicklistValuesInRecordType(objectName, recordTypeName, picklistName, picklistMap.get(picklistName))
      );
    }

    return warnings;
  }

  public checkPicklistValuesInRecordType(
    objectName: string,
    recordTypeName: string,
    picklistName: string,
    valuesInRecordType: string[]
  ): MetadataProblem[] {
    const picklistField = new PicklistField(this.fieldFileName(objectName, picklistName));

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

    return dodgyValues.map((v) => this.metadataError(objectName, recordTypeName, picklistName, v));
  }

  public metadataError(
    objectName: string,
    recordTypeName: string,
    picklistName: string,
    picklistValue: string
  ): MetadataError {
    const componentName = `${objectName}.${recordTypeName}`;
    const fileName = this.recordTypeFileName(objectName, recordTypeName);
    const message = `Invalid value '${picklistValue}' in picklist ${picklistName}`;
    return new MetadataError(componentName, 'RecordType', fileName, message);
  }

  public objectsDir(): string {
    return path.join(this.baseDir, 'objects');
  }

  public objectDir(objectName: string): string {
    return path.join(this.objectsDir(), objectName);
  }

  public fieldsDir(objectName: string): string {
    return path.join(this.objectDir(objectName), 'fields');
  }

  public fieldFileName(objectName: string, fieldName: string): string {
    return path.join(this.fieldsDir(objectName), fieldName + '.field-meta.xml');
  }

  public recordTypesDir(objectName: string): string {
    return path.join(this.objectDir(objectName), 'recordTypes');
  }

  public recordTypeFileName(objectName: string, recordTypeName: string): string {
    return path.join(this.recordTypesDir(objectName), recordTypeName + '.recordType-meta.xml');
  }
}
