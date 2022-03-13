import { JsonMap } from '@salesforce/ts-types';

export abstract class MetadataProblem {
  protected problemType: string;

  private componentName: string;
  private componentType: string;
  private fileName: string;
  private problem: string;

  public constructor(componentName: string, componentType: string, fileName: string, problem: string) {
    this.componentName = componentName;
    this.componentType = componentType;
    this.fileName = fileName;
    this.problem = problem;
  }

  public toJSON(): JsonMap {
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
  protected problemType = 'Error';
}

// A Metadata Warning is a condition that usually *doesn't* result in a validation/deployment error, but could still
// cause problems later. Often the result of a new component causing changes to other components, but the changes to
// the other components have not been reflected in git. The potention 'later' problems could include:
// - merge conflicts
// - config intended by the developer is missed
// - unexpected differences when retrieving component from org
export class MetadataWarning extends MetadataProblem {
  protected problemType = 'Warning';
}
