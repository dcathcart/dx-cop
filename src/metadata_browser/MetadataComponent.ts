import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser/src/fxp';
import { JsonMap, ensureJsonMap } from '@salesforce/ts-types';

export class MetadataComponent {
  private metadataFileName: string;
  private parsedMetadata: JsonMap;

  public constructor(metadataFileName: string) {
    this.metadataFileName = metadataFileName;
    this.parsedMetadata = null;
  }

  public metadata(): JsonMap {
    if (this.parsedMetadata === null) this.parsedMetadata = this.parseMetadata();
    return this.parsedMetadata;
  }

  private parseMetadata(): JsonMap {
    // Don't trim whitespace from values. Added to handle picklist values that end with non-breaking spaces (yes, really).
    // Treat values with leading zeros as strings. Same for hex values, although these are less relevant.
    const xmlParser: XMLParser = new XMLParser({
      trimValues: false,
      numberParseOptions: { leadingZeros: false, hex: false },
    });

    const file: Buffer = fs.readFileSync(this.metadataFileName);
    return ensureJsonMap(xmlParser.parse(file));
  }
}
