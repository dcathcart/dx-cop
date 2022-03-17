import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser/src/fxp';
import { decode } from 'html-entities';
import { RecordType } from '../metadata_browser/RecordType';
import { MetadataError, MetadataProblem } from './MetadataProblem';

function toArray(values: any): any[] {
  return values instanceof Array ? values : [values];
}

export class RecordTypePicklistValueChecker {
  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private IGNORE_PICKLISTS = ['ForecastCategoryName'];

  private baseDir: string;
  private metadataCache: Map<string, any>;
  private xmlParser: XMLParser;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.metadataCache = new Map();

    // Don't trim whitespace from values. Added to handle picklist values that end with non-breaking spaces (yes, really)
    this.xmlParser = new XMLParser({ trimValues: false });
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
    // standard value sets not supported for now
    if (!this.hasValueSet(objectName, picklistName)) {
      return [];
    }

    const valuesFromObject = this.picklistValuesFromObject(picklistName, objectName);
    const lowerCasedValuesFromObject = valuesFromObject.map((v) => v.toLowerCase());

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

  public picklistValuesFromObject(picklistName: string, objectName: string): string[] {
    const fieldMetadata: any = this.parseFieldMetadata(objectName, picklistName);
    const valueSet: any = fieldMetadata.CustomField.valueSet.valueSetDefinition;

    const activeValues: any = toArray(valueSet.value).filter((v) => v.isActive !== false);
    const values: string[] = activeValues.map((v) => this.decodeObjectPicklistValue(v.fullName.toString()));
    return values;
  }

  public decodeObjectPicklistValue(value: string): string {
    // HTML decode <fullName> values because that's how Salesforce encodes them in picklist field definitions.
    // e.g. '&' is stored as '&amp;'. Note this is different from how they are encoded in record types.
    return decode(value);
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

  // TODO: Return an AnyJson
  public parseFieldMetadata(objectName: string, fieldName: string): any {
    return this.parseMetadataFile(this.fieldFileName(objectName, fieldName));
  }

  // TODO: Return an AnyJson
  public parseRecordTypeMetadata(objectName: string, recordTypeName: string): any {
    return this.parseMetadataFile(this.recordTypeFileName(objectName, recordTypeName));
  }

  public parseMetadataFile(fileName: string): any {
    if (this.metadataCache.has(fileName)) {
      return this.metadataCache.get(fileName);
    } else {
      const file: Buffer = fs.readFileSync(fileName);
      const parsedMetadata = this.xmlParser.parse(file);
      this.metadataCache.set(fileName, parsedMetadata);
      return parsedMetadata;
    }
  }

  // TODO: rewrite to used parsed XML
  public hasValueSet(objectName: string, fieldName: string): boolean {
    const fieldFileName = this.fieldFileName(objectName, fieldName);
    const fileContents = fs.readFileSync(fieldFileName).toString();
    return fileContents.includes('<valueSet>') && !fileContents.includes('<valueSetName>');
  }
}
