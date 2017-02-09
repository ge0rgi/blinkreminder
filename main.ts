/// <reference path="node_modules/@types/chrome/index.d.ts" />

class BlinkReminder {

  init (): void {
      chrome.idle.setDetectionInterval(60);
      chrome.idle.onStateChanged.addListener(this.onStateChanged);
      chrome.alarms.create("reminder_alarm", {periodInMinutes: 20});
      chrome.alarms.onAlarm.addListener(this.onAlarmFired);
  }
  onStateChanged (newState: string): void {
    let now: Date = new Date();
    let hours: string = now.getHours() > 9 ? now.getHours().toString(): "0" + now.getHours().toString();
    let minutes: string = now.getMinutes() > 9 ? now.getMinutes().toString(): "0" + now.getMinutes().toString();
    console.log("[".concat(hours, ":", minutes, "]", ": state change, new state ", newState));
    if (newState != "active"){
      chrome.alarms.clear("reminder_alarm");
    } else if (newState == "active") {
      chrome.alarms.create("reminder_alarm", {periodInMinutes: 20});
    }
  }
  onAlarmFired (alarm: chrome.alarms.Alarm){
    console.log("alarm has fired");
    chrome.notifications.create("look_away", {type: "basic", title: "Blink Reminder", message: "Look away from the monitor."})
  }
}


const blinkReminder: BlinkReminder = new BlinkReminder();
blinkReminder.init();
