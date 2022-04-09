import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LwcMetadataChecker } from '../../src/check/LwcMetadataChecker';
import { LightningComponentBundle } from '../../src/metadata_browser/LightningComponentBundle';
import { SfdxProjectBrowser } from '../../src/metadata_browser/SfdxProjectBrowser';

describe('LwcMetadataChecker', () => {
  // Regression test. Uses carefully crafted sample XML files to test the object at a high level.
  // Tests every method in the class, but only lightly.
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

  describe('.trailingWhitespaceWarnings()', () => {
    it('should return a metadata warning when there is trailing whitespace', () => {
      const lwcBundles = [
        new LightningComponentBundle('test/fixtures/lwc/GoodExample'),
        new LightningComponentBundle('test/fixtures/lwc/BadExample'),
      ];
      const checker = new LwcMetadataChecker(null);
      // mock out the calls to .fileHasTrailingWhitespace(); make it look like one no, one yes
      const mock = sinon.mock(checker);
      mock.expects('fileHasTrailingWhitespace').once().returns(false);
      mock.expects('fileHasTrailingWhitespace').once().returns(true);

      const results = checker['trailingWhitespaceWarnings'](lwcBundles);

      // Expect one metadata warning. Check all the properties of the warning object; covers .trailingWhitespaceWarning() as well
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('BadExample');
      expect(results[0].componentType).to.equal('LightningComponentBundle');
      expect(results[0].fileName).to.equal(path.normalize('test/fixtures/lwc/BadExample/BadExample.js-meta.xml'));
      expect(results[0].problem).to.equal(
        'Whitespace characters detected at the end of one or more lines in .js-meta.xml'
      );
      expect(results[0].problemType).to.equal('Warning');
      mock.verify();
    });
  });

  describe('.fileHasTrailingWhitespace()', () => {
    it('should return true when there is whitespace at the end of one or more lines', () => {
      const checker = new LwcMetadataChecker(null);
      const result = checker['fileHasTrailingWhitespace']('test/fixtures/lwc/BadExample/BadExample.js-meta.xml');
      expect(result).to.equal(true);
    });

    it('should return false when there is no trailing whitespace', () => {
      const checker = new LwcMetadataChecker(null);
      const result = checker['fileHasTrailingWhitespace']('test/fixtures/lwc/GoodExample/GoodExample.js-meta.xml');
      expect(result).to.equal(false);
    });
  });

  describe('.lineHasTrailingWhitespace()', () => {
    it('should return true when there are one or more spaces at the end of a line', () => {
      const checker = new LwcMetadataChecker(null);
      const lineWithOneSpace = '<someField>someValue</someField> ';
      const lineWithManySpaces = '<someField>someValue</someField>    ';
      expect(checker['lineHasTrailingWhitespace'](lineWithOneSpace)).to.equal(true);
      expect(checker['lineHasTrailingWhitespace'](lineWithManySpaces)).to.equal(true);
    });

    it('should return true when there are tabs at the end of a line', () => {
      const checker = new LwcMetadataChecker(null);
      const lineWithTabs = '<someField>someValue</someField>		';
      expect(checker['lineHasTrailingWhitespace'](lineWithTabs)).to.equal(true);
    });

    it('should return true when there are non-breaking spaces at the end of a line', () => {
      const checker = new LwcMetadataChecker(null);
      const lineWithNbsp = '<someField>someValue</someField>' + decodeURIComponent('%C2%A0');
      expect(checker['lineHasTrailingWhitespace'](lineWithNbsp)).to.equal(true);
    });

    it('should return false when there is no whitespace at the end of a line', () => {
      const checker = new LwcMetadataChecker(null);
      const lineWithNoWhitespace = '<someField>someValue</someField>';
      const lineWithLeadingWhitespace = '    <someField>someValue</someField>';
      expect(checker['lineHasTrailingWhitespace'](lineWithNoWhitespace)).to.equal(false);
      expect(checker['lineHasTrailingWhitespace'](lineWithLeadingWhitespace)).to.equal(false);
    });
  });
});
