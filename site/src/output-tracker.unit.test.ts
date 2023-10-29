import { EventEmitter } from 'stream';
import { describe, it, expect, beforeEach } from 'vitest';
import { OutputTracker } from './output-tracker';

describe('OutputTracker', () => {
  const testEvent = 'foo';
  let testEmitter: EventEmitter;

  beforeEach(() => {
    testEmitter = new EventEmitter();
  });

  it('should track events', () => {
    const tracker = new OutputTracker<string>(testEmitter, testEvent);

    testEmitter.emit(testEvent, 'bar');
    testEmitter.emit(testEvent, 'baz');

    expect(tracker.data).toEqual(['bar', 'baz']);
  });

  it('should clear events', () => {
    const tracker = new OutputTracker<string>(testEmitter, testEvent);

    testEmitter.emit(testEvent, 'bar');
    testEmitter.emit(testEvent, 'baz');
    tracker.clear();

    expect(tracker.data).toEqual([]);
  });

  it('should stop tracking', () => {
    const tracker = new OutputTracker<string>(testEmitter, testEvent);

    tracker.stop();
    testEmitter.emit(testEvent, 'bar');

    expect(tracker.data).toEqual([]);
  });
});
