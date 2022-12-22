import {
  AnyJson,
  getJsonArray,
  getJsonMap,
  getString,
  hasJsonArray,
  hasJsonMap,
  hasString,
} from '@salesforce/ts-types';
import { MetadataComponent } from './metadataComponent';

export class Queue extends MetadataComponent {
  protected readonly fileExtension = 'queue';
  protected readonly metadataType = 'Queue';

  public queueMembers(): QueueMembers {
    return new QueueMembers(getJsonMap(this.metadata, 'queueMembers'));
  }
}

export class QueueMembers {
  private readonly metadata: AnyJson;

  public constructor(metadata: AnyJson) {
    this.metadata = metadata;
  }

  // Return an array of usernames, for users that are direct members of the queue (or empty array if no users)
  public users(): string[] {
    if (hasJsonMap(this.metadata, 'users')) {
      const users = getJsonMap(this.metadata, 'users');

      if (hasJsonArray(users, 'user')) {
        return getJsonArray(users, 'user').map((u) => u.toString());
      } else if (hasString(users, 'user')) {
        return [getString(users, 'user').toString()];
      }
    }

    return [];
  }
}
