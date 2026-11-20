type EmitterCallback = (...args: unknown[]) => void;

export class EventEmitter {
  private events: { [eventName: string]: EmitterCallback[] } = {};

  on(event: string, callback: EmitterCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EmitterCallback): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter((registered) => registered !== callback);
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((callback) => callback(...args));
  }
}
