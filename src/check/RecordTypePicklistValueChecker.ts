import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser/src/fxp';

function errorMessage(objectName: string, recordTypeName: string, picklistName: string, picklistValue: string): string {
  return `Invalid value '${picklistValue}' found for picklist ${picklistName} in ${objectName}.${recordTypeName} record type`;
}

function toArray(values: any): any[] {
  return values instanceof Array ? values : [values];
}

export class RecordTypePicklistValueChecker {
  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private baseDir: string;
  private xmlParser: XMLParser;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;

    // Don't trim whitespace from values. Added to handle picklist values that end with non-breaking spaces (yes, really)
    this.xmlParser = new XMLParser({ trimValues: false });
  }

  public checkRecordTypesForAllObjects(): string[] {
    const warnings: string[] = [];

    const objectsToCheck = this.listObjects().filter((o) => !this.IGNORE_OBJECTS.includes(o));
    for (const objName of objectsToCheck) {
      console.log(`${objName} object`);
      warnings.push(...this.checkAllRecordTypesForObject(objName));
    }

    return warnings;
  }

  public listObjects(): string[] {
    return fs.readdirSync(this.objectsDir());
  }

  public checkAllRecordTypesForObject(objectName: string): string[] {
    const warnings: string[] = [];

    const recordTypes: string[] = this.recordTypesForObject(objectName);
    for (const recordType of recordTypes) {
      console.log(`- ${recordType} record type`);
      warnings.push(...this.checkAllPicklistValuesInRecordType(objectName, recordType));
    }

    return warnings;
  }

  public recordTypesForObject(objectName: string): string[] {
    const recordTypesDir = this.recordTypesDir(objectName);
    const recordTypes = fs.existsSync(recordTypesDir) ? fs.readdirSync(recordTypesDir) : [];

    return recordTypes.map((rt) => path.basename(rt, '.recordType-meta.xml'));
  }

  public checkAllPicklistValuesInRecordType(objectName: string, recordTypeName: string): string[] {
    const warnings: string[] = [];

    const picklists: string[] = this.picklistsInRecordType(objectName, recordTypeName);
    for (const picklist of picklists) {
      warnings.push(...this.checkPicklistValuesInRecordType(picklist, objectName, recordTypeName));
    }

    return warnings;
  }

  public checkPicklistValuesInRecordType(picklistName: string, objectName: string, recordTypeName: string): string[] {
    // standard value sets not supported for now
    if (!this.hasValueSet(objectName, picklistName)) {
      return [];
    }

    const valuesFromObject: string[] = this.picklistValuesFromObject(picklistName, objectName);
    const valuesInRecordType: string[] = this.picklistValuesInRecordType(picklistName, objectName, recordTypeName);

    // every picklist value referenced in the record type needs to be a valid value from the object's picklist definition
    const dodgyValues: string[] = valuesInRecordType.filter((v) => !valuesFromObject.includes(v));

    return dodgyValues.map((v) => errorMessage(objectName, recordTypeName, picklistName, v));
  }

  public picklistValuesFromObject(picklistName: string, objectName: string): string[] {
    const fieldMetadata: any = this.parseFieldMetadata(objectName, picklistName);
    const valueSet: any = fieldMetadata.CustomField.valueSet.valueSetDefinition;

    const values: string[] = toArray(valueSet.value).map((v) => v.fullName);
    return values;
  }

  public picklistValuesInRecordType(picklistName: string, objectName: string, recordTypeName: string): string[] {
    const recordTypeMetadata: any = this.parseRecordTypeMetadata(objectName, recordTypeName);
    const picklistValuesArray: any = recordTypeMetadata.RecordType.picklistValues;
    if (picklistValuesArray === undefined) {
      return [];
    }
    const picklistValues: any = toArray(picklistValuesArray).filter((v) => v.picklist == picklistName)[0];

    // Important to decodeURIComponent() on <fullName> values, which are represented differently between field & record type definitions.
    // e.g. a ' ' (non-breaking space) is represented as ' ' in field definitions, but '%C2%A0' in record type definitions.
    // decodeURIComponent() makes them consistent for comparison purposes.
    const values: string[] = toArray(picklistValues.values).map((v) => decodeURIComponent(v.fullName));
    return values;
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

  public picklistsInRecordType(objectName: string, recordTypeName: string): string[] {
    const recordType: any = this.parseRecordTypeMetadata(objectName, recordTypeName);
    const picklistValuesArray: any = recordType.RecordType.picklistValues;
    if (picklistValuesArray === undefined) {
      return [];
    }
    const picklists: string[] = toArray(picklistValuesArray).map((pv) => pv.picklist);
    return picklists;
  }

  // TODO: Return an AnyJson
  public parseFieldMetadata(objectName: string, fieldName: string): any {
    const fileName: string = this.fieldFileName(objectName, fieldName);
    const file: Buffer = fs.readFileSync(fileName);
    return this.xmlParser.parse(file);
  }

  // TODO: Return an AnyJson
  public parseRecordTypeMetadata(objectName: string, recordTypeName: string): any {
    const fileName: string = this.recordTypeFileName(objectName, recordTypeName);
    const file: Buffer = fs.readFileSync(fileName);
    return this.xmlParser.parse(file);
  }

  // TODO: rewrite to used parsed XML
  public hasValueSet(objectName: string, fieldName: string): boolean {
    const fieldFileName = this.fieldFileName(objectName, fieldName);
    const fileContents = fs.readFileSync(fieldFileName).toString();
    return fileContents.includes('<valueSet>') && !fileContents.includes('<valueSetName>');
  }
}
