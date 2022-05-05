import 'mocha';
import * as path from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { LightningComponentBundle } from '../../metadata_browser/lightningComponentBundle';
import { SfdxProjectBrowser } from '../../metadata_browser/sfdxProjectBrowser';
import { LwcMetadataRuleset } from '../../ruleset/lwcMetadataRuleset';

describe('LwcMetadataRuleset', () => {
  // Regression test. Uses carefully crafted sample XML files to test the object at a high level.
  // Tests every method in the class, but only lightly.
  describe('.run() method', () => {
    it('should return an array of metadata problems', () => {
      const lwcBundles = [
        new LightningComponentBundle('src/test/fixtures/lwc/BadExample'),
        new LightningComponentBundle('src/test/fixtures/lwc/GoodExample'),
      ];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcBundles').once().returns(lwcBundles);

      const ruleset = new LwcMetadataRuleset(sfdxProjectBrowser);
      const result = ruleset.run();
      expect(result.length).to.equal(1);
      mockProjectBrowser.verify();
    });

    it('should return an empty array when there are no problems', () => {
      const lwcBundles = [new LightningComponentBundle('src/test/fixtures/lwc/GoodExample')];
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      const mockProjectBrowser = sinon.mock(sfdxProjectBrowser);
      mockProjectBrowser.expects('lwcBundles').once().returns(lwcBundles);

      const ruleset = new LwcMetadataRuleset(sfdxProjectBrowser);
      const result = ruleset.run();
      expect(result.length).to.equal(0);
      mockProjectBrowser.verify();
    });
  });

  describe('.trailingWhitespaceWarnings()', () => {
    it('should return a metadata warning when there is trailing whitespace', () => {
      const lwcBundles = [
        new LightningComponentBundle('src/test/fixtures/lwc/GoodExample'),
        new LightningComponentBundle('src/test/fixtures/lwc/BadExample'),
      ];
      const ruleset = new LwcMetadataRuleset(null);
      // mock out the calls to .fileHasTrailingWhitespace(); make it look like one no, one yes
      const mock = sinon.mock(ruleset);
      mock.expects('fileHasTrailingWhitespace').once().returns(false);
      mock.expects('fileHasTrailingWhitespace').once().returns(true);

      const results = ruleset['trailingWhitespaceWarnings'](lwcBundles);

      // Expect one metadata warning. Check all the properties of the warning object; covers .trailingWhitespaceWarning() as well
      expect(results.length).to.equal(1);
      expect(results[0].componentName).to.equal('BadExample');
      expect(results[0].componentType).to.equal('LightningComponentBundle');
      expect(results[0].fileName).to.equal(path.normalize('src/test/fixtures/lwc/BadExample/BadExample.js-meta.xml'));
      expect(results[0].problem).to.equal(
        'Whitespace characters detected at the end of one or more lines in .js-meta.xml'
      );
      expect(results[0].problemType).to.equal('Warning');
      mock.verify();
    });
  });

  describe('.fileHasTrailingWhitespace()', () => {
    it('should return true when there is whitespace at the end of one or more lines', () => {
      const ruleset = new LwcMetadataRuleset(null);
      const result = ruleset['fileHasTrailingWhitespace']('src/test/fixtures/lwc/BadExample/BadExample.js-meta.xml');
      expect(result).to.equal(true);
    });

    it('should return false when there is no trailing whitespace', () => {
      const ruleset = new LwcMetadataRuleset(null);
      const result = ruleset['fileHasTrailingWhitespace']('src/test/fixtures/lwc/GoodExample/GoodExample.js-meta.xml');
      expect(result).to.equal(false);
    });
  });

  describe('.lineHasTrailingWhitespace()', () => {
    it('should return true when there are one or more spaces at the end of a line', () => {
      const ruleset = new LwcMetadataRuleset(null);
      const lineWithOneSpace = '<someField>someValue</someField> ';
      const lineWithManySpaces = '<someField>someValue</someField>    ';
      expect(ruleset['lineHasTrailingWhitespace'](lineWithOneSpace)).to.equal(true);
      expect(ruleset['lineHasTrailingWhitespace'](lineWithManySpaces)).to.equal(true);
    });

    it('should return true when there are tabs at the end of a line', () => {
      const ruleset = new LwcMetadataRuleset(null);
      const lineWithTabs = '<someField>someValue</someField>		';
      expect(ruleset['lineHasTrailingWhitespace'](lineWithTabs)).to.equal(true);
    });

    it('should return true when there are non-breaking spaces at the end of a line', () => {
      const ruleset = new LwcMetadataRuleset(null);
      const lineWithNbsp = '<someField>someValue</someField>' + decodeURIComponent('%C2%A0');
      expect(ruleset['lineHasTrailingWhitespace'](lineWithNbsp)).to.equal(true);
    });

    it('should return false when there is no whitespace at the end of a line', () => {
      const ruleset = new LwcMetadataRuleset(null);
      const lineWithNoWhitespace = '<someField>someValue</someField>';
      const lineWithLeadingWhitespace = '    <someField>someValue</someField>';
      expect(ruleset['lineHasTrailingWhitespace'](lineWithNoWhitespace)).to.equal(false);
      expect(ruleset['lineHasTrailingWhitespace'](lineWithLeadingWhitespace)).to.equal(false);
    });
  });
});
