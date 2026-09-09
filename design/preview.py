# -*- coding: utf-8 -*-
"""Renderiza as capas em HTML puro: nos dois tamanhos, com o degradê real."""
import pathlib, re

ORDER = [("Criancas","PARA CRIANÇAS"),("FeirasOrganicas","FEIRAS ORGÂNICAS E ECOLÓGICAS"),
         ("Artesanato","ARTESANATO E BRECHÓ"),("EventosDeRua","EVENTOS DE RUA"),
         ("Musica","MÚSICA E SHOWS"),("Gastronomia","GASTRONOMIA"),
         ("PontosTuristicos","PONTOS TURÍSTICOS"),("ParquesEPracas","PARQUES E PRAÇAS"),
         ("ArteCultura","ARTE E CULTURA")]

def svg_of(name, w, h):
    src = pathlib.Path(f"{name}.dc.html").read_text(encoding="utf-8")
    body = re.search(r"(<svg\b.*?</svg>)", src, re.S).group(1)
    body = body.replace('style="display: block; width: 100%; height: 100%;"',
                        f'style="display:block;width:{w}px;height:{h}px"')
    for cid in set(re.findall(r'id="([^"]+)"', body)):
        body = body.replace(f'"{cid}"', f'"{cid}-{w}-{name}"').replace(f'url(#{cid})', f'url(#{cid}-{w}-{name})')
    return body

big = "\n".join(f'<figure><figcaption>{n}</figcaption>{svg_of(n,480,320)}</figure>' for n,_ in ORDER)
small = "\n".join(f'<div class="card">{svg_of(n,192,128)}<div class="grad"></div><span>{l}</span></div>'
                  for n, l in ORDER)

pathlib.Path("preview.html").write_text(f"""<!doctype html><meta charset="utf-8">
<style>
 body{{margin:0;background:#fdfbf7;font:14px system-ui;padding:24px;color:#0d0d0d}}
 h2{{font-size:20px;margin:8px 0 16px}}
 .grid{{display:flex;flex-wrap:wrap;gap:20px}}
 figure{{margin:0}} figcaption{{font-size:11px;color:#77706a;margin-bottom:6px}}
 figure svg{{border-radius:12px}}
 .rail{{display:flex;flex-wrap:wrap;gap:12px;max-width:1020px}}
 .card{{position:relative;width:192px;height:128px;border-radius:12px;overflow:hidden}}
 .card .grad{{position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,13,.85),rgba(13,13,13,.25) 50%,rgba(13,13,13,0))}}
 .card span{{position:absolute;left:0;right:0;bottom:0;padding:12px;color:#fff;font-size:12px;font-weight:700;line-height:1.25}}
</style>
<h2>Como aparece no trilho — 192×128, com degradê e rótulo</h2>
<div class="rail">{small}</div>
<h2 style="margin-top:36px">As capas em 480×320</h2>
<div class="grid">{big}</div>
""", encoding="utf-8")
print("preview.html")
