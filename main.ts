/// <reference path="node_modules/@types/chrome/index.d.ts" />

class BlinkReminder {

  lastestState: string

  init (): void {
      chrome.idle.setDetectionInterval(60);
      chrome.idle.onStateChanged.addListener(this.onStateChanged);
  }
  onStateChanged (newState: string): void {
    let now: Date = new Date();
    let hours: string = now.getHours() > 9 ? now.getHours().toString(): "0" + now.getHours().toString();
    let minutes: string = now.getMinutes() > 9 ? now.getMinutes().toString(): "0" + now.getMinutes().toString();
    console.log("[".concat(hours, ":", minutes, "]", ": state change, new state ", newState));
  }
}


const blinkReminder: BlinkReminder = new BlinkReminder();
blinkReminder.init();
