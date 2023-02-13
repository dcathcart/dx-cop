import { InstalledPackage } from '../metadata_browser/installedPackage';
import { MetadataError, MetadataProblem } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class InstalledPackageRuleset extends MetadataRuleset {
  public displayName = 'Installed packages';

  public run(): MetadataProblem[] {
    return this.sfdxProjectBrowser
      .installedPackages()
      .map((p) => this.installedPackageErrors(p))
      .flat();
  }

  private installedPackageErrors(installedPackage: InstalledPackage): MetadataError[] {
    const results: MetadataError[] = [];

    if (installedPackage.activateRSS === null) {
      results.push(this.activateRssNullError(installedPackage));
    }
    if (installedPackage.activateRSS === undefined) {
      results.push(this.activateRssUndefinedError(installedPackage));
    }

    return results;
  }

  private activateRssNullError(installedPackage: InstalledPackage): MetadataError {
    return new MetadataError(
      installedPackage.name,
      'InstalledPackage',
      installedPackage.fileName,
      '<activateRSS> element is empty. Should contain a boolean value'
    );
  }

  private activateRssUndefinedError(installedPackage: InstalledPackage): MetadataError {
    return new MetadataError(
      installedPackage.name,
      'InstalledPackage',
      installedPackage.fileName,
      '<activateRSS> element does not exist, or contains a non-boolean value'
    );
  }
}
