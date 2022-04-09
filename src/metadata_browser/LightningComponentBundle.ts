import * as path from 'path';

// Abstract base class for all metadata components
export class LightningComponentBundle {
  // The Salesforce metadata type, according to https://developer.salesforce.com/docs/atlas.en-us.234.0.api_meta.meta/api_meta/meta_types_list.htm
  public readonly metadataType = 'LightningComponentBundle';

  private readonly lwcFolder: string;

  public constructor(lwcFolder: string) {
    this.lwcFolder = path.normalize(lwcFolder);
  }

  public get name(): string {
    const split = this.lwcFolder.split(path.sep);
    return split[split.length - 1];
  }

  public jsMetaFileName(): string {
    return path.join(this.lwcFolder, this.name + '.js-meta.xml');
  }
}
