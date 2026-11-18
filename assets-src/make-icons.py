# Иконки сайта из логотипа: значок «‹i›» на белом скруглённом квадрате. Запуск: python3 assets-src/make-icons.py
# Результат кладётся в static/ (его build.mjs копирует в dist): favicon.ico, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
from PIL import Image, ImageDraw

SRC = "static/logo-on-light.png"
logo = Image.open(SRC).convert("RGBA")
alpha = logo.getchannel("A")
w, h = logo.size

# Значок — левая часть логотипа до первого пустого промежутка шириной >= 28 px
cols = [any(alpha.getpixel((x, y)) > 16 for y in range(h)) for x in range(w)]
x0 = next(i for i, c in enumerate(cols) if c)
x1, gap = x0, 0
for x in range(x0, w):
    if cols[x]: x1, gap = x, 0
    else:
        gap += 1
        if gap >= 28: break
sym = logo.crop((x0, 0, x1 + 1, h))
bbox = sym.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()
sym = sym.crop(bbox)

def icon(size: int, radius: float, scale: float, bg=(255, 255, 255, 255)) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius), fill=bg)
    k = min(size * scale / sym.width, size * scale / sym.height)
    s = sym.resize((max(1, round(sym.width * k)), max(1, round(sym.height * k))), Image.LANCZOS)
    img.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
    return img

icon(512, 0.22, 0.66).save("static/icon-512.png", optimize=True)
icon(192, 0.22, 0.66).save("static/icon-192.png", optimize=True)
# Маскируемая иконка: фон на весь квадрат, значок в центральной безопасной зоне (80%)
icon(512, 0.0, 0.52).save("static/icon-maskable-512.png", optimize=True)
# Apple рисует свою маску: полный квадрат без прозрачности
icon(180, 0.0, 0.62).convert("RGB").save("static/apple-touch-icon.png", optimize=True)
big = icon(256, 0.22, 0.7)
big.save("static/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("symbol", sym.size, "ok")
