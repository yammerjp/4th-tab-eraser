// デフォルトの設定値
const DEFAULT_SETTINGS = {
  maxTabs: 5,
  maxWindows: 5
};

// 設定を初期化
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
});

// タブの更新を監視
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    await manageTabs();
  }
});

// タブの作成を監視
chrome.tabs.onCreated.addListener(async () => {
  await manageTabs();
});

// ウィンドウの作成を監視
chrome.windows.onCreated.addListener(async () => {
  await manageWindows();
});

// タブの管理
async function manageTabs() {
  const { settings } = await chrome.storage.sync.get('settings');
  const windows = await chrome.windows.getAll({ populate: true });
  
  // 各ウィンドウのタブ数を確認
  for (const window of windows) {
    if (!window.tabs) {
      continue;
    }
    // ピン留めされていないタブのみをフィルタリング
    const unpinnedTabs = window.tabs.filter(tab => !tab.pinned);
    
    if (unpinnedTabs.length > settings.maxTabs) {
      // 最も古いピン留めされていないタブを閉じる
      const oldestTab = unpinnedTabs.reduce((oldest, current) => {
        return current.id < oldest.id ? current : oldest;
      });
      
      if (oldestTab) {
        await chrome.tabs.remove(oldestTab.id);
      }
    }
  }
}

// ウィンドウの管理
async function manageWindows() {
  const { settings } = await chrome.storage.sync.get('settings');
  const windows = await chrome.windows.getAll({ populate: true });
  
  // ピン留めされたタブを含まないウィンドウのみを対象にする
  const closableWindows = [];
  for (const window of windows) {
    if (!window.tabs) {
      continue;
    }
    const hasPinnedTab = window.tabs.some(tab => tab.pinned);
    if (!hasPinnedTab) {
      closableWindows.push(window);
    }
  }

  if (closableWindows.length > settings.maxWindows) {
    // 最も古いウィンドウを閉じる
    const oldestWindow = closableWindows.reduce((oldest, current) => {
      return current.id < oldest.id ? current : oldest;
    });
    
    if (oldestWindow) {
      await chrome.windows.remove(oldestWindow.id);
    }
  }
} 