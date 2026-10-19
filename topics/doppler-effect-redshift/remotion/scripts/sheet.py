"""contact sheet: python scripts/sheet.py out.jpg cols img1 img2 ... (labels = frame numbers)"""
import sys, re
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]
w, h = ims[0].size
tw = 480; th = int(h * tw / w)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * (th + 22)), (20, 10, 40))
d = ImageDraw.Draw(S)
for i, (im, fn) in enumerate(zip(ims, files)):
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    S.paste(im.resize((tw, th)), (x, y + 22))
    m = re.search(r'(\d+)\.\w+$', fn)
    d.text((x + 6, y + 4), (fn.split('/')[-1].rsplit('_', 1)[0] + ' f' + str(int(m.group(1)))) if m else fn, fill=(255, 220, 140))
S.save(out, quality=85)
print(out, S.size)
