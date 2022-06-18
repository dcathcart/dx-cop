import * as fs from 'fs';
import * as path from 'path';
import { SfdxProject } from '@salesforce/core';
import { CustomField } from './customField';
import { CustomObject } from './customObject';
import { EmailToCaseSettings } from './emailToCaseSettings';
import { LightningComponentBundle } from './lightningComponentBundle';
import { PicklistField } from './picklistField';
import { Profile } from './profile';
import { RecordType } from './recordType';

// Tools for browsing/navigating the metadata in an SFDX project
export class SfdxProjectBrowser {
  private readonly sfdxProject: SfdxProject;

  public constructor(sfdxProject: SfdxProject) {
    this.sfdxProject = sfdxProject;
  }

  // Provide a list of objects. Includes both standard and custom objects.
  public objects(): CustomObject[] {
    const results: CustomObject[] = [];

    const baseDir = this.objectsBaseDir();
    const objectDirs = fs.readdirSync(baseDir);

    for (const objectDir of objectDirs) {
      const fileName = path.join(baseDir, objectDir, objectDir + '.object-meta.xml');

      // Ignore objects that don't have a *.object-meta.xml file.
      // These are likely to be packaged objects that have been modified in some way (e.g. a custom field was added).
      // TODO: Revisit this thinking. Is it valid for all scenarios?
      if (fs.existsSync(fileName)) {
        const object = new CustomObject(fileName);

        // Not interested in Custom Settings here
        if (object.isCustomSetting()) {
          continue;
        }

        // Don't return Activity in the list. It's not an object you can interact with directly in Salesforce.
        // Instead you use it via the Event and Task objects (sort-of like a abstract parent / concrete child class relationship)
        if (object.name === 'Activity') {
          continue;
        }

        results.push(object);
      }
    }

    return results;
  }

  public emailToCaseSettings(): EmailToCaseSettings {
    const fileName = path.join(this.settingsBaseDir(), 'Case.settings-meta.xml');
    return new EmailToCaseSettings(fileName);
  }

  // Return the list of fields for a given object
  public fields(objectName: string): CustomField[] {
    if (objectName === 'Event' || objectName === 'Task') {
      const fieldsFromActivityObject = this.fieldsForObject('Activity', objectName);
      return this.fieldsForObject(objectName).concat(fieldsFromActivityObject);
    }
    return this.fieldsForObject(objectName);
  }

  // Return a map of all LWCs. key = LWC name, value = full path to the folder that contains all the components for that LWC
  public lwcBundles(): LightningComponentBundle[] {
    const lwcBaseDir = this.lwcBaseDir();
    const lwcDirs = fs.readdirSync(lwcBaseDir).filter((entry) => entry !== 'jsconfig.json');
    return lwcDirs.map((lwc) => new LightningComponentBundle(path.join(lwcBaseDir, lwc)));
  }

  // Return a list of object names
  public objectNames(): string[] {
    return fs.readdirSync(this.objectsBaseDir());
  }

  // Return all picklist fields in a map (picklist name -> PicklistField object)
  public picklistFields(objectName: string): PicklistField[] {
    const picklists: CustomField[] = this.fields(objectName).filter((f) => f.isPicklist());
    return picklists.map((f) => new PicklistField(f.fileName));
  }

  public profileByName(profileName: string): Profile {
    const fileName = path.join(this.profilesBaseDir(), profileName + '.profile-meta.xml');
    return new Profile(fileName);
  }

  // Return a list of record types for the given object
  public recordTypes(objectName: string): RecordType[] {
    const dir = this.recordTypesBaseDir(objectName);
    const fileNames = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    return fileNames.map((f) => new RecordType(path.join(dir, f)));
  }

  // Directory containing fields for a given object
  private customFieldsBaseDir(objectName: string): string {
    return path.join(this.objectDir(objectName), 'fields');
  }

  private fieldsForObject(objectName: string, objectNameOverride: string = null): CustomField[] {
    const dir = this.customFieldsBaseDir(objectName);
    const fileNames = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    return fileNames.map((f) => new CustomField(path.join(dir, f), objectNameOverride));
  }

  private lwcBaseDir(): string {
    return path.join(this.defaultDir(), 'lwc');
  }

  private profilesBaseDir(): string {
    return path.join(this.defaultDir(), 'profiles');
  }

  // Directory containing all the record types for a given object
  // Doesn't care whether the directory exists (likely it won't if the object has no record types)
  private recordTypesBaseDir(objectName: string): string {
    return path.join(this.objectDir(objectName), 'recordTypes');
  }

  // Directory for a given custom object
  private objectDir(objectName: string): string {
    return path.join(this.objectsBaseDir(), objectName);
  }

  // Directory containing custom objects
  private objectsBaseDir(): string {
    return path.join(this.defaultDir(), 'objects');
  }

  private settingsBaseDir(): string {
    return path.join(this.defaultDir(), 'settings');
  }

  // Where to look for metadata XML files.
  // For now, limit to the default package in sfdx-project.json. To be extended in the future.
  private defaultDir(): string {
    const defaultPackageDir: string = this.sfdxProject.getDefaultPackage().fullPath;
    return path.join(defaultPackageDir, 'main', 'default');
  }
}
