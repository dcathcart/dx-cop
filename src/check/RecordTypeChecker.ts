import * as fs from 'fs';
import * as path from 'path';

export class RecordTypeChecker {
  private IGNORE_MISSING_PICKLISTS = ['PersonLeadSource', 'StageName', 'Status'];
  private baseDir: string;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  public run(): void {
    const objects = this.customObjects();
    for (const obj of objects) {
      this.checkRecordTypes(obj);
    }
  }

  public objectsDir(): string {
    return path.join(this.baseDir, 'objects');
  }

  public customObjects(): string[] {
    return fs.readdirSync(this.objectsDir());
  }

  public checkRecordTypes(objectName: string): void {
    const objectPicklists = this.picklistFieldNames(objectName);
    const requiredPicklists = objectPicklists.filter((i) => !this.IGNORE_MISSING_PICKLISTS.includes(i));

    const recordTypes = this.objectRecordTypes(objectName);
    for (const recordType of recordTypes) {
      this.checkRecordType(objectName, recordType, requiredPicklists);
    }
  }

  public checkRecordType(objectName: string, recordTypeName: string, requiredPicklists: string[]): void {
    const recordTypePicklists = this.recordTypePicklistNames(objectName, recordTypeName);

    const missingPicklists = requiredPicklists.filter((i) => !recordTypePicklists.includes(i));
    if (missingPicklists.length > 0) {
      console.log(`Record type ${objectName}.${recordTypeName} is missing picklist(s): ${missingPicklists.toString()}`);
    }
  }

  // list of fields for an object - array of full paths to field metadata files
  public objectFields(objectName: string): string[] {
    const fieldsDir = path.join(this.objectsDir(), objectName, 'fields');
    const fields = fs.existsSync(fieldsDir) ? fs.readdirSync(fieldsDir) : [];

    return fields.map((f) => path.join(fieldsDir, f));
  }

  public objectRecordTypes(objectName: string): string[] {
    const recordTypesDir = path.join(this.objectsDir(), objectName, 'recordTypes');
    const recordTypes = fs.existsSync(recordTypesDir) ? fs.readdirSync(recordTypesDir) : [];

    return recordTypes.map((rt) => path.basename(rt, '.recordType-meta.xml'));
  }

  public picklistFieldNames(objectName: string): string[] {
    const allFields = this.objectFields(objectName);
    const picklistFields = allFields.filter(this.isPicklistField);

    return picklistFields.map((f) => path.basename(f, '.field-meta.xml'));
  }

  public isPicklistField(fieldFileName: string): boolean {
    const fileContents = fs.readFileSync(fieldFileName).toString();
    return fileContents.includes('<type>Picklist</type>') || fileContents.includes('<type>MultiselectPicklist</type>');
  }

  public recordTypePicklistNames(objectName: string, recordTypeName: string): string[] {
    const pathToFile = path.join(this.objectsDir(), objectName, 'recordTypes', recordTypeName + '.recordType-meta.xml');
    const fileContents = fs.readFileSync(pathToFile).toString();
    const regexp = /<picklist>(.*)<\/picklist>/g;
    const matches = fileContents.matchAll(regexp);

    return Array.from(matches, (match) => match[1]);
  }
}
