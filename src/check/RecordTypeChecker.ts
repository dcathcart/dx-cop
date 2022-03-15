import * as fs from 'fs';
import * as path from 'path';
import { RecordType } from '../metadata-browser/RecordType';
import { MetadataError, MetadataProblem, MetadataWarning } from './MetadataProblem';

export class RecordTypeChecker {
  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private BONUS_EXPECTED_PICKLISTS = ['Name', 'ForecastCategoryName'];
  private baseDir: string;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  public run(): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const objects = this.customObjects().filter((o) => !this.IGNORE_OBJECTS.includes(o));
    for (const obj of objects) {
      warnings.push(...this.checkRecordTypes(obj));
    }

    return warnings;
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

  public customObjects(): string[] {
    return fs.readdirSync(this.objectsDir());
  }

  public checkRecordTypes(objectName: string): MetadataProblem[] {
    const objectPicklists = this.picklistFields(objectName);
    const requiredPicklists = objectPicklists.filter((p) => this.hasValueSet(objectName, p));
    const optionalPicklists = objectPicklists.filter((p) => !this.hasValueSet(objectName, p));

    const warnings: MetadataProblem[] = [];
    const recordTypes = this.objectRecordTypes(objectName);
    for (const recordType of recordTypes) {
      const result = this.checkRecordTypePicklists(objectName, recordType, requiredPicklists, optionalPicklists);
      warnings.push(...result);
    }
    return warnings;
  }

  public checkRecordTypePicklists(
    objectName: string,
    recordTypeName: string,
    requiredPicklists: string[],
    optionalPicklists: string[]
  ): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const recordTypeFileName = this.recordTypeFileName(objectName, recordTypeName);
    const recordTypePicklists = this.recordTypePicklistNames(objectName, recordTypeName);

    const missingPicklists = requiredPicklists.filter((p) => !recordTypePicklists.includes(p));
    if (missingPicklists.length > 0) {
      const componentName = `${objectName}.${recordTypeName}`;
      const message = `Picklist(s) missing from record type definition: ${missingPicklists.toString()}`;
      warnings.push(new MetadataWarning(componentName, 'RecordType', recordTypeFileName, message));
    }

    const expectedPicklists = requiredPicklists.concat(optionalPicklists).concat(this.BONUS_EXPECTED_PICKLISTS);
    const unexpectedPicklists = recordTypePicklists.filter((p) => !expectedPicklists.includes(p));
    if (unexpectedPicklists.length > 0) {
      const componentName = `${objectName}.${recordTypeName}`;
      const message = `Unexpected picklist(s) found in record type definition: ${unexpectedPicklists.toString()}`;
      warnings.push(new MetadataError(componentName, 'RecordType', recordTypeFileName, message));
    }

    return warnings;
  }

  // list of fields (field names) for the given object
  public objectFields(objectName: string): string[] {
    const fieldsDir = path.join(this.objectsDir(), objectName, 'fields');
    const fields = fs.existsSync(fieldsDir) ? fs.readdirSync(fieldsDir) : [];
    const fieldNames = fields.map((f) => path.basename(f, '.field-meta.xml'));
    return fieldNames;
  }

  public objectRecordTypes(objectName: string): string[] {
    const recordTypesDir = path.join(this.objectsDir(), objectName, 'recordTypes');
    const recordTypes = fs.existsSync(recordTypesDir) ? fs.readdirSync(recordTypesDir) : [];

    return recordTypes.map((rt) => path.basename(rt, '.recordType-meta.xml'));
  }

  public picklistFields(objectName: string): string[] {
    const allFields = this.objectFields(objectName);
    const picklistFields = allFields.filter((f) => this.isPicklistField(objectName, f));

    return picklistFields.map((f) => path.basename(f, '.field-meta.xml'));
  }

  public isPicklistField(objectName: string, fieldName: string): boolean {
    const fieldFileName = this.fieldFileName(objectName, fieldName);
    const fileContents = fs.readFileSync(fieldFileName).toString();

    const isPicklist = fileContents.includes('<type>Picklist</type>') || fileContents.includes('<type>MultiselectPicklist</type>');
    return isPicklist;
  }

  // expected: picklist value
  public hasValueSet(objectName: string, fieldName: string): boolean {
    const fieldFileName = this.fieldFileName(objectName, fieldName);
    const fileContents = fs.readFileSync(fieldFileName).toString();
    return fileContents.includes('<valueSet>');
  }

  public recordTypePicklistNames(objectName: string, recordTypeName: string): string[] {
    const pathToFile = path.join(this.objectsDir(), objectName, 'recordTypes', recordTypeName + '.recordType-meta.xml');
    const recordType = new RecordType(pathToFile);
    return recordType.picklistFieldNames();
  }
}
