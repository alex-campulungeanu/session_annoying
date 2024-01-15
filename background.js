chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // since only one tab should be active and in the current window at once
    // the return variable should only have one entry
    var activeTab = tabs[0];
    var activeUrl = activeTab.url;
    var badgeInfo = {
      text: 'OFF',
      color: '#F00',
      icon: 'cokie_inactive.png',
      isEnabled: false
    }

    if (activeUrl.includes("https://giant1.shared.sp.vodafone.com/apex/")) {
      badgeInfo.text = "ON"
      badgeInfo.color = 'green'
      badgeInfo.icon = 'cokie_active.jpg'
      badgeInfo.isEnabled = true
    } else {
      badgeInfo.text = "OFF"
      badgeInfo.color = 'red'
      badgeInfo.icon = 'cokie_inactive.png'
      badgeInfo.isEnabled = false
    }
    chrome.action.setIcon({ path: `/images/${badgeInfo.icon}`});

  });
});

