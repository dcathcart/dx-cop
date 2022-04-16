import * as path from 'path';

// Abstract base class for all metadata components
export class LightningComponentBundle {
  // The Salesforce metadata type, according to https://developer.salesforce.com/docs/atlas.en-us.234.0.api_meta.meta/api_meta/meta_types_list.htm
  public readonly metadataType = 'LightningComponentBundle';
  public readonly baseFolder: string;

  public constructor(baseFolder: string) {
    this.baseFolder = path.normalize(baseFolder);
  }

  public get name(): string {
    const split = this.baseFolder.split(path.sep);
    return split[split.length - 1];
  }

  public get jsMetaFileName(): string {
    return path.join(this.baseFolder, this.name + '.js-meta.xml');
  }
}
