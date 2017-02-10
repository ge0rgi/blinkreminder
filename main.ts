/// <reference types="chrome" />
/// <reference path="options.ts" />

class BlinkReminder {

  settings: BlinkReminderSettings = null;
  timeWithoutBreak: number = 0;
  inactiveSince: number = 0;


  init (settings: BlinkReminderSettings): void {
      chrome.idle.setDetectionInterval(60);
      chrome.storage.onChanged.addListener(this.onSettingsChanged);
      chrome.idle.onStateChanged.addListener(this.onStateChanged);
      chrome.alarms.create("reminder_alarm", {periodInMinutes: settings.remindInterval});
      chrome.alarms.onAlarm.addListener(this.onAlarmFired);
      
  }
  onStateChanged (newState: string): void {
    let now: Date = new Date();
    console.log(blinkReminder.getTimeForLogging().concat(": state change, new state ", newState));
    if (newState != "active"){
      blinkReminder.inactiveSince = now.getTime();
      chrome.alarms.clearAll();
    } else if (newState == "active") {
      let diff: number = blinkReminder.inactiveSince - now.getTime();
      if (diff >= 10*60*1000){
        console.log(blinkReminder.getTimeForLogging().concat(": away for ", (diff / 1000).toString(), "s reseting break timer"));
        blinkReminder.timeWithoutBreak = 0;
      }
      chrome.alarms.create("reminder_alarm", {periodInMinutes: blinkReminder.settings.remindInterval});
    }
  }
  onAlarmFired (alarm: chrome.alarms.Alarm): void {
    if (alarm.name == "reminder_alarm"){
      blinkReminder.timeWithoutBreak += blinkReminder.settings.remindInterval;
      if (blinkReminder.timeWithoutBreak >= blinkReminder.settings.breakInterval){
        console.log(blinkReminder.getTimeForLogging().concat(": long break, without break since ",  blinkReminder.timeWithoutBreak.toString(), " minutes" ));
        chrome.notifications.create("look_away", {type: "basic", title: "Blink Reminder", iconUrl:"icons/eye-open64.png",
                                    message: "Take a break for ".concat(blinkReminder.settings.breakDuration.toString(), " minutes")});
        chrome.alarms.clear("reminder_alarm");
        chrome.alarms.create("break_end_alarm", {delayInMinutes: blinkReminder.settings.breakDuration});
      } else {
          console.log(blinkReminder.getTimeForLogging().concat(": short break, without break since ",  blinkReminder.timeWithoutBreak.toString(), " minutes" ));
          chrome.notifications.create("look_away", {type: "basic", title: "Blink Reminder", iconUrl:"icons/eye-open64.png",
                                      message: "Look away from the monitor."});
      }
    } else if (alarm.name == "break_end_alarm"){
      console.log(blinkReminder.getTimeForLogging().concat(": end of long break"));
      blinkReminder.timeWithoutBreak = 0;
      chrome.alarms.create("reminder_alarm", {periodInMinutes: blinkReminder.settings.remindInterval});
    }

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
  onSettingsChanged (change: {[key: string]: chrome.storage.StorageChange} , area: string): void {
    chrome.alarms.clearAll();
    blinkReminder.settings.remindInterval = change["remindInterval"].newValue;
    blinkReminder.settings.breakInterval = change["breakInterval"].newValue;
    blinkReminder.settings.breakDuration = change["breakDuration"].newValue;
    chrome.alarms.create("reminder_alarm", {periodInMinutes: blinkReminder.settings.remindInterval});

  }
  getTimeForLogging (): string {
    let now: Date = new Date();
    let hours: string = now.getHours() > 9 ? now.getHours().toString(): "0" + now.getHours().toString();
    let minutes: string = now.getMinutes() > 9 ? now.getMinutes().toString(): "0" + now.getMinutes().toString();
    return "[".concat(hours, ":", minutes, "]");
  }
}


const blinkReminder: BlinkReminder = new BlinkReminder();
blinkReminder.loadSettings();
