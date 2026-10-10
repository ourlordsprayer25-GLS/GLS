async function testUrls() {
  const urls = [
    'https://ourlordsprayer25-gls.github.io/GLS/',
    'https://ourlordsprayer25-GLS.github.io/GLS/',
    'https://ourlordsprayer25-gls.github.io/',
    'https://ourlordsprayer25-GLS.github.io/',
    'https://www.gladyns.store/',
    'https://gladyns.store/'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
      console.log(url, '-> Status:', res.status, res.headers.get('location') || '');
    } catch (e) {
      console.log(url, '-> Error:', e.message);
    }
  }
}
testUrls();
