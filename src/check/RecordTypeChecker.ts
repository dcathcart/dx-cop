import * as fs from 'fs';
import * as path from 'path';
//import * as xml2js from 'xml2js';


export class RecordTypeChecker {
  public run(): void {
    console.log("Checking record types");
  }

  public customObjects(): string[] {
    return fs.readdirSync(this.objectsDir());
  }

  public objectsDir(): string {
    return 'c:/dev/salesforce/unpackaged/main/default/objects/';
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

const rtc = new RecordTypeChecker();

const objects = rtc.customObjects();
for (const obj of objects) {
  const objectPicklists = rtc.picklistFieldNames(obj);
  const recordTypes = rtc.objectRecordTypes(obj);
  for (const recordType of recordTypes) {
    const recordTypePicklists = rtc.recordTypePicklistNames(obj, recordType);

    const missingPicklists = objectPicklists.filter((i) => !recordTypePicklists.includes(i));
    if (missingPicklists.length > 0) {
      console.log(`Record type ${obj}.${recordType}: missing reference to picklist(s): ${missingPicklists.toString()}`);
    }
  }
}
