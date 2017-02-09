/// <reference types="chrome" />
/// <reference path="options.ts" />

class BlinkReminder {

  settings: BlinkReminderSettings = null;

  init (settings: BlinkReminderSettings): void {
      chrome.idle.setDetectionInterval(60);
      chrome.idle.onStateChanged.addListener(this.onStateChanged);
      chrome.alarms.create("reminder_alarm", {periodInMinutes: settings.remindInterval});
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
      chrome.alarms.create("reminder_alarm", {periodInMinutes: blinkReminder.settings.remindInterval});
    }
  }
  onAlarmFired (alarm: chrome.alarms.Alarm): void {
    console.log("alarm has fired");
    chrome.notifications.create("look_away", {type: "basic", title: "Blink Reminder", message: "Look away from the monitor."})
  }
  loadSettings (): void {
    chrome.storage.local.get({
      remindInterval: 20,
      breakInterval: 60,
      breakDuration: 10
    }, (s: BlinkReminderSettings) =>{
      if (!chrome.runtime.lastError){
        blinkReminder.settings = s;
        blinkReminder.init(s);
      } else {
        console.error("Error loading settings ".concat(chrome.runtime.lastError.message));
      }
    });
  }
}


const blinkReminder: BlinkReminder = new BlinkReminder();
blinkReminder.loadSettings();
