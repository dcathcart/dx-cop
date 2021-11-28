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
  private baseDir: string;
  private xmlParser: XMLParser;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.xmlParser = new XMLParser();
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

    return dodgyValues.map((value) => errorMessage(objectName, recordTypeName, picklistName, value));
  }

  public picklistValuesFromObject(picklistName: string, objectName: string): string[] {
    const picklistFileName: string = this.fieldFileName(objectName, picklistName);
    const file: Buffer = fs.readFileSync(picklistFileName);

    const parsedXml: any = this.xmlParser.parse(file);
    const valueSet: any = parsedXml.CustomField.valueSet.valueSetDefinition;

    const values: string[] = toArray(valueSet.value).map((v) => unescape(v.fullName));
    return values;
  }

  public picklistValuesInRecordType(picklistName: string, objectName: string, recordTypeName: string): string[] {
    const recordTypeFileName: string = this.recordTypeFileName(objectName, recordTypeName);
    const file: Buffer = fs.readFileSync(recordTypeFileName);

    const parsedXml: any = this.xmlParser.parse(file);
    const picklistValues: any = parsedXml.RecordType.picklistValues.filter((v) => v.picklist == picklistName)[0];

    const values: string[] = toArray(picklistValues.values).map((v) => unescape(v.fullName));
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
    const recordType: any = this.parseRecordType(objectName, recordTypeName);
    const picklists: string[] = recordType.RecordType.picklistValues.map((pv) => pv.picklist);
    return picklists;
  }

  public parseRecordType(objectName: string, recordTypeName: string): any {
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
