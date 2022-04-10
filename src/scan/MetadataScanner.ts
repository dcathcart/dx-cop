import { SfdxProjectBrowser } from '../metadata_browser/SfdxProjectBrowser';

export class MetadataScanner {
  protected sfdxProjectBrowser: SfdxProjectBrowser;

  public constructor(sfdxProjectBrowser: SfdxProjectBrowser) {
    this.sfdxProjectBrowser = sfdxProjectBrowser;
  }
}
