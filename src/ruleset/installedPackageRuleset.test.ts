import 'mocha';
import { expect } from 'chai';
import sinon = require('sinon');
import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';
import { InstalledPackage } from '../metadata_browser/installedPackage';
import { InstalledPackageRuleset } from './installedPackageRuleset';

describe('InstalledPackageRuleset', () => {
  describe('.run()', () => {
    const goodInstalledPackage = new InstalledPackage(
      'src/test/metadata/installedPackages/TestPackageA.installedPackage-meta.xml'
    );
    const badInstalledPackage = new InstalledPackage(
      'src/test/metadata/installedPackages/TestPackageB.installedPackage-meta.xml'
    );
    const anotherBadInstalledPackage = new InstalledPackage(
      'src/test/metadata/installedPackages/TestPackageC.installedPackage-meta.xml'
    );

    it('returns an error if the <activateRSS> element is empty', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      sinon
        .stub(sfdxProjectBrowser, 'installedPackages')
        .returns([goodInstalledPackage, badInstalledPackage, anotherBadInstalledPackage]);

      const ruleset = new InstalledPackageRuleset(sfdxProjectBrowser);
      const results = ruleset.run();

      expect(results.length).to.equal(2);
      expect(results[0].problemType).to.equal('Error');
      expect(results[0].problem).to.equal('<activateRSS> element is empty. Should contain a boolean value');
      expect(results[1].problemType).to.equal('Error');
      expect(results[1].problem).to.equal('<activateRSS> element does not exist, or contains a non-boolean value');
    });
  });
});
