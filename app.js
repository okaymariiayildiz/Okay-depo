const $ = (id) => document.getElementById(id);
let durum = durumOku();
let zamanlayici = null;

function rota() { return VERI.rotalar[durum.takim] || []; }
function guvenliUrl(u) {
  u = (u || "").trim();
  return /^https?:\/\//i.test(u) ? u.replace(/"/g, "%22") : "";
}
function bolumGoster(ad) {
  ["secim", "hazir", "oyun", "bitis"].forEach((b) => $(b).classList.toggle("gizli", b !== ad));
  $("ust").classList.toggle("gizli", ad === "secim");
}

function takimSecimiCiz() {
  const kutu = $("takimlar");
  kutu.innerHTML = "";
  Object.keys(VERI.rotalar).forEach((n) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = "Takım " + n;
    b.onclick = () => takimSec(n);
    kutu.appendChild(b);
  });
}
function takimSec(n) {
  durum = { takim: n, baslangic: null, tamamlanan: [] };
  durumYaz(durum);
  ekranAc();
}
function takimDegistir() {
  if (!confirm("Takımı değiştirirseniz bu telefondaki ilerleme silinir. Emin misiniz?")) return;
  clearInterval(zamanlayici);
  durumSil();
  durum = {};
  ekranAc();
}
function baslat() {
  durum.baslangic = Date.now();
  durumYaz(durum);
  senkronGonder(durum);
  ekranAc();
}

function ekranAc() {
  clearInterval(zamanlayici);
  if (!durum.takim) { bolumGoster("secim"); return; }
  $("takimAd").textContent = "Takım " + durum.takim;
  if (!durum.baslangic) {
    $("hazirTakim").textContent = "Takım " + durum.takim;
    $("hazirNokta").textContent = VERI.etkinlik.baslangic_bitis_noktasi;
    $("hazirSure").textContent = VERI.etkinlik.sure_dakika;
    $("sayac").textContent = bicim(sureSaniye());
    bolumGoster("hazir");
    return;
  }
  zamanlayici = setInterval(sayacGuncelle, 1000);
  sayacGuncelle();
  if (durum.tamamlanan.length >= rota().length) { bitisGoster(); return; }
  listeCiz();
  bolumGoster("oyun");
}

function sayacGuncelle() {
  const k = kalanSaniye(durum);
  $("sayac").textContent = bicim(k);
  $("ust").classList.toggle("az", k <= 600);
  const bitti = k === 0;
  $("sureDoldu").classList.toggle("gizli", !bitti);
  const giris = $("kodGiris"), dugme = $("kodDugme");
  if (giris) { giris.disabled = bitti; dugme.disabled = bitti; }
}

function listeCiz() {
  const r = rota(), tam = durum.tamamlanan.length;
  const kutu = $("liste");
  kutu.innerHTML = "";
  $("ilerleme").textContent = tam + " / " + r.length + " istasyon tamamlandı";
  r.forEach((id, i) => {
    const ist = VERI.istasyonlar[id];
    const div = document.createElement("div");
    const durumSinif = i < tam ? "tamam" : i === tam ? "aktif" : "kilitli";
    div.className = "kart istasyon " + durumSinif;
    let ic = '<div class="no">' + (i < tam ? "✓" : i + 1) + "</div><div style='flex:1'>";
    ic += "<h2>" + ist.ad + "</h2>";
    const konum = guvenliUrl(ist.konum);
    if (i === tam) {
      ic += "<p>" + ist.gorev + "</p>";
      if (konum) ic += '<a class="btn konum" href="' + konum + '" target="_blank" rel="noopener">📍 Konuma git</a>';
      ic += '<p class="soluk" style="margin:14px 0 0">Görevi bitirince yetkilinin verdiği şifreyi yazın:</p>' +
        '<input id="kodGiris" type="text" placeholder="ŞİFRE" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false">' +
        '<div id="hata" class="hata"></div>' +
        '<button id="kodDugme" class="btn">Kodu Gönder</button>';
    } else if (i < tam) {
      ic += '<div style="color:var(--yesil);font-weight:700">✅ Görev tamamlandı</div>';
    } else {
      ic += '<div class="soluk">🔒 Önceki istasyonu bitirince açılır</div>';
    }
    div.innerHTML = ic + "</div>";
    kutu.appendChild(div);
  });
  const giris = $("kodGiris");
  if (giris) {
    $("kodDugme").onclick = kodDene;
    giris.addEventListener("keydown", (e) => { if (e.key === "Enter") kodDene(); });
  }
  sayacGuncelle();
}

function kodDene() {
  if (kalanSaniye(durum) === 0) return;
  const id = rota()[durum.tamamlanan.length];
  const dogru = normalize(VERI.istasyonlar[id].kod);
  const girilen = normalize($("kodGiris").value);
  if (!girilen) { $("hata").textContent = "Lütfen şifreyi yazın."; return; }
  if (girilen !== dogru) {
    $("hata").textContent = "❌ Yanlış şifre! Yetkiliden tekrar isteyin.";
    const g = $("kodGiris");
    g.classList.remove("sarsil"); void g.offsetWidth; g.classList.add("sarsil");
    if (navigator.vibrate) navigator.vibrate(200);
    g.select();
    return;
  }
  durum.tamamlanan.push({ id, ts: Date.now() });
  durumYaz(durum);
  senkronGonder(durum);
  ekranAc();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bitisGoster() {
  const gecen = Math.floor(((durum.tamamlanan.at(-1).ts) - durum.baslangic) / 1000);
  $("bitisSure").textContent = bicim(gecen) + " (dk:sn)";
  $("bitisNokta").textContent = VERI.etkinlik.baslangic_bitis_noktasi;
  const bk = guvenliUrl(VERI.etkinlik.baslangic_bitis_konum), bl = $("bitisKonum");
  bl.classList.toggle("gizli", !bk);
  if (bk) bl.href = bk;
  clearInterval(zamanlayici);
  $("sayac").textContent = bicim(Math.max(0, sureSaniye() - gecen));
  bolumGoster("bitis");
}

(async function () {
  try { await veriYukle(); }
  catch (e) {
    document.querySelector("main").innerHTML =
      '<div class="kart"><h2>Veri yüklenemedi</h2><p>data.json okunamadı. Siteyi dosyaya çift tıklayarak değil, bir sunucu (veya GitHub Pages) üzerinden açın.</p></div>';
    return;
  }
  document.title = VERI.etkinlik.ad;
  $("etkinlikAd").textContent = VERI.etkinlik.ad;
  $("nokta").textContent = VERI.etkinlik.baslangic_bitis_noktasi;
  if (durum.takim && !VERI.rotalar[durum.takim]) durum = {};
  takimSecimiCiz();
  $("baslat").onclick = baslat;
  document.querySelectorAll(".degistir").forEach((b) => (b.onclick = takimDegistir));
  ekranAc();
})();
