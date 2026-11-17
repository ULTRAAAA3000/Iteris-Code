import sys, numpy as np, cv2
from PIL import Image
# ПРОТОТИП (17.11.2026): ріже лист 3+2 пози й прибирає фон через GrabCut. Запуск: python3 cutout-prototype.py <id героя> (читає <id>.webp поруч, пише <id>-1..5.png і prev-<id>.png у поточну папку).
# Потребує opencv-python, numpy, pillow. Якість див. README.md (неонові ефекти й тіні потребують ручної доводки).
SHEETS_UNUSED={"lulu":"95148422","noa":"d1acf6aa","andrew":"49e31b06","mika":"64ef4ec6","mo":"7d807039","piko":"b66862d2","nox":"334adbfe","rex":"6c9ae124","teo":"c8b48eeb"}
def cells(w,h):
    t=h//2-10
    top=[(0,0,w//3,t),(w//3,0,2*w//3,t),(2*w//3,0,w,t)]
    bot=[(0,t,w//2,h),(w//2,t,w,h)]
    return top+bot
def cut(img_bgr):
    h,w=img_bgr.shape[:2]
    mask=np.full((h,w),cv2.GC_PR_FGD,np.uint8)
    b=10; mask[:b]=mask[-b:]=0; mask[:,:b]=mask[:,-b:]=0
    # outer ring of 40px is probable background
    ring=np.ones((h,w),bool); ring[40:-40,40:-40]=False
    mask[ring&(mask!=0)]=cv2.GC_PR_BGD
    bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
    cv2.grabCut(img_bgr,mask,None,bg,fg,6,cv2.GC_INIT_WITH_MASK)
    m=((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD)).astype(np.uint8)*255
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    # keep components bigger than a small area (drops floor-shadow specks), feather edge
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    keep=np.zeros_like(m)
    for i in range(1,n):
        if st[i,cv2.CC_STAT_AREA]>600: keep[lab==i]=255
    keep=cv2.GaussianBlur(keep,(0,0),1.2)
    return keep
name=sys.argv[1]
im=cv2.cvtColor(np.array(Image.open(f"{name}.webp").convert("RGB")),cv2.COLOR_RGB2BGR)
H,W=im.shape[:2]
out=[]
for i,(x0,y0,x1,y1) in enumerate(cells(W,H)):
    c=im[y0:y1,x0:x1]
    a=cut(c)
    rgba=np.dstack([cv2.cvtColor(c,cv2.COLOR_BGR2RGB),a])
    ys,xs=np.where(a>20)
    rgba=rgba[ys.min():ys.max()+1,xs.min():xs.max()+1]
    Image.fromarray(rgba,"RGBA").save(f"{name}-{i+1}.png"); out.append(rgba)
# preview on white and checker
hmax=max(o.shape[0] for o in out); 
def comp(bgcol):
    row=[]
    for o in out:
        canvas=np.full((hmax,o.shape[1]+10,3),bgcol,np.uint8)
        a=o[...,3:4]/255.0
        canvas[hmax-o.shape[0]:,5:5+o.shape[1]]=(o[...,:3]*a+canvas[hmax-o.shape[0]:,5:5+o.shape[1]]*(1-a)).astype(np.uint8)
        row.append(canvas)
    return np.hstack(row)
p=np.vstack([comp((255,255,255)),comp((40,40,40))])
Image.fromarray(p).save(f"prev-{name}.png")
print(name,p.shape)
