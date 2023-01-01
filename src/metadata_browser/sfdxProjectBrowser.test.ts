import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SfdxProjectBrowser } from './sfdxProjectBrowser';

describe('SfdxProjectBrowser', () => {
  describe('.lwcBundles()', () => {
    it('returns an array of LightningComponentBundle objects', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('defaultDir').once().returns('src/test/metadata');

      const results = sfdxProjectBrowser.lwcBundles();
      expect(results.length).to.equal(2);
      // make sure the right folders were passed in to the LightningComponentBundle constructor
      // other properties of LightningComponentBundle are tested elsewhere
      expect(results[0].baseFolder).to.equal(path.normalize('src/test/metadata/lwc/BadExample'));
      expect(results[1].baseFolder).to.equal(path.normalize('src/test/metadata/lwc/GoodExample'));
      mockProjectBrowser.verify();
    });
  });

  describe('.objects()', () => {
    it('returns an array of CustomObject objects', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('defaultDir').once().returns('src/test/metadata');

      const results = sfdxProjectBrowser.objects();
      expect(results.length).to.equal(2);
      expect(results[0].name).to.equal('TestObject1');
      expect(results[1].name).to.equal('TestObject2');
      mockProjectBrowser.verify();
    });
  });

  describe('.queues()', () => {
    it('returns an array of Queue objects', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('defaultDir').once().returns('src/test/metadata');

      const results = sfdxProjectBrowser.queues();
      expect(results.length).to.equal(2);
      expect(results[0].name).to.equal('Queue_With_No_Members');
      expect(results[1].name).to.equal('Queue_With_Users');
      mockProjectBrowser.verify();
    });
  });
});
