#!/usr/bin/env python3
"""PWA用PNGアイコン生成(依存ライブラリなし) — 6色のフレーバーホイール柄"""
import zlib, struct, math, os

COLORS = [  # wine, whisky, coffee, brandy, sake, cascalate
    (0xB5, 0x4D, 0x63), (0xC9, 0x8A, 0x3A), (0x9C, 0x6B, 0x44),
    (0xB8, 0x73, 0x33), (0x8F, 0xA8, 0xC9), (0xC9, 0x5F, 0x6E),
]
BG = (0x15, 0x11, 0x0E)


def make_png(size, path):
    cx = cy = size / 2
    r_outer = size * 0.34
    r_inner = size * 0.15
    rows = []
    for y in range(size):
        row = bytearray([0])  # filter type 0
        for x in range(size):
            dx, dy = x - cx + 0.5, y - cy + 0.5
            r = math.hypot(dx, dy)
            if r_inner <= r <= r_outer:
                ang = (math.degrees(math.atan2(dy, dx)) + 90) % 360
                c = COLORS[int(ang // 60) % 6]
                # セグメント境界に細い背景色ライン
                if ang % 60 < 1.6 or r > r_outer - size * 0.004:
                    c = BG
            else:
                c = BG
            row += bytes(c)
        rows.append(bytes(row))
    raw = b''.join(rows)

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)
    print(f'{path}: {os.path.getsize(path)} bytes')


here = os.path.dirname(os.path.abspath(__file__))
make_png(180, os.path.join(here, 'icon-180.png'))
make_png(512, os.path.join(here, 'icon-512.png'))
