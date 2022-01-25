import { JsonMap } from '@salesforce/ts-types';

export abstract class MetadataProblem {
  protected type: string;
  private filename: string;
  private message: string;

  public constructor(filename: string, message: string) {
    this.filename = filename;
    this.message = message;
  }

  public toJSON(): JsonMap {
    return {
      type: this.type,
      filename: this.filename,
      message: this.message,
    };
  }
}

// A Metadata Error is a condition that would in all likelihood prevent a component from being deployed,
// due to a Salesforce validation error. e.g. when a record type references a picklist value that no longer exists.
export class MetadataError extends MetadataProblem {
  public constructor(filename: string, message: string) {
    super(filename, message);
    this.type = 'error';
  }
}

// A Metadata Warning is a condition that usually *doesn't* result in a validation/deployment error, but could still
// cause problems later. Often the result of a new component causing changes to other components, but the changes to
// the other components have not been reflected in git. The potention 'later' problems could include:
// - merge conflicts
// - config intended by the developer is missed
// - unexpected differences when retrieving component from org
export class MetadataWarning extends MetadataProblem {
  public constructor(filename: string, message: string) {
    super(filename, message);
    this.type = 'warning';
  }
}
