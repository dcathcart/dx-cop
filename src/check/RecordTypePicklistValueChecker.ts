import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser/src/fxp';

function errorMessage(objectName: string, recordTypeName: string, picklistName: string, picklistValue: string): string {
  return `Invalid value '${picklistValue}' found for picklist ${picklistName} in ${objectName}.${recordTypeName} record type`;
}

export class RecordTypePicklistValueChecker {
  private baseDir: string;
  private xmlParser: XMLParser;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.xmlParser = new XMLParser();
  }

  public checkPicklistValuesInRecordType(picklistName: string, objectName: string, recordTypeName: string): string[] {
    const valuesFromObject: string[] = this.picklistValuesFromObject(picklistName, objectName);
    const valuesInRecordType: string[] = this.picklistValuesInRecordType(picklistName, objectName, recordTypeName);

    const dodgyValues: string[] = valuesInRecordType.filter((v) => !valuesFromObject.includes(v));

    return dodgyValues.map((value) => errorMessage(objectName, recordTypeName, picklistName, value));
  }

  public picklistValuesFromObject(picklistName: string, objectName: string): string[] {
    const picklistFileName: string = this.fieldFileName(objectName, picklistName);
    const file: Buffer = fs.readFileSync(picklistFileName);

    const parsedXml: any = this.xmlParser.parse(file);
    const valueSet: any = parsedXml.CustomField.valueSet.valueSetDefinition
    const values: string[] = valueSet.value.map((v) => unescape(v.fullName));

    return values;
  }

  public picklistValuesInRecordType(picklistName: string, objectName: string, recordTypeName: string): string[] {
    const recordTypeFileName: string = this.recordTypeFileName(objectName, recordTypeName);
    const file: Buffer = fs.readFileSync(recordTypeFileName);

    const parsedXml: any = this.xmlParser.parse(file);
    const picklistValues: any = parsedXml.RecordType.picklistValues.filter((v) => v.picklist == picklistName)[0];
    const values: string[] = picklistValues.values.map((v) => unescape(v.fullName));

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
}
