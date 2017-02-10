/// <reference types="chrome" />

interface BlinkReminderSettings {
  remindInterval: number;
  breakInterval: number;
  breakDuration: number;
}

interface GetSettingsCallback {
  (settings: BlinkReminderSettings): void
}


 function loadOptions (): void {
  chrome.storage.local.get({
    remindInterval: 20,
    breakInterval: 60,
    breakDuration: 10
  }, optionsLoaded)
}

function optionsLoaded (settting: BlinkReminderSettings) {
  (<HTMLInputElement>document.querySelector("#remindInterval")).value = settting.remindInterval.toString();
  (<HTMLInputElement>document.querySelector("#breakInterval")).value = settting.breakInterval.toString();
  (<HTMLInputElement>document.querySelector("#breakDuration")).value = settting.breakDuration.toString();
}

function saveOptions () {
  console.log("saving settings");
  let newSettings: BlinkReminderSettings = {
    remindInterval: parseInt ((<HTMLInputElement>document.querySelector("#remindInterval")).value, 10),
    breakInterval: parseInt ((<HTMLInputElement>document.querySelector("#breakInterval")).value, 10),
    breakDuration:  parseInt ((<HTMLInputElement>document.querySelector("#breakDuration")).value, 10)
  }
  chrome.storage.local.set(newSettings, settingSavedCallback);
}

function settingSavedCallback () {
  if (chrome.runtime.lastError){
    console.error("Error saving settings ".concat(chrome.runtime.lastError.message));
  } else {
    console.log("Settings saved");
  }
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#settingsForm").addEventListener("submit", saveOptions);
});
