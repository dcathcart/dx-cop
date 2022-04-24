import * as fs from 'fs';
import 'mocha';
import { expect } from 'chai';
// import * as sinon from 'sinon';
import Check from '../../commands/dxcop/source/check';

describe('dxcop:source:check command', () => {
  describe('.loadConfig()', () => {
    it('should load config from .dxcoprc file if it exists', () => {
      fs.copyFileSync('src/test/commands/sample.dxcoprc', '.dxcoprc');
      const checkCommand = new Check([], null);
      const config = checkCommand['loadConfig']();
      expect(config.ruleSets.emailToCaseSettings.enabled).to.equal(false);
      expect(config.ruleSets.recordTypePicklistValues.enabled).to.equal(true);
    });

    it('should load default config if no config file exists', () => {
      fs.rmSync('.dxcoprc');
      const checkCommand = new Check([], null);
      const config = checkCommand['loadConfig']();
      expect(config.ruleSets.emailToCaseSettings.enabled).to.equal(true);
      expect(config.ruleSets.recordTypePicklistValues.enabled).to.equal(true);
    });
  });
});
