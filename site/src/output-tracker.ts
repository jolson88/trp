import EventEmitter from 'node:events';

export class OutputTracker<T> {
  private trackedData: Array<T>;
  private trackerFn: (T) => void;

  public constructor(
    private emitter: EventEmitter,
    private event: string
  ) {
    this.trackedData = [];
    this.trackerFn = (eventObject) => {
      this.trackedData.push(eventObject);
    };

    this.emitter.on(event, this.trackerFn);
  }

  get data(): Array<T> {
    return this.trackedData;
  }

  public clear() {
    this.trackedData = [];
  }

  public stop() {
    this.emitter.off(this.event, this.trackerFn);
  }
}
