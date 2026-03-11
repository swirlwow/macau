// submit.js

/**
 * 提交訂單到 Apps Script，可使用 GET 方法與原後端兼容
 * @param {string} execUrl - Apps Script Exec URL
 * @param {object} data - 要傳送的資料物件
 * @returns {Promise<object>} 回傳後端 JSON 解析後的物件
 */
export async function submitOrder(execUrl, data) {
  // 使用 GET，與後端 doGet 保持兼容
  const query = new URLSearchParams(data).toString();
  const url = `${execUrl}?${query}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.message || '提交失敗');
  }
  return json;
}
