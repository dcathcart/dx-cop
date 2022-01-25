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

export class MetadataError extends MetadataProblem {
  public constructor(filename: string, message: string) {
    super(filename, message);
    this.type = 'error';
  }
}

export class MetadataWarning extends MetadataProblem {
  public constructor(filename: string, message: string) {
    super(filename, message);
    this.type = 'warning';
  }
}
