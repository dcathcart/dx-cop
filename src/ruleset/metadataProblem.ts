import { JsonMap } from '@salesforce/ts-types';

export abstract class MetadataProblem {
  // for use in calls to SfdxCommand.ux.table()
  public static tableOutputKeys: string[] = ['type', 'metadataType', 'name', 'problem'];

  public readonly componentName: string;
  public readonly componentType: string;
  public readonly fileName: string;
  public readonly problem: string;

  public abstract readonly problemType: string;

  public constructor(componentName: string, componentType: string, fileName: string, problem: string) {
    this.componentName = componentName;
    this.componentType = componentType;
    this.fileName = fileName;
    this.problem = problem;
  }

  public tableOutput(): JsonMap {
    return {
      type: this.problemType,
      metadataType: this.componentType,
      name: this.componentName,
      problem: this.problem,
    };
  }

  public jsonOutput(): JsonMap {
    return {
      componentName: this.componentName,
      componentType: this.componentType,
      fileName: this.fileName,
      problem: this.problem,
      problemType: this.problemType,
    };
  }
}

// A Metadata Error is a condition that would in all likelihood prevent a component from being deployed,
// due to a Salesforce validation error. e.g. when a record type references a picklist value that no longer exists.
export class MetadataError extends MetadataProblem {
  public readonly problemType = 'Error';
}

// A Metadata Warning is a condition that usually *doesn't* result in a validation/deployment error, but could still
// cause problems later. Often the result of a new component causing changes to other components, but the changes to
// the other components have not been reflected in git. The potention 'later' problems could include:
// - merge conflicts
// - config intended by the developer is missed
// - unexpected differences when retrieving component from org
export class MetadataWarning extends MetadataProblem {
  public readonly problemType = 'Warning';
}
