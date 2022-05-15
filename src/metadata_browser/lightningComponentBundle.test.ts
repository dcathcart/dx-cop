import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import { LightningComponentBundle } from './lightningComponentBundle';

describe('LightningComponentBundle', () => {
  describe('.baseFolder property', () => {
    it('should contain the base folder for the bundle, with correct (platform-specific) path separators', () => {
      const unixPath = 'src/test/metadata/lwc/GoodExample';
      const lwc1 = new LightningComponentBundle(unixPath);
      expect(lwc1.baseFolder).to.equal(path.normalize(unixPath));

      const windowsPath = 'src\\test\\metadata\\lwc\\GoodExample';
      const lwc2 = new LightningComponentBundle(windowsPath);
      expect(lwc2.baseFolder).to.equal(path.normalize(windowsPath));
    });
  });

  describe('.name property', () => {
    it('should return the name of the bundle, derived from the path', () => {
      const lwc = new LightningComponentBundle('src/test/metadata/lwc/GoodExample');
      expect(lwc.name).to.equal('GoodExample');
    });
  });

  describe('.jsMetaFileName property', () => {
    it('should return the file name for the *.js-meta.xml file in this bundle', () => {
      const lwc = new LightningComponentBundle('src/test/metadata/lwc/GoodExample');
      const expected = path.normalize('src/test/metadata/lwc/GoodExample/GoodExample.js-meta.xml'); // full path expected
      expect(lwc.jsMetaFileName).to.equal(expected);
    });
  });
});
