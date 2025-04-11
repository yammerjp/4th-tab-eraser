document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  // 設定を読み込む
  const { settings } = await browser.storage.sync.get('settings');
  console.log('Loaded settings:', settings);
  document.getElementById('maxTabs').value = settings.maxTabs;
  document.getElementById('maxWindows').value = settings.maxWindows;

  // 設定を保存
  document.getElementById('saveSettings').addEventListener('click', async () => {
    console.log('Save button clicked');
    const maxTabs = parseInt(document.getElementById('maxTabs').value);
    const maxWindows = parseInt(document.getElementById('maxWindows').value);

    if (isNaN(maxTabs) || isNaN(maxWindows) || maxTabs < 1 || maxWindows < 1) {
      console.log('Invalid input values');
      alert('有効な数値を入力してください');
      return;
    }

    console.log('Saving settings:', { maxTabs, maxWindows });
    await browser.storage.sync.set({
      settings: {
        maxTabs,
        maxWindows
      }
    });
    console.log('Settings saved');

    alert('設定を保存しました');
  });
}); 