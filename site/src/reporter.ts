import EventEmitter from 'node:events';
import { OutputTracker } from './output-tracker';

export type ReportLevel = 'warning' | 'error';

export interface Report {
  level: ReportLevel;
  message: string;
}

export class Reporter {
  private emitter = new EventEmitter();

  public static ReportEvent = 'report';

  public constructor() {}

  public report(level: ReportLevel, message: string) {
    this.emitter.emit(Reporter.ReportEvent, { level, message });
  }

  public trackReports(): OutputTracker<Report> {
    return new OutputTracker(this.emitter, Reporter.ReportEvent);
  }
}
