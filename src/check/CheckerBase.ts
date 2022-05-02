import { SfdxProjectBrowser } from '../metadata_browser/SfdxProjectBrowser';
import { MetadataProblem } from './MetadataProblem';

export abstract class CheckerBase {
  protected sfdxProjectBrowser: SfdxProjectBrowser;
  public abstract displayName: string;

  public constructor(sfdxProjectBrowser: SfdxProjectBrowser) {
    this.sfdxProjectBrowser = sfdxProjectBrowser;
  }

  public abstract run(): MetadataProblem[];
}
