"""Extract existing raster symbols; does not generate replacement artwork."""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
SRC = OUT.parent / 'source'
items = [
    ('mode-stairs', 'Mode / stairs', 'buttons.jpg', (70, 100, 400, 225), 'black'),
    ('view-magnifier', 'View / magnifier', 'buttons.jpg', (425, 382, 625, 580), 'black'),
    ('deny-left-arrow', 'Deny / left arrow', 'hardware.jpg', (280, 1920, 530, 2130), 'red'),
    ('approve-right-arrow', 'Approve / right arrow', 'hardware.jpg', (1360, 1920, 1590, 2130), 'red'),
    ('moida-mansion', 'Original title', 'hardware.jpg', (600, 2250, 1285, 2595), 'black'),
]

def isolate(rgb, kind, name):
    r = rgb[:, :, 0].astype(float)
    if kind == 'black':
        alpha = np.clip((115-r)/50, 0, 1)
        binary = (alpha > .5).astype('uint8')
        n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
        keep = [i for i in range(1,n) if stats[i,4] > 100
                and stats[i,0] > 0 and stats[i,1] > 0
                and stats[i,0]+stats[i,2] < rgb.shape[1]
                and stats[i,1]+stats[i,3] < rgb.shape[0]]
        # Retain antialiased boundary pixels adjacent to the selected ink.
        region = cv2.dilate(np.isin(labels, keep).astype('uint8'), np.ones((3,3),np.uint8))
        return (alpha * region * 255).astype('uint8')
    # The lower arrows are solid red inside a red/black checker texture.
    # Opening removes the small checker cells; only the largest shape is kept.
    binary = ((r > rgb[:,:,1]*1.8) & (r > 100)).astype('uint8')*255
    clean = cv2.morphologyEx(binary, cv2.MORPH_OPEN,
                             cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(13,13)))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(clean, connectivity=8)
    mask = (labels == (1 + np.argmax(stats[1:,4]))).astype('uint8')*255
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contour = max(contours, key=cv2.contourArea).reshape(-1, 2).astype(float)
    # Smooth the measured contour locally instead of replacing it with straight
    # edges: retain the rounded arrowhead shoulders and the original silhouette.
    closed = np.vstack([contour, contour[0]])
    lengths = np.r_[0, np.cumsum(np.linalg.norm(np.diff(closed,axis=0),axis=1))]
    distance = np.arange(0,lengths[-1],1.0)
    sampled = np.column_stack([np.interp(distance,lengths,closed[:,axis]) for axis in (0,1)])
    offsets = np.arange(-15,16)
    weights = np.exp(-.5*(offsets/5.0)**2); weights /= weights.sum()
    vertices = sum(weight*np.roll(sampled,int(offset),axis=0)
                   for offset,weight in zip(offsets,weights))
    scale=4
    canvas=Image.new('L',(rgb.shape[1]*scale,rgb.shape[0]*scale),0)
    ImageDraw.Draw(canvas).polygon([tuple(v*scale) for v in vertices],fill=255)
    points=' '.join(f'{a:.3f},{b:.3f}' for a,b in vertices)
    (OUT/f'{name}.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {rgb.shape[1]} {rgb.shape[0]}"><polygon points="{points}" fill="black"/></svg>\n')
    return np.array(canvas.resize((rgb.shape[1],rgb.shape[0]),Image.Resampling.LANCZOS))

font_path='/System/Library/Fonts/Supplemental/Arial.ttf'
font=ImageFont.truetype(font_path,24)
small=ImageFont.truetype(font_path,18)
preview=Image.new('RGB',(1200,1150),'#f4f2ed')
d=ImageDraw.Draw(preview)
d.text((32,22),'MOIDA MANSION — RESOURCE EXTRACTIONS',font=font,fill='#202020')
d.text((32,57),'Original source crop',font=small,fill='#555555')
d.text((650,57),'Isolated ink • black on white • no physical scale',font=small,fill='#555555')
for idx,(name,label,filename,box,kind) in enumerate(items):
    crop=Image.open(SRC/filename).convert('RGB').crop(box)
    crop.save(OUT/f'{name}-source.png')
    alpha=Image.fromarray(isolate(np.array(crop),kind,name))
    bounds=alpha.getbbox()
    result=Image.new('RGBA',crop.size,(0,0,0,0)); result.putalpha(alpha)
    result=result.crop(bounds)
    result.save(OUT/f'{name}.png')
    y=95+idx*205
    d.text((32,y),label,font=small,fill='#222222')
    for x,im in [(32,crop),(650,result)]:
        tile=Image.new('RGBA',(510,165),'white')
        im=im.copy(); im.thumbnail((490,145),Image.Resampling.LANCZOS)
        if im.mode!='RGBA': im=im.convert('RGBA')
        tile.alpha_composite(im,((510-im.width)//2,(165-im.height)//2))
        preview.paste(tile.convert('RGB'),(x,y+28))
    if name=='moida-mansion':
        # Preserve the individual word images as well as the original stack.
        for word,rect in [('moida',(0,0,result.width,170)),('mansion',(0,175,result.width,result.height))]:
            word_im=result.crop(rect); word_im=word_im.crop(word_im.getbbox()); word_im.save(OUT/f'{word}.png')
preview.save(OUT/'preview.png')
