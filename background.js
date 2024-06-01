const socialMediaSites = ["facebook.com", "twitter.com", "instagram.com"];
const timeIntervals = {};
let siteTimers = {};
let activeSite = null;

//Listens to chrome alarms and closes the tab
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("limit-")) {
    let site = alarm.name.split("-")[1];
    createNotification(`Time's up! You've reached your time limit on ${site}.`);
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        if (new URL(tab.url).hostname.includes(site)) {
          chrome.tabs.remove(tab.id);
        }
      }
    });
  }
});

//Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    handleTab(tab);
  });
});

//checks if the updated tab is a social media site
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTab(tab);
  }
});

function handleTab(tab) {
  if (tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname;
    console.log("I'm working");
    //Funtion for social media site
    let isSocialMediaSite = false;
    for (let site of socialMediaSites) {
      if (hostname.includes(site)) {
        isSocialMediaSite = true;
        // If the active site changes, stop the timer for the previous site
        if (activeSite !== site) {
          stopActiveTimer(activeSite);
          chrome.alarms.clear(`limit-${activeSite}`);
          siteTimers[activeSite] = 0;
        }
        activeSite = site;
        //gets the limit of a site from storage
        chrome.storage.sync.get(["siteLimits"], (result) => {
          const { siteLimits } = result || {};
          let limit = siteLimits[site] || 30;
          if (!siteTimers[site]) {
            siteTimers[site] = 0;
          }
          if (tab.active) {
            startTimer(site, limit);
          }
        });
        break;
      }
    }

    // If the tab is not a social media site, stop any active timer
    if (!isSocialMediaSite && activeSite) {
      stopActiveTimer(activeSite);
      chrome.alarms.clear(`limit-${activeSite}`);
      activeSite = null;
    }
  }
}

function startTimer(site, limit) {
  if (timeIntervals[site]) {
    clearInterval(timeIntervals[site]);
  }
  timeIntervals[site] = setInterval(() => {
    siteTimers[site]++;
    console.log(`Time spent on ${site}: ${siteTimers[site]} minutes`);
    if (siteTimers[site] >= limit) {
      chrome.alarms.create(`limit-${site}`, { delayInMinutes: 0 });
      stopActiveTimer(site);
    }
  }, 10000); // Increment every minute
}

function stopActiveTimer(site) {
  clearInterval(timeIntervals[site]);
  delete timeIntervals[site];//delete the property
}

//function to create chrome notification
function createNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Social Media Time Limiter",
    message: message,
  });
}
