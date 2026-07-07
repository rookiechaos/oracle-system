#!/usr/bin/env python3
"""
神託システム — FANCY demo video v3
1080×1920 · 30fps · ~36s · local only
Screen content rendered into isolated buffer → no overflow possible
"""
import subprocess, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Canvas & phone geometry ──────────────────────────────────────────────────
W, H   = 1080, 1920
FPS    = 30
OUT    = str(Path(__file__).resolve().parent / 'uranai-demo.mp4')

# Phone mockup — bigger, centered
PH_W, PH_H = 560, 980          # outer phone shell
SC_W, SC_H  = 516, 904         # inner screen buffer
PH_X = (W - PH_W) // 2         # 260
PH_Y = 370                      # phone top y
SC_X = PH_X + (PH_W - SC_W)//2 # 282
SC_Y = PH_Y + 42                # 412
SC_X2 = SC_X + SC_W             # 798
SC_Y2 = SC_Y + SC_H             # 1316
MX    = W // 2                  # canvas mid-x
SMX   = SC_W // 2               # screen mid-x

# ── Color palette ────────────────────────────────────────────────────────────
BG        = (5,   0,  16)
BG_CARD   = (11,  0,  34)
BG_CARD2  = (18,  0,  52)
CYAN      = (0,  229, 255)
MAGENTA   = (255,  0, 221)
GREEN     = (0,  255, 136)
YELLOW    = (255, 229,   0)
TEXT      = (204, 224, 255)
TEXT_DIM  = (58,  72, 112)
TEXT_MUT  = (37,  42,  80)
BORDER    = (24,   0,  64)
BORDER_BR = (45,   0, 101)

# ── Fonts ────────────────────────────────────────────────────────────────────
FH6   = '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc'
FH3   = '/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc'
FMONO = '/System/Library/Fonts/Menlo.ttc'

def fnt(p, sz, i=0): return ImageFont.truetype(p, sz, index=i)

# ── Icon drawers (zero emoji dependency) ─────────────────────────────────────

def rrect(d, x1,y1,x2,y2, r=10, fill=None, outline=None, lw=1):
    d.rounded_rectangle([x1,y1,x2,y2], radius=r, fill=fill, outline=outline, width=lw)

def glow_t(d, text, x, y, font_obj, color, sigma=8, anchor='mm'):
    r,g,b = color
    for step, a in [(14,0.12),(7,0.22),(2,0.4)]:
        gc = (int(r*a),int(g*a),int(b*a))
        for dx in range(-step, step+1, max(1,step//2)):
            for dy in range(-step, step+1, max(1,step//2)):
                d.text((x+dx,y+dy), text, font=font_obj, fill=gc, anchor=anchor)
    d.text((x,y), text, font=font_obj, fill=color, anchor=anchor)

def neon_btn(d, x1,y1,x2,y2, label, font_obj, color=CYAN, r=14):
    cr,cg,cb = color
    for ex in [12,6,2]:
        gc = (int(cr*0.10),int(cg*0.10),int(cb*0.10))
        rrect(d, x1-ex,y1-ex,x2+ex,y2+ex, r+ex, fill=gc)
    rrect(d, x1,y1,x2,y2, r, fill=(int(cr*0.08),int(cg*0.08),int(cb*0.08)),
          outline=color, lw=2)
    glow_t(d, label, (x1+x2)//2,(y1+y2)//2, font_obj, color)

def pill(d, cx,cy, text, font_obj, color):
    bb = font_obj.getbbox(text); tw=bb[2]-bb[0]; th=bb[3]-bb[1]
    r,g,b = color
    rrect(d, cx-tw//2-12,cy-th//2-7, cx+tw//2+12,cy+th//2+7, 18,
          fill=(int(r*0.14),int(g*0.14),int(b*0.14)), outline=color, lw=1)
    d.text((cx,cy), text, font=font_obj, fill=color, anchor='mm')

def card(d, x1,y1,x2,y2, r=14, border=BORDER_BR, glow_col=None):
    if glow_col:
        for ex in [8,4]:
            gc = tuple(int(c*0.06) for c in glow_col)
            rrect(d, x1-ex,y1-ex,x2+ex,y2+ex, r+ex, fill=gc)
    rrect(d, x1,y1,x2,y2, r, fill=BG_CARD, outline=border, lw=1)

def icon_torii(d, cx,cy, col, sz=18):
    lw = max(2, sz//8)
    d.line([(cx-sz//3,cy-sz//6),(cx-sz//3,cy+sz//2)], fill=col, width=lw)
    d.line([(cx+sz//3,cy-sz//6),(cx+sz//3,cy+sz//2)], fill=col, width=lw)
    d.line([(cx-sz//2,cy-sz//2),(cx+sz//2,cy-sz//2)], fill=col, width=lw+1)
    d.line([(cx-sz//2+4,cy-sz//6),(cx+sz//2-4,cy-sz//6)], fill=col, width=lw)

def icon_card(d, cx,cy, col, sz=18):
    rrect(d, cx-sz//2+2,cy-sz//2, cx+sz//2-2,cy+sz//2, r=3, fill=None, outline=col, lw=2)
    d.text((cx,cy-2), '?', font=fnt(FMONO, max(10,sz-6)), fill=col, anchor='mm')

def icon_star(d, cx,cy, col, sz=18):
    pts = [(cx+( (sz//2 if i%2==0 else sz//4)*math.cos(math.radians(i*36-90))),
             cy+( (sz//2 if i%2==0 else sz//4)*math.sin(math.radians(i*36-90))))
           for i in range(10)]
    d.polygon(pts, fill=col)

def icon_moon(d, cx,cy, col, sz=18):
    d.ellipse([cx-sz//2,cy-sz//2,cx+sz//2,cy+sz//2], fill=col)
    d.ellipse([cx-sz//2+sz//3,cy-sz//2-sz//5,cx+sz//2+sz//4,cy+sz//2-sz//5],
              fill=BG_CARD2)

def icon_scroll(d, cx,cy, col, sz=11):
    for i,w in enumerate([sz,sz-3,sz-1]):
        y2=cy-sz//2+i*(sz//2)
        d.line([(cx-w,y2),(cx+w,y2)], fill=col, width=2)

def icon_gear(d, cx,cy, col, sz=11):
    ir=sz-3
    d.ellipse([cx-ir,cy-ir,cx+ir,cy+ir], outline=col, width=2)
    for ang in range(0,360,60):
        r2=math.radians(ang)
        d.line([(cx+int((ir-1)*math.cos(r2)),cy+int((ir-1)*math.sin(r2))),
                (cx+int((sz+2)*math.cos(r2)),cy+int((sz+2)*math.sin(r2)))],
               fill=col, width=3)

STYLE_ICONS = {'omikuji':icon_torii,'tarot':icon_card,'kyusei':icon_star,'shichusuimei':icon_moon}

# ── Background layers (full canvas) ──────────────────────────────────────────

random.seed(77)
STARS=[(random.randint(0,W),random.randint(0,H),
        random.uniform(0.3,1.0),random.choice([CYAN,MAGENTA,(180,200,255)]))
       for _ in range(260)]

def draw_bg(img, frame):
    d = ImageDraw.Draw(img)
    # grid
    hy = H//2
    for i in range(1,16):
        y2=hy+int((H-hy)*(i/15)**1.5)
        gc=(int(36*(i/15)),0,int(88*(i/15)))
        d.line([(0,y2),(W,y2)], fill=gc, width=1)
    for i in range(-12,13):
        if i==0: continue
        bx=MX+i*(W//20)
        d.line([(MX,hy),(bx,H)], fill=(14,0,38), width=1)
    # stars
    for sx,sy,br,col in STARS:
        tw=0.5+0.5*math.sin(frame*0.05+sx*0.02)
        a=int(br*tw*180)
        c=tuple(int(x*a/255) for x in col)
        sz=2 if br>0.7 else 1
        d.ellipse([sx-sz,sy-sz,sx+sz,sy+sz], fill=c)
    # scan sweep
    y2=int((frame*16)%H)
    for dy in range(-8,9):
        yy=y2+dy
        if 0<=yy<H:
            a=int(35*(1-abs(dy)/9))
            d.line([(0,yy),(W,yy)], fill=(0,int(229*a/35),int(255*a/35)), width=1)

def crt_overlay(img):
    """Subtle CRT scanlines."""
    ov=Image.new('RGBA',(W,H),(0,0,0,0))
    od=ImageDraw.Draw(ov)
    for y in range(0,H,4):
        od.line([(0,y),(W,y)], fill=(0,0,0,22))
    return Image.alpha_composite(img.convert('RGBA'),ov).convert('RGB')

# ── Matrix rain ───────────────────────────────────────────────────────────────

RAIN_CH='占運命星月愛金財健仕事恋縁幸凶吉大小01'
random.seed(42)
RCOLS=32; RCW=W//RCOLS
roff=[random.randint(0,80) for _ in range(RCOLS)]
rspd=[random.uniform(0.5,1.7) for _ in range(RCOLS)]
RFNT=fnt(FMONO,17)

def draw_matrix(img, frame, alpha=0.30):
    ov=Image.new('RGB',(W,H),(0,0,0))
    d2=ImageDraw.Draw(ov)
    rows=H//19
    for col in range(RCOLS):
        x=col*RCW+RCW//2
        drop=int((frame*rspd[col]+roff[col])%(rows+14))
        for row in range(rows):
            ch=RAIN_CH[(row*5+col*7+frame//2)%len(RAIN_CH)]
            dist=drop-row
            if dist<0 or dist>14: continue
            b=255 if dist==0 else int(255*(1-dist/14)**1.8)
            d2.text((x,row*19),ch,font=RFNT,
                    fill=(0,int(229*b/255),int(255*b/255)),anchor='mt')
    img.paste(Image.blend(img,ov,alpha))

# ── Phone frame (full canvas draw) ───────────────────────────────────────────

def draw_phone_shell(d, frame):
    """Glow aura + filled body — called BEFORE pasting the screen buffer."""
    x1,y1,x2,y2 = PH_X,PH_Y,PH_X+PH_W,PH_Y+PH_H
    r=46
    for i,ex in enumerate([28,18,10,4]):
        t=i/3
        gr=int(CYAN[0]*(1-t)+MAGENTA[0]*t)
        gg=int(CYAN[1]*(1-t)+MAGENTA[1]*t)
        gb=int(CYAN[2]*(1-t)+MAGENTA[2]*t)
        pulse=0.7+0.3*math.sin(frame*0.08+i*0.9)
        al=[0.05,0.08,0.15,0.28][i]*pulse
        gc=(int(gr*al),int(gg*al),int(gb*al))
        rrect(d, x1-ex,y1-ex,x2+ex,y2+ex, r+ex, fill=gc)
    rrect(d, x1,y1,x2,y2, r, fill=(7,0,20))

def draw_phone_top(d, frame):
    """Border, notch, buttons, home bar — called AFTER pasting the screen buffer."""
    x1,y1,x2,y2 = PH_X,PH_Y,PH_X+PH_W,PH_Y+PH_H
    r=46
    ph=(frame*2.5)%360
    bc=(int(CYAN[0]*0.5+MAGENTA[0]*0.5*abs(math.sin(math.radians(ph)))),
        int(CYAN[1]*0.5+MAGENTA[1]*0.5*abs(math.sin(math.radians(ph)))),
        int(CYAN[2]*0.5+MAGENTA[2]*0.5*abs(math.sin(math.radians(ph)))))
    rrect(d, x1,y1,x2,y2, r, fill=None, outline=bc, lw=2)
    nx=(x1+x2)//2; ny=y1+20
    d.rounded_rectangle([nx-44,ny-8,nx+44,ny+8],radius=8,fill=(5,0,16),outline=(28,0,64),width=1)
    d.ellipse([nx+18,ny-5,nx+28,ny+5],fill=(18,18,40))
    for boff in [60,110]:
        d.rounded_rectangle([x1-5,y1+boff,x1,y1+boff+44],radius=3,fill=(20,0,50))
    d.rounded_rectangle([x2,y1+80,x2+5,y1+160],radius=3,fill=(20,0,50))
    by=y2-22
    d.rounded_rectangle([(x1+x2)//2-56,by-5,(x1+x2)//2+56,by+5],radius=5,fill=(36,0,84))

# ── HUD elements ──────────────────────────────────────────────────────────────

def draw_hud(d, frame):
    pulse=0.65+0.35*math.sin(frame*0.11)
    col=tuple(int(c*pulse) for c in CYAN)
    sz,mg=32,26
    for cx2,cy2,sx,sy in [(mg,mg,1,1),(W-mg,mg,-1,1),(mg,H-mg,1,-1),(W-mg,H-mg,-1,-1)]:
        d.line([(cx2,cy2),(cx2+sx*sz,cy2)], fill=col, width=2)
        d.line([(cx2,cy2),(cx2,cy2+sy*sz)], fill=col, width=2)
        # inner dot
        d.ellipse([cx2+sx*3-2,cy2+sy*3-2,cx2+sx*3+2,cy2+sy*3+2], fill=col)
    # top data
    tk=(frame//14)%2; st='ACTIVE ●' if tk else 'READY  ○'
    d.text((52,48), f'SYS:{st}', font=fnt(FMONO,13), fill=TEXT_DIM)
    d.text((52,66), f'FRAME:{frame:04d}', font=fnt(FMONO,12), fill=TEXT_MUT)
    d.text((W-52,48), '神託システム', font=fnt(FH3,13), fill=TEXT_DIM, anchor='rt')
    d.text((W-52,66), 'v1.0.0', font=fnt(FMONO,12), fill=TEXT_MUT, anchor='rt')

def draw_side_decorations(d, frame):
    """Floating orbital lines and dots beside the phone."""
    # left vertical bar
    lx=PH_X-44
    d.line([(lx,PH_Y+100),(lx,PH_Y+PH_H-100)], fill=(20,0,52), width=1)
    for i in range(5):
        py=PH_Y+140+i*120
        pulse=0.4+0.6*math.sin(frame*0.07+i*1.2)
        col=(int(CYAN[0]*pulse*0.6),int(CYAN[1]*pulse*0.6),int(CYAN[2]*pulse*0.6))
        d.ellipse([lx-4,py-4,lx+4,py+4], fill=col)
        d.line([(lx-18,py),(lx,py)], fill=col, width=1)
    # right vertical bar
    rx=PH_X+PH_W+44
    d.line([(rx,PH_Y+100),(rx,PH_Y+PH_H-100)], fill=(20,0,52), width=1)
    for i in range(4):
        py=PH_Y+180+i*140
        pulse=0.4+0.6*math.sin(frame*0.09+i*1.5+2.0)
        col=(int(MAGENTA[0]*pulse*0.5),int(MAGENTA[1]*pulse*0.5),int(MAGENTA[2]*pulse*0.5))
        d.ellipse([rx-4,py-4,rx+4,py+4], fill=col)
        d.line([(rx,py),(rx+18,py)], fill=col, width=1)

def draw_page_dots(d, seg_i, n_segs, frame):
    dot_y=PH_Y-36; sp=20; sx=MX-(n_segs-1)*sp//2
    pulse=0.7+0.3*math.sin(frame*0.15)
    for i in range(n_segs):
        cx2=sx+i*sp
        if i==seg_i:
            glow_t(d,'•',cx2,dot_y,fnt(FMONO,20),
                   tuple(int(c*pulse) for c in CYAN))
        else:
            d.text((cx2,dot_y),'•',font=fnt(FMONO,18),fill=TEXT_MUT,anchor='mm')

# ── Feature label below phone ─────────────────────────────────────────────────

FEATURES={
    'welcome':  ('神託システム',       'AIが神秘の力であなたの未来を読み解きます'),
    'apikey':   ('完全プライベート',    'データはあなたの端末のみ保存。誰にも見えない。'),
    'home':     ('パーソナルダッシュボード','毎日の占いをワンタップで。過去の結果も一覧表示。'),
    'ask':      ('4つの占い方式対応',  'おみくじ・タロット・九星気学・四柱推命'),
    'loading':  ('リアルタイムAI生成', '最新モデルがあなただけの神託を紡ぎます'),
    'reveal':   ('タイプライター演出',  'じわじわと現れる神秘のメッセージ'),
    'history':  ('占い履歴',           'お気に入り保存・過去の神託をいつでも振り返り'),
    'outro':    ('神託システム',        'ホーム画面に追加してすぐ使える PWA'),
}

def draw_feature(d, seg_name, frame, total):
    ti=frame/total
    fade=min(1.0,ti*5)*min(1.0,(1-ti)*5)
    title,sub=FEATURES[seg_name]
    ty=SC_Y2+72; sy=ty+52
    cf=tuple(int(c*fade) for c in CYAN)
    # title bg pill
    bb=fnt(FH6,34).getbbox(title); tw=bb[2]-bb[0]
    rrect(d,MX-tw//2-24,ty-24,MX+tw//2+24,ty+24,22,
          fill=tuple(int(c*fade*0.10) for c in CYAN),
          outline=tuple(int(c*fade*0.35) for c in CYAN),lw=1)
    glow_t(d,title,MX,ty,fnt(FH6,34),cf)
    d.text((MX,ty),title,font=fnt(FH6,34),fill=cf,anchor='mm')
    d.text((MX,sy),sub,font=fnt(FH3,19),fill=tuple(int(c*fade) for c in TEXT_DIM),anchor='mm')

# ── Screen renderers — local coords 0..SC_W, 0..SC_H ─────────────────────────
# All content MUST stay within (0,0)—(SC_W,SC_H). Overflow is clipped by paste.

SBG=BG; SM=SC_W//2

def sep(d, y, col=BORDER_BR):
    d.line([(16,y),(SC_W-16,y)], fill=col, width=1)

def dim(d, y, text):
    d.text((18,y), text, font=fnt(FMONO,13), fill=TEXT_DIM)

# Welcome
def scr_welcome(d, frame, total):
    t=frame/total
    # pill
    pill(d,SM,54,'ORACLE_SYS  v1.0',fnt(FMONO,15),MAGENTA)
    # title
    glow_t(d,'神託',SM,156,fnt(FH6,68),CYAN,sigma=16)
    glow_t(d,'システム',SM,234,fnt(FH6,68),CYAN,sigma=16)
    # divider
    fade=min(1.0,t*3)
    d.line([(40,294),(SC_W-40,294)],fill=(int(80*fade),0,int(80*fade)),width=1)
    # desc
    for i,ln in enumerate(['あなたの過去・現在・未来を','AIが神秘の力で読み解きます']):
        d.text((SM,332+i*40),ln,font=fnt(FH3,22),fill=TEXT,anchor='mm')
    # CTA button
    neon_btn(d,32,424,SC_W-32,494,'[ 起動する ]',fnt(FMONO,22),CYAN)
    # category chips
    cw=(SC_W-80)//3
    for i,lbl in enumerate(['恋愛運','仕事運','金運']):
        cx1=32+i*(cw+12); cx2=cx1+cw
        rrect(d,cx1,520,cx2,570,r=10,fill=BG_CARD2,outline=BORDER_BR,lw=1)
        d.text(((cx1+cx2)//2,545),lbl,font=fnt(FH3,18),fill=TEXT_DIM,anchor='mm')
    # pulse rings behind title
    for ring in range(3):
        r2=90+ring*30; ph2=(frame*0.06+ring*0.8)%(2*math.pi)
        a=int((0.04+0.02*math.sin(ph2))*255)
        d.ellipse([SM-r2,145-r2//2,SM+r2,145+r2//2],
                  outline=(0,int(229*a/255),int(255*a/255)),width=1)
    # disclaimer
    d.text((SM,SC_H-22),'占いはエンターテインメント目的です',
           font=fnt(FMONO,12),fill=TEXT_MUT,anchor='mm')

# ApiKey
def scr_apikey(d, frame, total):
    t=frame/total
    card(d,16,24,SC_W-16,SC_H-24,r=18,border=BORDER_BR,glow_col=CYAN)
    glow_t(d,'APIキー設定',SM,96,fnt(FH6,36),CYAN)
    d.text((SM,96),'APIキー設定',font=fnt(FH6,36),fill=CYAN,anchor='mm')
    sep(d,132)
    dim(d,150,'// AIプロバイダーを選択')
    # provider pills
    pill(d,SM-80,190,'Anthropic',fnt(FH3,16),CYAN)
    pill(d,SM+80,190,'OpenAI',fnt(FH3,16),TEXT_DIM)
    dim(d,228,'// APIキーを入力')
    # input field
    ix1,iy1,ix2,iy2=34,252,SC_W-34,310
    for ex in [6,3]:
        rrect(d,ix1-ex,iy1-ex,ix2+ex,iy2+ex,12+ex,fill=(0,int(229*0.05),int(255*0.05)))
    rrect(d,ix1,iy1,ix2,iy2,12,fill=BG_CARD2,outline=CYAN,lw=2)
    full='sk-ant-api03-••••••••••••••••'
    vis=full[:int(len(full)*min(1.0,t*2.0))]
    d.text((ix1+14,(iy1+iy2)//2),vis,font=fnt(FMONO,18),fill=CYAN,anchor='lm')
    if t<0.97 and (frame//8)%2:
        cx2=ix1+14+fnt(FMONO,18).getlength(vis)
        d.rectangle([cx2+2,iy1+10,cx2+4,iy2-10],fill=CYAN)
    # connect btn
    neon_btn(d,34,334,SC_W-34,398,'[ 接続する ]',fnt(FMONO,20),CYAN)
    sep(d,424)
    # features
    feats=[('🔒','データは端末のみに保存','🔑','APIキーは暗号化保存'),
           ('📡','直接AI接続・サーバー不要','🔐','会話履歴は誰にも見えない')]
    for row,(ic1,t1,ic2,t2) in enumerate(feats):
        y2=452+row*72
        for col_i,(ic,tx) in enumerate([(ic1,t1),(ic2,t2)]):
            x2=34+col_i*(SC_W//2-20)
            # draw icon as shape instead of emoji
            ic_color=CYAN if col_i==0 else GREEN
            d.ellipse([x2+6,y2+8,x2+24,y2+26],outline=ic_color,width=1)
            d.text((x2+32,y2+12),tx,font=fnt(FH3,15),fill=TEXT_DIM)
    d.text((SM,SC_H-30),'APIキーの取得方法は？',
           font=fnt(FMONO,14),fill=TEXT_DIM,anchor='mm')

# Home
def scr_home(d, frame, total):
    # top bar
    glow_t(d,'神託',28,38,fnt(FMONO,24),CYAN,anchor='lm')
    icon_scroll(d,SC_W-56,38,TEXT_DIM,sz=11)
    icon_gear(d,SC_W-22,38,TEXT_DIM,sz=11)
    for bx in [SC_W-66,SC_W-30]:
        rrect(d,bx-16,24,bx+16,52,r=8,fill=BG_CARD,outline=BORDER)

    # hero gradient area
    rrect(d,0,64,SC_W,286,r=0,fill=BG_CARD2)
    d.line([(0,64),(SC_W,64)],fill=BORDER_BR,width=1)
    d.text((SM,112),'こんにちは、',font=fnt(FH3,18),fill=TEXT_DIM,anchor='mm')
    glow_t(d,'花子さん',SM,166,fnt(FH6,42),TEXT,sigma=6)
    d.text((SM,166),'花子さん',font=fnt(FH6,42),fill=TEXT,anchor='mm')
    d.text((SM,216),'今日も宇宙があなたを導きます',font=fnt(FH3,17),fill=TEXT_DIM,anchor='mm')
    d.line([(0,286),(SC_W,286)],fill=BORDER_BR,width=1)

    # stats
    sw2=(SC_W-56)//2
    for i,(val,lbl,col) in enumerate([('12','占い回数',CYAN),('5月14日','最後の占い',MAGENTA)]):
        sx1=22+i*(sw2+12); sx2=sx1+sw2
        card(d,sx1,304,sx2,372,r=10,border=BORDER_BR)
        d.text(((sx1+sx2)//2,330),val,font=fnt(FH6,24),fill=col,anchor='mm')
        d.text(((sx1+sx2)//2,360),lbl,font=fnt(FH3,14),fill=TEXT_DIM,anchor='mm')

    # primary CTA
    neon_btn(d,22,394,SC_W-22,466,'[ 今すぐ占う ]',fnt(FMONO,22),CYAN)

    # secondary
    rrect(d,22,480,SC_W-22,544,r=14,
          fill=(int(MAGENTA[0]*0.08),0,int(MAGENTA[2]*0.08)),outline=MAGENTA,lw=2)
    for ex in [8,4]:
        rrect(d,22-ex,480-ex,SC_W-22+ex,544+ex,r=14+ex,
              fill=(int(MAGENTA[0]*0.03),0,int(MAGENTA[2]*0.03)))
    rrect(d,22,480,SC_W-22,544,r=14,
          fill=(int(MAGENTA[0]*0.08),0,int(MAGENTA[2]*0.08)),outline=MAGENTA,lw=2)
    icon_star(d,54,512,MAGENTA,sz=14)
    d.text((SM+10,512),'質問して占う',font=fnt(FMONO,20),fill=MAGENTA,anchor='mm')

    # recent fortune
    dim(d,564,'// 最近の占い')
    card(d,22,586,SC_W-22,SC_H-18,r=14,border=BORDER_BR,glow_col=None)
    d.text((38,606),'5月14日',font=fnt(FMONO,13),fill=TEXT_DIM)
    pill(d,SC_W-68,616,'タロット',fnt(FH3,13),MAGENTA)
    sample='今日のあなたには、大きなチャンスが\n訪れる予感があります。直感を信じて\n行動すれば運命が開けるでしょう。'
    d.multiline_text((38,638),sample,font=fnt(FH3,18),fill=TEXT,spacing=8)

# Ask
def scr_ask(d, frame, total):
    d.text((22,28),'← 戻る',font=fnt(FMONO,16),fill=CYAN,anchor='lm')
    glow_t(d,'占いを始める',SM,80,fnt(FH6,34),CYAN)
    sep(d,108)
    dim(d,120,'// 占い方式を選択')
    styles=[
        ('omikuji','おみくじ','吉凶・運勢の傾向',CYAN,True),
        ('tarot','タロット','78枚のカードが語る',TEXT_DIM,False),
        ('kyusei','九星気学','気の流れと方位',TEXT_DIM,False),
        ('shichusuimei','四柱推命','生年月日の命式',TEXT_DIM,False),
    ]
    cw3=(SC_W-52)//2; ch=138
    for i,(sk,nm,dc,col,act) in enumerate(styles):
        row,ci=divmod(i,2)
        sx1=18+ci*(cw3+16); sx2=sx1+cw3
        sy1=140+row*(ch+10); sy2=sy1+ch
        fill2=(0,int(229*0.12),int(255*0.12)) if act else BG_CARD
        out2=CYAN if act else BORDER
        if act:
            for ex in [10,5]:
                rrect(d,sx1-ex,sy1-ex,sx2+ex,sy2+ex,r=12+ex,
                      fill=(0,int(229*0.04),int(255*0.04)))
        rrect(d,sx1,sy1,sx2,sy2,r=12,fill=fill2,outline=out2,lw=2 if act else 1)
        STYLE_ICONS[sk](d,sx1+28,sy1+30,col if act else TEXT_DIM,sz=20)
        d.text((sx1+16,sy1+62),nm,font=fnt(FH6,19),fill=col if act else TEXT)
        d.text((sx1+16,sy1+90),dc,font=fnt(FH3,14),fill=TEXT_DIM)
    dim(d,444,'// 質問（省略で今日の運勢）')
    rrect(d,18,466,SC_W-18,592,r=12,fill=BG_CARD,outline=BORDER_BR)
    d.multiline_text((34,482),
        '例: 仕事で良いことはありますか？\n例: 今の恋愛はうまくいきますか？',
        font=fnt(FH3,18),fill=TEXT_DIM,spacing=10)
    neon_btn(d,18,612,SC_W-18,676,'[ 神託を受け取る ]',fnt(FMONO,21),CYAN)
    d.text((SM,700),'※ AIに問い合わせるため、数秒かかります',
           font=fnt(FMONO,13),fill=TEXT_DIM,anchor='mm')

# Loading
def scr_loading(d, frame, total):
    cx2=SM; cy2=SC_H//2-30
    for ring in range(6,0,-1):
        r2=44+ring*30
        ph2=(frame*0.09-ring*0.55)%(2*math.pi)
        a=0.06+0.05*math.sin(ph2)
        col=(int(CYAN[0]*a*3),int(CYAN[1]*a*3),int(CYAN[2]*a*3))
        d.ellipse([cx2-r2,cy2-r2,cx2+r2,cy2+r2],outline=col,width=2)
    ang=(frame*8)%360
    d.arc([cx2-78,cy2-78,cx2+78,cy2+78],start=ang,end=ang+260,fill=CYAN,width=5)
    d.arc([cx2-60,cy2-60,cx2+60,cy2+60],start=ang+150,end=ang+360,fill=MAGENTA,width=3)
    d.ellipse([cx2-36,cy2-36,cx2+36,cy2+36],
              fill=(int(CYAN[0]*0.08),int(CYAN[1]*0.08),int(CYAN[2]*0.08)),
              outline=CYAN,width=2)
    glow_t(d,'占',cx2,cy2,fnt(FH6,52),CYAN)
    dots='.'*((frame//10)%4)
    d.text((SM,cy2+118),f'神託を解析中{dots}',font=fnt(FH6,22),fill=TEXT,anchor='mm')
    d.text((SM,cy2+158),'AI ORACLE PROCESSING',font=fnt(FMONO,15),fill=TEXT_DIM,anchor='mm')

FORTUNE=('星々があなたに語りかけています。\n\n'
         '今日のあなたには、大きなチャンスが\n'
         '訪れる予感があります。\n\n'
         '直感を信じて行動に移すことで、\n'
         '停滞した流れが一気に動き出す\n'
         'でしょう。\n\n'
         '特に午後の時間帯に吉兆あり。\n'
         '大切な人との対話を大切に。')

# Reveal
def scr_reveal(d, frame, total):
    t=frame/total
    d.text((18,24),'2026年5月15日',font=fnt(FMONO,13),fill=TEXT_DIM)
    pill(d,SC_W-64,30,'おみくじ',fnt(FH3,13),MAGENTA)
    # fortune card
    fc_x1,fc_y1,fc_x2,fc_y2=16,56,SC_W-16,654
    for ex in [12,6,2]:
        rrect(d,fc_x1-ex,fc_y1-ex,fc_x2+ex,fc_y2+ex,r=18+ex,
              fill=(int(CYAN[0]*0.04),int(CYAN[1]*0.04),int(CYAN[2]*0.04)))
    rrect(d,fc_x1,fc_y1,fc_x2,fc_y2,r=18,fill=BG_CARD,
          outline=(int(CYAN[0]*0.40),int(CYAN[1]*0.40),int(CYAN[2]*0.40)),lw=1)
    ease=min(1.0,t*1.35)
    shown=int(len(FORTUNE)*ease)
    displayed=FORTUNE[:shown]
    d.multiline_text((fc_x1+20,fc_y1+20),displayed,font=fnt(FH3,20),fill=TEXT,spacing=12)
    if shown<len(FORTUNE) and (frame//8)%2:
        lines=displayed.split('\n')
        ly=fc_y1+20+(len(lines)-1)*32
        lx=fc_x1+20+fnt(FH3,20).getlength(lines[-1])
        d.rectangle([lx+2,ly,lx+5,ly+20],fill=CYAN)
    # buttons fade in after 78%
    if t>0.78:
        bt=min(1.0,(t-0.78)/0.22)
        c2=tuple(int(x*bt) for x in CYAN)
        neon_btn(d,18,fc_y2+18,SC_W-18,fc_y2+80,'[ もう一度占う ]',fnt(FMONO,19),c2)
        rrect(d,18,fc_y2+92,SC_W-18,fc_y2+152,r=12,fill=BG_CARD,outline=BORDER_BR)
        d.text((SM,fc_y2+122),'占い履歴を見る',font=fnt(FMONO,18),
               fill=tuple(int(x*bt) for x in TEXT),anchor='mm')

HIST=[
    ('5月15日','おみくじ','星々があなたに語りかけています。大きなチャンスが訪れる予感...', CYAN),
    ('5月13日','タロット','「月」のカードが示すように直感が高まる時期。恋愛面では...', MAGENTA),
    ('5月11日','九星気学','五黄土星の影響で今週は安定と充実の一週間。仕事運上昇...', GREEN),
    ('5月 9日','四柱推命','己土の命式から見て財運が強まる傾向。思い切った行動が吉...', YELLOW),
]

# History
def scr_history(d, frame, total):
    t=frame/total
    glow_t(d,'占い履歴',SM,46,fnt(FH6,34),TEXT)
    d.text((SM,46),'占い履歴',font=fnt(FH6,34),fill=TEXT,anchor='mm')
    d.text((SC_W-20,28),'← 戻る',font=fnt(FMONO,14),fill=CYAN,anchor='rm')
    sep(d,76)
    ch=196
    for i,(date,style,preview,col) in enumerate(HIST):
        slide=min(1.0,t*6-i*0.9)
        if slide<=0: continue
        y=88+i*ch
        if y+ch-10>SC_H: break
        card(d,16,y,SC_W-16,y+ch-14,r=14,border=BORDER_BR)
        d.text((32,y+18),date,font=fnt(FMONO,13),fill=TEXT_DIM)
        pill(d,SC_W-68,y+28,style,fnt(FH3,13),col)
        # icon for style
        sk_map={'おみくじ':'omikuji','タロット':'tarot','九星気学':'kyusei','四柱推命':'shichusuimei'}
        STYLE_ICONS[sk_map[style]](d,SC_W-68,y+64,col,sz=12)
        # preview text (max 2 lines)
        words=preview[:62]+'…'
        d.multiline_text((32,y+54),words,font=fnt(FH3,17),fill=TEXT,spacing=7)
        d.line([(32,y+ch-32),(SC_W-32,y+ch-32)],fill=BORDER,width=1)
        d.text((SC_W-32,y+ch-20),'詳細を見る ›',font=fnt(FMONO,12),fill=TEXT_DIM,anchor='rm')

# Outro
def scr_outro(d, frame, total):
    t=frame/total
    fade=min(1.0,t*2.0)
    cx2=SM; cy2=SC_H//2-50
    for ring in range(4,0,-1):
        r2=52+ring*32
        pulse=0.5+0.5*math.sin(frame*0.07+ring*0.9)
        a=0.05*pulse*fade
        col=(int(CYAN[0]*a*5),int(CYAN[1]*a*5),int(CYAN[2]*a*5))
        d.ellipse([cx2-r2,cy2-r2,cx2+r2,cy2+r2],outline=col,width=2)
    d.ellipse([cx2-56,cy2-56,cx2+56,cy2+56],
              fill=tuple(int(c*0.08*fade) for c in CYAN),
              outline=tuple(int(c*fade) for c in CYAN),width=3)
    glow_t(d,'占',cx2,cy2,fnt(FH6,54),tuple(int(c*fade) for c in CYAN))
    cf=tuple(int(c*fade) for c in CYAN)
    mf=tuple(int(c*fade) for c in MAGENTA)
    glow_t(d,'神託システム',SM,cy2+138,fnt(FH6,42),cf)
    d.text((SM,cy2+138),'神託システム',font=fnt(FH6,42),fill=cf,anchor='mm')
    d.text((SM,cy2+192),'AI FORTUNE ORACLE',font=fnt(FMONO,16),fill=mf,anchor='mm')
    if t>0.38:
        a2=min(1.0,(t-0.38)*3.5)
        tf=tuple(int(c*a2) for c in TEXT)
        d.text((SM,cy2+240),'あなただけのAI占い師',font=fnt(FH3,22),fill=tf,anchor='mm')
        d.text((SM,cy2+278),'毎日の占いをホーム画面から',font=fnt(FH3,18),
               fill=tuple(int(c*a2) for c in TEXT_DIM),anchor='mm')

# ── Segment list ──────────────────────────────────────────────────────────────

SEGS=[
    ('welcome',  scr_welcome,  120),
    ('apikey',   scr_apikey,    90),
    ('home',     scr_home,     120),
    ('ask',      scr_ask,      120),
    ('loading',  scr_loading,   90),
    ('reveal',   scr_reveal,   270),
    ('history',  scr_history,   90),
    ('outro',    scr_outro,     90),
]

# ── Frame composer ────────────────────────────────────────────────────────────

FADE=18

def make_frame(seg_name, renderer, local_f, total, seg_i, gframe):
    # 1. full canvas background
    img=Image.new('RGB',(W,H),BG)
    draw_bg(img, gframe)
    if seg_name in ('welcome','outro'):
        draw_matrix(img, gframe, alpha=0.26)

    # 2. phone shell (glow + body fill) — before screen so it acts as backdrop
    d=ImageDraw.Draw(img)
    draw_phone_shell(d, gframe)

    # 3. screen buffer (isolated — no overflow possible)
    sbuf=Image.new('RGB',(SC_W,SC_H),BG)
    sd=ImageDraw.Draw(sbuf)
    renderer(sd, local_f, total)

    # 4. paste screen into phone area (on top of shell body)
    img.paste(sbuf,(SC_X,SC_Y))

    # 5. phone top elements (border, notch) on top of screen content
    d=ImageDraw.Draw(img)
    draw_phone_top(d, gframe)
    draw_side_decorations(d, gframe)
    draw_hud(d, gframe)
    draw_page_dots(d, seg_i, len(SEGS), gframe)
    draw_feature(d, seg_name, local_f, total)

    # 5. CRT overlay
    img=crt_overlay(img)
    return img

def main():
    cmd=['ffmpeg','-y',
         '-f','rawvideo','-vcodec','rawvideo',
         '-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),
         '-i','pipe:0',
         '-vcodec','libx264','-crf','19','-preset','fast',
         '-pix_fmt','yuv420p','-movflags','+faststart',
         OUT]
    proc=subprocess.Popen(cmd, stdin=subprocess.PIPE)

    prev_last=None; gframe=0
    for si,(name,renderer,nf) in enumerate(SEGS):
        print(f'  [{si+1}/{len(SEGS)}] {name} ({nf}f)',flush=True)
        rendered=[make_frame(name,renderer,f,nf,si,gframe+f) for f in range(nf)]

        for fi,img in enumerate(rendered):
            out=img
            if prev_last is not None and fi<FADE:
                t2=fi/FADE; t2=t2*t2*(3-2*t2)
                out=Image.blend(prev_last,img,t2)
            is_last=si==len(SEGS)-1
            if not is_last and fi>=nf-FADE:
                nn,nr,nnf=SEGS[si+1]
                t2=(fi-(nf-FADE))/FADE; t2=t2*t2*(3-2*t2)
                nxt=make_frame(nn,nr,0,nnf,si+1,gframe+fi)
                out=Image.blend(img,nxt,t2)
            proc.stdin.write(out.tobytes())

        prev_last=rendered[-1]; gframe+=nf

    proc.stdin.close(); proc.wait()
    print(f'\nDone → {OUT}')

if __name__=='__main__':
    total=sum(n for _,_,n in SEGS)
    print(f'Rendering {total} frames (~{total//FPS}s)…')
    main()
