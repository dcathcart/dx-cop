import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LwcMetadataChecker } from '../../src/check/LwcMetadataChecker';
import { LightningComponentBundle } from '../../src/metadata_browser/LightningComponentBundle';
import { SfdxProjectBrowser } from '../../src/metadata_browser/SfdxProjectBrowser';

describe('LwcMetadataChecker', () => {
  // Regression test. Uses carefully crafted sample XML files to test the object at a high level.
  describe('.run() method', () => {
    it('should return an array of metadata problems', () => {
      const lwcBundles = [
        new LightningComponentBundle('test/fixtures/lwc/BadExample'),
        new LightningComponentBundle('test/fixtures/lwc/GoodExample'),
      ];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcBundles').once().returns(lwcBundles);

      const checker = new LwcMetadataChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(1);
      mockProjectBrowser.verify();
    });

    it('should return an empty array when there are no problems', () => {
      const lwcBundles = [new LightningComponentBundle('test/fixtures/lwc/GoodExample')];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcBundles').once().returns(lwcBundles);

      const checker = new LwcMetadataChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(0);
      mockProjectBrowser.verify();
    });
  });
});
