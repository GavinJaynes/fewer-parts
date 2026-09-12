from pathlib import Path
import re

patterns = (Path(__file__).parent / 'reference-examples.md').read_text(encoding='utf-8')
card, field = re.findall(r'```html\n(.*?)\n```', patterns, re.S)
long_card = card.replace('Content can grow without widening the surrounding layout.', 'Long content: ' + 'very-long-unbroken-text-' * 24)
base_field = field.replace(' supports-[field-sizing:content]:field-sizing-content', '').replace('message', 'fallback-message')
html = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Modern Web UI draft checks</title><link rel="stylesheet" href="/output.css"></head>
<body class="bg-slate-50 p-6 text-slate-950"><main class="space-y-8">
<h1 class="text-2xl font-semibold">Modern Web UI draft checks</h1>
<section aria-label="Card layouts" class="flex flex-wrap gap-6">
<div style="width:300px;max-width:100%">''' + long_card + '''</div>
<div style="width:720px;max-width:100%">''' + card + '''</div></section>
<section aria-label="Native textarea" class="max-w-xl">''' + field + '''</section>
<section aria-label="Base textarea" class="max-w-xl">''' + base_field + '''</section>
<section aria-label="Confirmation dialog">
<button type="button" id="open-dialog" class="rounded bg-brand-600 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2">Archive item</button>
<p role="status" id="status">Archived: 0</p>
<dialog id="confirm-dialog" aria-labelledby="confirm-title" class="m-auto max-w-md rounded-xl border bg-white p-6 backdrop:bg-black/30">
<h2 id="confirm-title" class="text-xl font-semibold">Archive this item?</h2>
<p class="my-4 measure-copy">You can cancel without changing the item.</p>
<form method="dialog" class="flex gap-3">
<button autofocus value="cancel" class="rounded border px-3 py-2">Cancel</button>
<button value="confirm" class="rounded bg-brand-600 px-3 py-2 text-white">Confirm archive</button>
</form></dialog></section>
</main><script>
const opener = document.getElementById('open-dialog');
const dialog = document.getElementById('confirm-dialog');
let archiveCount = 0;
opener.addEventListener('click', () => { dialog.returnValue = ''; dialog.showModal(); });
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'confirm') {
    archiveCount += 1;
    document.getElementById('status').textContent = 'Archived: ' + archiveCount;
  }
  opener.focus();
});
</script></body></html>'''
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('Fixture generated from the two HTML examples; added a native dialog smoke check.')
