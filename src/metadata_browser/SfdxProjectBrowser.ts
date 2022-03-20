import * as fs from 'fs';
import * as path from 'path';
import { SfdxProject } from '@salesforce/core';
import { RecordType } from './RecordType';

// Tools for browsing/navigating the metadata in an SFDX project
export class SfdxProjectBrowser {
  private sfdxProject: SfdxProject;

  public constructor(sfdxProject: SfdxProject) {
    this.sfdxProject = sfdxProject;
  }

  // Return a list of object names
  public objectNames(): string[] {
    return fs.readdirSync(this.objectsBaseDir());
  }

  // Return a list of record types for the given object
  public recordTypes(objectName: string): RecordType[] {
    const recordTypesDir = this.recordTypesBaseDir(objectName);
    const recordTypeFileNames = fs.existsSync(recordTypesDir) ? fs.readdirSync(recordTypesDir) : [];
    return recordTypeFileNames.map((r) => new RecordType(r));
  }

  // Directory containing all the record types for a given custom object
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

  // Where to look for metadata XML files.
  // For now, limit to the default package in sfdx-project.json. To be extended in the future.
  private defaultDir(): string {
    const defaultPackageDir: string = this.sfdxProject.getDefaultPackage().fullPath;
    return path.join(defaultPackageDir, 'main', 'default');
  }
}
