import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import Sinon = require('sinon');
import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';

describe('SfdxProjectBrowser', () => {
  describe('.lwcBundles()', () => {
    it('should return an array of LightningComponentBundle objects; one for each subfolder', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = Sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcBaseDir').once().returns('src/test/metadata/lwc');

      const results = sfdxProjectBrowser.lwcBundles();
      expect(results.length).to.equal(2);
      // make sure the right folders were passed in to the LightningComponentBundle constructor
      // other properties of LightningComponentBundle are tested elsewhere
      expect(results[0].baseFolder).to.equal(path.normalize('src/test/metadata/lwc/BadExample'));
      expect(results[1].baseFolder).to.equal(path.normalize('src/test/metadata/lwc/GoodExample'));
      mockProjectBrowser.verify();
    });
  });
});
