import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser/src/fxp';
import { JsonMap, ensureJsonMap } from '@salesforce/ts-types';

// Abstract base class for all metadata components
export abstract class MetadataComponent {
  public readonly fileName: string;
  private parsedMetadata: JsonMap;

  // The part of the file extension that is specific to each metadata type, e.g. the 'field' in '.field-meta.xml'.
  // Must be set in every subclass so the component name can be properly derived from the file name.
  protected abstract readonly fileExtension: string;

  // The Salesforce metadata type, according to https://developer.salesforce.com/docs/atlas.en-us.234.0.api_meta.meta/api_meta/meta_types_list.htm
  // This is the name of the 'top level' node in the metadata XML.
  protected abstract readonly metadataType: string;

  public constructor(fileName: string) {
    this.fileName = path.normalize(fileName); // smooth away any rough edges, forward/backslash issues etc
  }

  // The name (aka Developer Name) of this metadata component
  public get name(): string {
    const ext = `.${this.fileExtension}-meta.xml`;
    return path.basename(this.fileName, ext);
  }

  // Accessor for the metadata XML (parsed into JSON)
  public get metadata(): JsonMap {
    return (this.parsedMetadata ||= this.parseMetadata());
  }

  private parseMetadata(): JsonMap {
    // Don't trim whitespace from values. Added to handle picklist values that end with non-breaking spaces (yes, really).
    // Treat values with leading zeros as strings. Same for hex values, although these are less relevant.
    const xmlParser: XMLParser = new XMLParser({
      trimValues: false,
      numberParseOptions: { leadingZeros: false, hex: false },
    });

    const file: Buffer = fs.readFileSync(this.fileName);
    const parsed: JsonMap = ensureJsonMap(xmlParser.parse(file));
    return ensureJsonMap(parsed[this.metadataType]);
  }
}

// Abstract base class for sub-components of objects, e.g. fields, record types
export abstract class ObjectSubComponent extends MetadataComponent {
  public get objectName(): string {
    const dir = path.dirname(this.fileName);
    const split = dir.split(path.sep); // assumes fileName is using the appropriate path separator for the platform
    return split[split.length - 2];
  }
}
