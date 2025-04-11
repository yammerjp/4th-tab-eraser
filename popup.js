document.addEventListener('DOMContentLoaded', async () => {
  // 設定を読み込む
  const { settings } = await chrome.storage.sync.get('settings');
  document.getElementById('maxTabs').value = settings.maxTabs;
  document.getElementById('maxWindows').value = settings.maxWindows;

  // 設定を保存
  document.getElementById('saveSettings').addEventListener('click', async () => {
    const maxTabs = parseInt(document.getElementById('maxTabs').value);
    const maxWindows = parseInt(document.getElementById('maxWindows').value);

    if (isNaN(maxTabs) || isNaN(maxWindows) || maxTabs < 1 || maxWindows < 1) {
      alert('有効な数値を入力してください');
      return;
    }

    await chrome.storage.sync.set({
      settings: {
        maxTabs,
        maxWindows
      }
    });

    alert('設定を保存しました');
  });
}); 