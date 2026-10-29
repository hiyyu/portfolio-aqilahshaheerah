#!/usr/bin/env python3
"""Embed your own .ttf / .otf / .woff2 / .woff fonts into the portfolio page.

Usage:
  python embed_fonts.py portfolio_fonts.html --hand MyHandwriting.ttf --serif MyHeading.otf

  --hand   font for body text, greeting, dialogs   (optional)
  --serif  font for your name and section headings (optional)
Output: portfolio_final.html (same folder). Re-run any time to swap fonts.
"""
import argparse, base64, os, re, sys

KINDS = {'.ttf': ('font/ttf', 'truetype'), '.otf': ('font/otf', 'opentype'),
         '.woff': ('font/woff', 'woff'), '.woff2': ('font/woff2', 'woff2')}

def face(name, path):
    ext = os.path.splitext(path)[1].lower()
    if ext not in KINDS: sys.exit(f'Unsupported font type: {ext}')
    mime, fmt = KINDS[ext]
    b64 = base64.b64encode(open(path, 'rb').read()).decode()
    return (f"@font-face{{font-family:'{name}';src:url(data:{mime};base64,{b64}) "
            f"format('{fmt}');font-weight:100 900;font-display:swap;}}")

ap = argparse.ArgumentParser()
ap.add_argument('html'); ap.add_argument('--hand'); ap.add_argument('--serif')
ap.add_argument('--out', default='portfolio_final.html')
a = ap.parse_args()
s = open(a.html, encoding='utf-8').read()
for tag, name, path in (('HAND', 'MyHand', a.hand), ('SERIF', 'MySerif', a.serif)):
    if path:
        pat = re.compile(rf'/\*{tag}_FONT_START\*/.*?/\*{tag}_FONT_END\*/', re.S)
        if not pat.search(s): sys.exit(f'Markers for {tag} not found in {a.html}')
        s = pat.sub(lambda m: f'/*{tag}_FONT_START*/\n{face(name, path)}\n/*{tag}_FONT_END*/', s)
open(a.out, 'w', encoding='utf-8').write(s)
print('Done ->', a.out, f'({os.path.getsize(a.out)/1e6:.1f} MB)')
