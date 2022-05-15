import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';
import { MetadataProblem } from './metadataProblem';

export abstract class MetadataRuleset {
  protected sfdxProjectBrowser: SfdxProjectBrowser;
  public abstract displayName: string;

  public constructor(sfdxProjectBrowser: SfdxProjectBrowser) {
    this.sfdxProjectBrowser = sfdxProjectBrowser;
  }

  public abstract run(): MetadataProblem[];
}
