async function checkSize() {
  const jsRes = await fetch('https://www.gladyns.store/assets/index-D9iH_94w.js');
  const text = await jsRes.text();
  console.log('Live bundle size:', Math.round(text.length / 1024), 'KB');
  
  // Check if Supabase URL is inside the bundle
  const hasUrl = text.includes('objlslsagvfbhiddwsbz.supabase.co');
  console.log('Includes correct Supabase URL:', hasUrl);

  // Check how fetchProductsFast is implemented in the live bundle
  const rpcIdx = text.indexOf('get_store_products');
  console.log('Has get_store_products RPC:', rpcIdx !== -1);

  // Check if timeout exists
  const timeoutIdx = text.indexOf('setTimeout');
  console.log('Has timeout:', timeoutIdx !== -1);
}
checkSize();
