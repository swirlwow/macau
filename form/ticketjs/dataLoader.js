// dataLoader.js

/**
 * 载入最新的 tickets.json，附带 cache-bust 参数并禁用缓存
 * @param {string} url - JSON 资源路径
 */
export async function loadTicketData(url = 'tickets.json') {
  // 方法一：给 URL 加时间戳
  const cacheBustedUrl = `${url}?v=${Date.now()}`;

  // 方法二：fetch 的 cache 选项（部分老浏览器可能不支持）
  const res = await fetch(cacheBustedUrl, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`載入票券資料失敗：${res.status}`);
  }
  return await res.json();
}
