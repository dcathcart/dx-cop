import * as fs from 'fs';
import 'mocha';
import { expect } from 'chai';
import Check from '../../commands/dxcop/source/check';

describe('dxcop:source:check command', () => {
  describe('.loadConfig()', () => {
    context('when a .dxcoprc config file exists', () => {
      before(() => {
        fs.copyFileSync('src/test/commands/sample.dxcoprc', '.dxcoprc');
      });

      it('should load config from the file', () => {
        fs.copyFileSync('src/test/commands/sample.dxcoprc', '.dxcoprc');
        const checkCommand = new Check([], null);
        const config = checkCommand['loadConfig']();
        expect(config.ruleSets.emailToCaseSettings.enabled).to.equal(false);
        expect(config.ruleSets.recordTypePicklistValues.enabled).to.equal(true);
      });

      after(() => {
        fs.rmSync('.dxcoprc');
      });
    });
    context('when there is no .dxcoprc config file', () => {
      it('should load the default config', () => {
        const checkCommand = new Check([], null);
        const config = checkCommand['loadConfig']();
        expect(config.ruleSets.emailToCaseSettings.enabled).to.equal(true);
        expect(config.ruleSets.recordTypePicklistValues.enabled).to.equal(true);
      });
    });
  });

  describe('.ruleSets()', () => {
    it('should create a ruleset object for each ruleset enabled in the (default) config', () => {
      const checkCommand = new Check([], null);
      const ruleSets = checkCommand['ruleSets'](null);
      expect(ruleSets.length).to.equal(4);
    });
  });
});
