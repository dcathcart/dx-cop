import { SfdxProjectBrowser } from '../metadata_browser/SfdxProjectBrowser';

export class CheckerBase {
  protected sfdxProjectBrowser: SfdxProjectBrowser;

  public constructor(sfdxProjectBrowser: SfdxProjectBrowser) {
    this.sfdxProjectBrowser = sfdxProjectBrowser;
  }
}
