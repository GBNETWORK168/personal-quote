# 每日抓臺灣銀行 USD 即期賣出匯率 → data/fx.json；抓不到則改用 open.er-api.com 中價
import csv,io,json,datetime,urllib.request
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
d=datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=8); out=None
try:
    t=get('https://rate.bot.com.tw/xrt/flcsv/0/day').decode('utf-8-sig')
    rows=list(csv.reader(io.StringIO(t)))
    h=rows[0]; i=h.index('本行賣出') if '本行賣出' in h else 11
    R={r[0].strip():round(float(r[i+2]),4) for r in rows[1:] if r and r[0].strip() and float(r[i+2] or 0)>0}
    if R.get('USD'): out={'usd':round(R['USD'],2),'date':d.strftime('%Y-%m-%d'),'src':'臺灣銀行 即期賣出','rates':R}
except Exception as e: print('BOT fail',e)
if not out:
    j=json.loads(get('https://open.er-api.com/v6/latest/USD'))
    out={'usd':round(j['rates']['TWD'],2),'date':d.strftime('%Y-%m-%d'),'src':'open.er-api.com'}
print(out); json.dump(out,open('data/fx.json','w'),ensure_ascii=False)
