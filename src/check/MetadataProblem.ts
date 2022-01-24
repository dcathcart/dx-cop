import { JsonMap } from '@salesforce/ts-types';

export class MetadataProblem {
  private filename: string;
  private message: string;

  public constructor(filename: string, message: string) {
    this.filename = filename;
    this.message = message;
  }

  public toJSON(): JsonMap {
    return {
      filename: this.filename,
      message: this.message,
    };
  }
}
