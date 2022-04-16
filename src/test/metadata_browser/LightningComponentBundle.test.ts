import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import { LightningComponentBundle } from '../../metadata_browser/LightningComponentBundle';

describe('LightningComponentBundle', () => {
  describe('.name property', () => {
    it('should return the name of the bundle, derived from the path', () => {
      const lwc = new LightningComponentBundle('src/test/fixtures/lwc/GoodExample');
      expect(lwc.name).to.equal('GoodExample');
    });
  });

  describe('.jsMetaFileName preperty', () => {
    it('should return the file name for the *.js-meta.xml file in this bundle', () => {
      const lwc = new LightningComponentBundle('src/test/fixtures/lwc/GoodExample');
      const expected = path.normalize('src/test/fixtures/lwc/GoodExample/GoodExample.js-meta.xml'); // full path expected
      expect(lwc.jsMetaFileName).to.equal(expected);
    });
  });
});
