// デフォルトの設定値
const DEFAULT_SETTINGS = {
  maxTabs: 5,
  maxWindows: 5
};

// 設定を初期化
browser.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed or updated');
  await browser.storage.sync.set({ settings: DEFAULT_SETTINGS });
  console.log('Default settings initialized');
});

// タブの更新を監視
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log('Tab updated:', tabId, changeInfo);
  if (changeInfo.status === 'complete') {
    await manageTabs();
  }
});

// タブの作成を監視
browser.tabs.onCreated.addListener(async (tab) => {
  console.log('Tab created:', tab.id);
  await manageTabs();
});

// ウィンドウの作成を監視
browser.windows.onCreated.addListener(async (window) => {
  console.log('Window created:', window.id);
  await manageWindows();
});

// タブの管理
async function manageTabs() {
  console.log('Managing tabs...');
  const { settings } = await browser.storage.sync.get('settings');
  console.log('Current settings:', settings);
  const windows = await browser.windows.getAll({ populate: true });
  console.log('Windows:', windows);
  
  // 各ウィンドウのタブ数を確認
  for (const window of windows) {
    if (!window.tabs) {
      continue;
    }

    // ピン留めされていないタブのみをフィルタリング
    const unpinnedTabs = window.tabs.filter(tab => !tab.pinned);
    
    if (unpinnedTabs.length > settings.maxTabs) {
      console.log('Window has too many unpinned tabs:', window.id, unpinnedTabs.length);
      
      // 最も古いピン留めされていないタブを閉じる
      const oldestTab = unpinnedTabs.reduce((oldest, current) => {
        return current.id < oldest.id ? current : oldest;
      });
      
      if (oldestTab) {
        console.log('Closing oldest unpinned tab:', oldestTab.id);
        await browser.tabs.remove(oldestTab.id);
      }
    }
  }
}

// ウィンドウの管理
async function manageWindows() {
  console.log('Managing windows...');
  const { settings } = await browser.storage.sync.get('settings');
  console.log('Current settings:', settings);
  const windows = await browser.windows.getAll({ populate: true });
  console.log('Windows:', windows);
  
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
    console.log('Too many windows without pinned tabs:', closableWindows.length);
    // 最も古いウィンドウを閉じる
    const oldestWindow = closableWindows.reduce((oldest, current) => {
      return current.id < oldest.id ? current : oldest;
    });
    
    if (oldestWindow) {
      console.log('Closing oldest window:', oldestWindow.id);
      await browser.windows.remove(oldestWindow.id);
    }
  }
} 