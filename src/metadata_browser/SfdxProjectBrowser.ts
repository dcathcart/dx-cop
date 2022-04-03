import * as fs from 'fs';
import * as path from 'path';
import { SfdxProject } from '@salesforce/core';
import { CustomField } from './CustomField';
import { CustomObject } from './CustomObject';
import { EmailToCaseSettings } from './EmailToCaseSettings';
import { PicklistField } from './PicklistField';
import { Profile } from './Profile';
import { RecordType } from './RecordType';

// Tools for browsing/navigating the metadata in an SFDX project
export class SfdxProjectBrowser {
  public readonly sfdxProject: SfdxProject;

  public constructor(sfdxProject: SfdxProject) {
    this.sfdxProject = sfdxProject;
  }

  // Provide a list of custom objects.
  // In this context, 'custom' means that standard Salesforce objects are excluded.
  public customObjects(): CustomObject[] {
    const results: CustomObject[] = [];
    const baseDir = this.objectsBaseDir();
    const objectDirs = fs.readdirSync(baseDir);

    for (const objectDir of objectDirs) {
      const fileName = path.join(baseDir, objectDir, objectDir + '.object-meta.xml');
      // ignore objects that don't have a *.object-meta.xml file
      // these are likely to be packaged objects that have been modified in some way (e.g. a custom field was added)
      if (fs.existsSync(fileName)) {
        results.push(new CustomObject(fileName));
      }
    }

    // Filter out anything that is not a custom object
    // i.e. don't include standard objects, custom settings etc.
    return results.filter((obj) => obj.isCustomObject());
  }

  public emailToCaseSettings(): EmailToCaseSettings {
    const fileName = path.join(this.settingsBaseDir(), 'Case.settings-meta.xml');
    return new EmailToCaseSettings(fileName);
  }

  // Return a list of object names
  public objectNames(): string[] {
    return fs.readdirSync(this.objectsBaseDir());
  }

  // Return all picklist fields in a map (picklist name -> PicklistField object)
  public picklistFields(objectName: string): PicklistField[] {
    const picklists: CustomField[] = this.customFields(objectName).filter((f) => f.isPicklist());
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

  // Return a list of fields for the given object
  public customFields(objectName: string): CustomField[] {
    const dir = this.customFieldsBaseDir(objectName);
    const fileNames = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    return fileNames.map((f) => new CustomField(path.join(dir, f)));
  }

  // Directory containing fields for a given object
  private customFieldsBaseDir(objectName: string): string {
    return path.join(this.objectDir(objectName), 'fields');
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
