document.addEventListener("DOMContentLoaded", function() {
  const socialMediaSites = ["facebook.com", "twitter.com", "instagram.com"];
  const inputs = {};
  socialMediaSites.forEach((site) => {
    inputs[site] = document.getElementById(site.split(".")[0]);
  });

  //gets the chrome local storage
  chrome.storage.sync.get(["siteLimits"], (result) => {
    const siteLimits = result.siteLimits || {};
    socialMediaSites.forEach((site) => {
      inputs[site].value = siteLimits[site] || 30; // Default to 30 minutes if not set
    });
  });

  //update new site limit to chrome local storage
  document.getElementById("save").addEventListener("click", () => {
    const siteLimits = {};
    socialMediaSites.forEach((site) => {
      siteLimits[site] = parseInt(inputs[site].value, 10);
    });
    chrome.storage.sync.set({ siteLimits }, () => {
      alert("Time limit saved");
    });
  });

  //clear thr chrome local storage and resets the timer
  document.getElementById("reset").addEventListener("click", () => {
    chrome.storage.sync.remove(["siteLimits"], () => {
      const siteLimits = {};
      socialMediaSites.forEach((site) => {
        inputs[site].value = 30;
        siteLimits[site] = parseInt(inputs[site].value, 10);
      });
      chrome.storage.sync.set({ siteLimits });
      alert("Time limit reset");
    });
  });
});
