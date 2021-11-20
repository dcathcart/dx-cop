import * as fs from 'fs';
import * as path from 'path';

export class RecordTypeChecker {
  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private BONUS_EXPECTED_PICKLISTS = ['Name', 'ForecastCategoryName'];
  private baseDir: string;

  public constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  public run(): void {
    const objects = this.customObjects().filter((o) => !this.IGNORE_OBJECTS.includes(o));
    for (const obj of objects) {
      this.checkRecordTypes(obj);
    }
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

  public customObjects(): string[] {
    return fs.readdirSync(this.objectsDir());
  }

  public checkRecordTypes(objectName: string): void {
    const objectPicklists = this.picklistFields(objectName);
    const requiredPicklists = objectPicklists.filter((p) => this.hasValueSet(objectName, p));
    const optionalPicklists = objectPicklists.filter((p) => !this.hasValueSet(objectName, p));

    const recordTypes = this.objectRecordTypes(objectName);
    for (const recordType of recordTypes) {
      this.checkRecordTypePicklists(objectName, recordType, requiredPicklists, optionalPicklists);
    }
  }

  public checkRecordTypePicklists(
    objectName: string,
    recordTypeName: string,
    requiredPicklists: string[],
    optionalPicklists: string[]
  ): void {
    const recordTypePicklists = this.recordTypePicklistNames(objectName, recordTypeName);

    const missingPicklists = requiredPicklists.filter((p) => !recordTypePicklists.includes(p));
    if (missingPicklists.length > 0) {
      console.log(`Record type ${objectName}.${recordTypeName} is missing picklist(s): ${missingPicklists.toString()}`);
    }

    const expectedPicklists = requiredPicklists.concat(optionalPicklists).concat(this.BONUS_EXPECTED_PICKLISTS);
    const unexpectedPicklists = recordTypePicklists.filter((p) => !expectedPicklists.includes(p));
    if (unexpectedPicklists.length > 0) {
      console.log(`Record type ${objectName}.${recordTypeName} contains unexpected picklist(s): ${unexpectedPicklists.toString()}`);
    }
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
//    if (isPicklist) console.log(`${fileContents.length} : ${fieldFileName}`);
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
    const fileContents = fs.readFileSync(pathToFile).toString();
    const regexp = /<picklist>(.*)<\/picklist>/g;
    const matches = fileContents.matchAll(regexp);

    return Array.from(matches, (match) => match[1]);
  }
}
