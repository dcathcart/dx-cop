import { Queue } from '../metadata_browser/queue';
import { MetadataProblem, MetadataWarning } from './metadataProblem';
import { MetadataRuleset } from './metadataRuleset';

export class QueueRuleset extends MetadataRuleset {
  public displayName = 'Queues';

  public run(): MetadataProblem[] {
    const queues = this.sfdxProjectBrowser.queues();
    return queues.map((q) => this.queueProblems(q)).flat();
  }

  private queueProblems(queue: Queue): MetadataProblem[] {
    if (queue.queueMembers().users().length > 0) {
      return [this.queueHasUsersWarning(queue)];
    }
    return [];
  }

  private queueHasUsersWarning(queue: Queue): MetadataWarning {
    const message = 'Users should not be direct members of queues';
    return new MetadataWarning(queue.name, 'Queue', queue.fileName, message);
  }
}
