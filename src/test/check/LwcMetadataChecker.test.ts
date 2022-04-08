import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LwcMetadataChecker } from '../../check/LwcMetadataChecker';
import { SfdxProjectBrowser } from '../../metadata_browser/SfdxProjectBrowser';

describe('LwcMetadataChecker', () => {
  // Regression test. Uses carefully crafted sample XML files to test the object at a high level.
  describe('.run() method', () => {
    it('should return an array of metadata problems', () => {
      const lwcFolders = new Map<string, string>();
      lwcFolders.set('BadExample', 'src/test/fixtures/lwc/BadExample');

      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcFolders').once().returns(lwcFolders);

      const checker = new LwcMetadataChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(1);
      mockProjectBrowser.verify();
    });

    it('should return an empty array when there are no problems', () => {
      const lwcFolders = new Map<string, string>();
      lwcFolders.set('GoodExample', 'src/test/fixtures/lwc/GoodExample');

      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcFolders').once().returns(lwcFolders);

      const checker = new LwcMetadataChecker(sfdxProjectBrowser);
      const result = checker.run();
      expect(result.length).to.equal(0);
      mockProjectBrowser.verify();
    });
  });
});
