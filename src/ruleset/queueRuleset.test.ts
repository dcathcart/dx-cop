import 'mocha';
import { expect } from 'chai';
import sinon = require('sinon');
import { SfdxProjectBrowser } from '../metadata_browser/sfdxProjectBrowser';
import { Queue } from '../metadata_browser/queue';
import { QueueRuleset } from './queueRuleset';

describe('QueueRuleset', () => {
  describe('.run()', () => {
    const queueWithNoMembers = new Queue('src/test/metadata/queues/Queue_With_No_Members.queue-meta.xml');
    const queueWithUsers = new Queue('src/test/metadata/queues/Queue_With_Users.queue-meta.xml');

    it('returns a warning if a queue has users', () => {
      const sfdxProjectBrowser = new SfdxProjectBrowser(null);
      sinon.stub(sfdxProjectBrowser, 'queues').returns([queueWithNoMembers, queueWithUsers]);

      const ruleset = new QueueRuleset(sfdxProjectBrowser);
      const results = ruleset.run();

      expect(results.length).to.equal(1);
      expect(results[0].problem).to.equal('Users should not be direct members of queues');
    });
  });
});
