import { RecordType } from '../metadata_browser/recordType';
import { MetadataError, MetadataProblem, MetadataWarning } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class RecordTypePicklistRuleset extends MetadataRuleset {
  public displayName = 'Record type picklists';

  private IGNORE_OBJECTS = ['Event', 'PersonAccount', 'Task'];
  private BONUS_EXPECTED_PICKLISTS = ['Name', 'ForecastCategoryName'];

  public run(): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const objects = this.sfdxProjectBrowser.objectNames().filter((o) => !this.IGNORE_OBJECTS.includes(o));
    for (const obj of objects) {
      warnings.push(...this.checkRecordTypes(obj));
    }

    return warnings;
  }

  public checkRecordTypes(objectName: string): MetadataProblem[] {
    const objectPicklists = this.sfdxProjectBrowser.picklistFields(objectName);

    // For reasons I can't quite explain, Salesforce makes an effort to furnish record types with all picklist fields that don't use standard value sets.
    // So we will treat these as "required fields"; if they don't exist, raise a MetadataWarning.
    const requiredPicklists = objectPicklists.filter((p) => !p.usesStandardValueSet()).map((p) => p.name);

    // Picklist fields that use standard values sets can *sometimes* be seen in record types, but Salesforce seems less opinionated about these.
    // So we will treat these as "optional fields"; if they don't exist, we won't make a fuss.
    const optionalPicklists = objectPicklists.filter((p) => p.usesStandardValueSet()).map((p) => p.name);

    const warnings: MetadataProblem[] = [];
    const recordTypes = this.sfdxProjectBrowser.recordTypes(objectName);
    for (const recordType of recordTypes) {
      const result = this.checkRecordTypePicklists(recordType, requiredPicklists, optionalPicklists);
      warnings.push(...result);
    }
    return warnings;
  }

  public checkRecordTypePicklists(
    recordType: RecordType,
    requiredPicklists: string[],
    optionalPicklists: string[]
  ): MetadataProblem[] {
    const warnings: MetadataProblem[] = [];

    const recordTypePicklists = recordType.picklistFieldNames();

    const missingPicklists = requiredPicklists.filter((p) => !recordTypePicklists.includes(p));
    if (missingPicklists.length > 0) {
      const componentName = `${recordType.objectName}.${recordType.name}`;
      const message = `Picklist(s) missing from record type definition: ${missingPicklists.toString()}`;
      warnings.push(new MetadataWarning(componentName, 'RecordType', recordType.fileName, message));
    }

    const expectedPicklists = requiredPicklists.concat(optionalPicklists).concat(this.BONUS_EXPECTED_PICKLISTS);
    const unexpectedPicklists = recordTypePicklists.filter((p) => !expectedPicklists.includes(p));
    if (unexpectedPicklists.length > 0) {
      const componentName = `${recordType.objectName}.${recordType.name}`;
      const message = `Unexpected picklist(s) found in record type definition: ${unexpectedPicklists.toString()}`;
      warnings.push(new MetadataError(componentName, 'RecordType', recordType.fileName, message));
    }

    return warnings;
  }
}
