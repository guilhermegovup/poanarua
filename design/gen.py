# -*- coding: utf-8 -*-
import pathlib

WINE, PINK, ORANGE, AMBER, YELLOW, INK = "#b32f4c", "#df2a58", "#f37422", "#fdb211", "#ffcd3d", "#0d0d0d"
CREAM, WINE_DEEP = "#fff8ec", "#8f2540"

WRAP = """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    body {{ margin: 0; }}
    a {{ color: #b32f4c; }}
    a:hover {{ color: #8f2540; }}
  </style>
</helmet>
<div style="width: 100%; height: 100%; overflow: hidden; background: {ground};">
  <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"
       style="display: block; width: 100%; height: 100%;" role="img" aria-label="{alt}">
{body}
  </svg>
</div>
</x-dc>
<script data-dc-script data-props='{{"$preview": {{"width": 480, "height": 320}}}}'>
class Component extends DCLogic {{}}
</script>
</body>
</html>
"""

def flag(x, y, fill):
    return f'    <path d="M{x-17} {y} L{x+17} {y} L{x} {y+48} Z" fill="{fill}"/>'

covers = {}

# ---------------------------------------------------------------- 1. crianças
covers["Criancas"] = (YELLOW, "Cata-vento e balões", f"""
    <rect width="480" height="320" fill="{YELLOW}"/>
    <circle cx="58" cy="252" r="9" fill="{ORANGE}"/>
    <circle cx="128" cy="288" r="6" fill="{WINE}"/>
    <circle cx="446" cy="256" r="10" fill="{PINK}"/>
    <rect x="196" y="262" width="16" height="16" rx="4" fill="{CREAM}" transform="rotate(24 204 270)"/>
    <rect x="392" y="196" width="13" height="13" rx="3" fill="{WINE}" transform="rotate(-18 398 202)"/>

    <path d="M112 176 q 20 40 -6 72 q -24 30 2 62" stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M206 152 q 14 44 -10 74 q -20 26 0 56" stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round"/>

    <ellipse cx="112" cy="108" rx="56" ry="66" fill="{PINK}"/>
    <path d="M112 172 l-11 16 h22 z" fill="{PINK}"/>
    <ellipse cx="92" cy="86" rx="14" ry="20" fill="{CREAM}" opacity="0.55"/>

    <ellipse cx="206" cy="88" rx="42" ry="50" fill="{ORANGE}"/>
    <path d="M206 136 l-9 13 h18 z" fill="{ORANGE}"/>
    <ellipse cx="192" cy="72" rx="10" ry="14" fill="{CREAM}" opacity="0.5"/>

    <rect x="345" y="128" width="11" height="180" rx="6" fill="{INK}"/>
    <g transform="translate(350,128)">
      <path d="M0 0 L80 -20 Q86 -64 40 -80 Z" fill="{PINK}"/>
      <path d="M0 0 L80 -20 Q86 -64 40 -80 Z" fill="{WINE}" transform="rotate(90)"/>
      <path d="M0 0 L80 -20 Q86 -64 40 -80 Z" fill="{ORANGE}" transform="rotate(180)"/>
      <path d="M0 0 L80 -20 Q86 -64 40 -80 Z" fill="{CREAM}" transform="rotate(270)"/>
      <circle r="13" fill="{INK}"/>
    </g>
""")

# --------------------------------------------------- 2. feiras orgânicas
scallop = " ".join(["a30,26 0 0 1 -60,0"] * 8)
covers["FeirasOrganicas"] = (AMBER, "Toldo de feira e produtos da horta", f"""
    <rect width="480" height="320" fill="{AMBER}"/>

    <defs><clipPath id="toldo"><path d="M0 0 H480 V80 {scallop} Z"/></clipPath></defs>
    <g clip-path="url(#toldo)">
      <rect x="0" y="0" width="480" height="112" fill="{CREAM}"/>
      <rect x="60" y="0" width="60" height="112" fill="{WINE}"/>
      <rect x="180" y="0" width="60" height="112" fill="{WINE}"/>
      <rect x="300" y="0" width="60" height="112" fill="{WINE}"/>
      <rect x="420" y="0" width="60" height="112" fill="{WINE}"/>
    </g>

    <path d="M92 148 q 34 -30 66 -6 q -34 28 -66 6 Z" fill="{WINE_DEEP}"/>
    <circle cx="112" cy="196" r="50" fill="{ORANGE}"/>
    <path d="M112 146 q -8 -20 6 -32 q 10 16 2 32 Z" fill="{WINE_DEEP}"/>

    <circle cx="222" cy="182" r="38" fill="{PINK}"/>
    <path d="M222 144 q -14 -18 -2 -30 q 14 14 2 30 Z" fill="{WINE_DEEP}"/>

    <circle cx="300" cy="206" r="28" fill="{CREAM}"/>

    <path d="M372 154 L410 154 L392 236 Z" fill="{ORANGE}"/>
    <path d="M382 154 q -18 -26 -2 -40 q 12 18 8 40 Z" fill="{WINE_DEEP}"/>
    <path d="M400 154 q 20 -22 34 -12 q -12 18 -34 12 Z" fill="{WINE_DEEP}"/>
""")

# ------------------------------------------------------------- 3. artesanato
def spool(x, y, thread):
    return f"""    <rect x="{x-32}" y="{y}" width="64" height="13" rx="6" fill="{CREAM}"/>
    <rect x="{x-23}" y="{y+13}" width="46" height="66" fill="{thread}"/>
    <rect x="{x-32}" y="{y+79}" width="64" height="13" rx="6" fill="{CREAM}"/>"""

covers["Artesanato"] = (ORANGE, "Carretéis de linha e agulha", f"""
    <rect width="480" height="320" fill="{ORANGE}"/>
    <path d="M-10 250 C 90 170, 190 300, 300 210 S 430 120, 494 168"
          stroke="{WINE}" stroke-width="9" fill="none" stroke-linecap="round"/>
{spool(96, 96, WINE)}
{spool(196, 128, AMBER)}
{spool(296, 96, PINK)}

    <g transform="translate(400,142) rotate(-16)">
      <g stroke="{CREAM}" stroke-width="10" fill="none" stroke-linecap="round">
        <path d="M-27 58 L23 -70"/>
        <path d="M27 58 L-23 -70"/>
        <circle cx="-31" cy="72" r="16"/>
        <circle cx="31" cy="72" r="16"/>
      </g>
      <circle r="7" fill="{INK}"/>
    </g>
""")

# ---------------------------------------------------------- 4. eventos de rua
BUNTING = [(40, 53, AMBER), (115, 66, CREAM), (190, 74, YELLOW),
           (265, 75, ORANGE), (340, 69, CREAM), (415, 58, AMBER)]
BUNTING_BACK = [(78, 148, WINE_DEEP), (153, 161, WINE_DEEP), (228, 169, WINE_DEEP),
                (303, 170, WINE_DEEP), (378, 164, WINE_DEEP)]
covers["EventosDeRua"] = (PINK, "Bandeirinhas de rua e confete", f"""
    <rect width="480" height="320" fill="{PINK}"/>

    <path d="M28 135 Q 240 205, 452 135" stroke="{WINE_DEEP}" stroke-width="4" fill="none"/>
{chr(10).join(flag(x, y, f) for x, y, f in BUNTING_BACK)}

    <path d="M-10 40 Q 240 110, 490 40" stroke="{INK}" stroke-width="5" fill="none"/>
{chr(10).join(flag(x, y, f) for x, y, f in BUNTING)}

    <rect x="66" y="238" width="15" height="15" rx="4" fill="{AMBER}" transform="rotate(28 73 245)"/>
    <rect x="336" y="252" width="13" height="13" rx="3" fill="{CREAM}" transform="rotate(-22 342 258)"/>
    <circle cx="196" cy="248" r="8" fill="{YELLOW}"/>
    <circle cx="432" cy="228" r="7" fill="{AMBER}"/>
    <rect x="252" y="284" width="14" height="14" rx="4" fill="{ORANGE}" transform="rotate(14 259 291)"/>
""")

# ---------------------------------------------------------------- 5. música
covers["Musica"] = (WINE, "Disco de vinil e ondas sonoras", f"""
    <rect width="480" height="320" fill="{WINE}"/>

    <g fill="none" stroke-linecap="round">
      <path d="M96 92 q 34 58 0 116" stroke="{AMBER}" stroke-width="11"/>
      <path d="M56 66 q 56 84 0 168" stroke="{ORANGE}" stroke-width="10" opacity="0.85"/>
      <path d="M18 44 q 76 106 0 212" stroke="{YELLOW}" stroke-width="9" opacity="0.6"/>
    </g>

    <g transform="translate(316,150)">
      <circle r="112" fill="{INK}"/>
      <g fill="none" stroke="{CREAM}" stroke-width="2" opacity="0.34">
        <circle r="92"/><circle r="76"/><circle r="60"/>
      </g>
      <circle r="34" fill="{AMBER}"/>
      <circle r="7" fill="{INK}"/>
    </g>

    <g fill="{CREAM}">
      <rect x="140" y="196" width="19" height="58" rx="9"/>
      <rect x="170" y="160" width="19" height="94" rx="9"/>
      <rect x="200" y="212" width="19" height="42" rx="9"/>
    </g>
""")

# ----------------------------------------------------------- 6. gastronomia
covers["Gastronomia"] = (ORANGE, "Prato com talheres e vapor", f"""
    <rect width="480" height="320" fill="{ORANGE}"/>

    <g stroke="{CREAM}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9">
      <path d="M214 62 q -20 -24 0 -46"/>
      <path d="M252 52 q -22 -28 0 -54"/>
      <path d="M290 62 q -20 -24 0 -46"/>
    </g>

    <circle cx="252" cy="188" r="98" fill="{CREAM}"/>
    <circle cx="252" cy="188" r="70" fill="none" stroke="{AMBER}" stroke-width="7"/>

    <g fill="{INK}">
      <rect x="90" y="72" width="9" height="48" rx="4"/>
      <rect x="106" y="72" width="9" height="48" rx="4"/>
      <rect x="122" y="72" width="9" height="48" rx="4"/>
      <path d="M86 116 h49 v22 a10 10 0 0 1 -10 10 h-8 v112 a6 6 0 0 1 -13 0 v-112 h-8 a10 10 0 0 1 -10 -10 z"/>
    </g>

    <g fill="{INK}">
      <path d="M384 70 q 26 14 26 66 q 0 26 -26 26 z"/>
      <rect x="378" y="162" width="13" height="98" rx="6"/>
    </g>
""")

# ------------------------------------------------------ 7. pontos turísticos
covers["PontosTuristicos"] = (AMBER, "Usina do Gasômetro à beira do Guaíba", f"""
    <rect width="480" height="320" fill="{AMBER}"/>
    <circle cx="392" cy="72" r="56" fill="{CREAM}"/>

    <g stroke="{WINE_DEEP}" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M86 62 q 12 -11 24 0"/>
      <path d="M110 62 q 12 -11 24 0"/>
      <path d="M154 40 q 10 -9 20 0"/>
    </g>

    <rect x="286" y="18" width="36" height="196" fill="{WINE}"/>
    <rect x="279" y="12" width="50" height="15" rx="4" fill="{WINE}"/>
    <rect x="132" y="118" width="176" height="96" fill="{WINE}"/>
    <path d="M132 118 L220 82 L308 118 Z" fill="{WINE_DEEP}"/>

    <g fill="{AMBER}">
      <rect x="152" y="140" width="26" height="34" rx="3"/>
      <rect x="192" y="140" width="26" height="34" rx="3"/>
      <rect x="232" y="140" width="26" height="34" rx="3"/>
      <rect x="272" y="140" width="26" height="34" rx="3"/>
    </g>

    <rect x="0" y="214" width="480" height="106" fill="{WINE_DEEP}"/>
    <g stroke="{AMBER}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55">
      <path d="M26 240 q 26 -14 52 0 t 52 0 t 52 0"/>
      <path d="M290 262 q 26 -14 52 0 t 52 0 t 52 0"/>
    </g>
""")

# ------------------------------------------------------- 8. parques e praças
covers["ParquesEPracas"] = (YELLOW, "Árvores e banco de praça", f"""
    <rect width="480" height="320" fill="{YELLOW}"/>

    <path d="M0 268 q 130 -46 240 -10 q 120 40 240 -6 l0 68 L0 320 Z" fill="{CREAM}" opacity="0.55"/>

    <rect x="104" y="164" width="18" height="104" rx="4" fill="{INK}"/>
    <circle cx="113" cy="112" r="68" fill="{WINE}"/>
    <circle cx="66" cy="140" r="36" fill="{WINE}"/>
    <circle cx="160" cy="142" r="34" fill="{WINE}"/>

    <rect x="378" y="152" width="15" height="94" rx="4" fill="{INK}"/>
    <circle cx="386" cy="110" r="52" fill="{ORANGE}"/>
    <circle cx="428" cy="136" r="28" fill="{ORANGE}"/>

    <g fill="{WINE_DEEP}">
      <rect x="204" y="186" width="112" height="12" rx="5"/>
      <rect x="204" y="164" width="112" height="12" rx="5"/>
      <rect x="204" y="216" width="112" height="13" rx="6"/>
      <rect x="212" y="229" width="11" height="38" rx="4"/>
      <rect x="297" y="229" width="11" height="38" rx="4"/>
      <rect x="204" y="156" width="11" height="62" rx="5"/>
      <rect x="305" y="156" width="11" height="62" rx="5"/>
    </g>
""")

# ---------------------------------------------------------- 9. arte e cultura
covers["ArteCultura"] = (PINK, "Cortina de teatro e pincelada", f"""
    <rect width="480" height="320" fill="{PINK}"/>

    <path d="M240 58 L322 202 L158 202 Z" fill="{CREAM}" opacity="0.4"/>
    <ellipse cx="240" cy="202" rx="82" ry="17" fill="{CREAM}"/>
    <rect x="96" y="200" width="288" height="10" rx="5" fill="{AMBER}"/>

    <path d="M0 0 H150 q -34 78 -12 152 q -26 84 -4 168 H0 Z" fill="{WINE}"/>
    <path d="M480 0 H330 q 34 78 12 152 q 26 84 4 168 H480 Z" fill="{WINE}"/>

    <path d="M0 0 H480 V54 {' '.join(['a30,24 0 0 1 -60,0'] * 8)} Z" fill="{WINE_DEEP}"/>

    <path d="M118 150 q 34 22 34 54 q -34 -8 -46 -32 Z" fill="{AMBER}"/>
    <path d="M362 150 q -34 22 -34 54 q 34 -8 46 -32 Z" fill="{AMBER}"/>
""")

for name, (ground, alt, body) in covers.items():
    pathlib.Path(f"{name}.dc.html").write_text(
        WRAP.format(ground=ground, alt=alt, body=body.rstrip()), encoding="utf-8")

print("capas:", " ".join(sorted(covers)))
