import { ContentEvent } from "@/entrypoints/content/events";

export class RequestManager {
  constructor() {
    if (new.target === RequestManager) {
      Object.freeze(this);
    }
  }

  #requestId = 0;
  #resolvers: { [requestId: number]: [any, any] } = {};

  addResolver<T extends ContentEvent | void>() {
    const requestId = this.#requestId++;
    let resolve, reject;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this.#resolvers[requestId] = [resolve, reject];
    return { requestId, promise };
  }

  resolve(event: ContentEvent) {
    const requestId = event.requestId;
    const [resolve, reject] = this.#resolvers[requestId];
    // TODO: add error handling, we should be able to reject too - on some basis
    resolve(event);
  }
}
