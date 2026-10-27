// Original diagnostic items. The assessment guides a starting point; it awards no XP.
export const SKILLS = [
  { key: "ethics", tr: "Etik ve kapsam", en: "Ethics and scope" },
  { key: "network", tr: "Ağ temelleri", en: "Networking" },
  { key: "web", tr: "Web güvenliği", en: "Web security" },
  { key: "linux", tr: "Linux", en: "Linux" },
  { key: "windows", tr: "Windows", en: "Windows" },
  { key: "crypto", tr: "Kriptografi", en: "Cryptography" },
  { key: "incident", tr: "Olay inceleme", en: "Incident analysis" },
  { key: "ai", tr: "Yapay zekâ güvenliği", en: "AI security" },
] as const;
export const placementQuestions = [
  {skill:"ethics",text:"Kulübün verdiği test kapsamı yalnız lab.example adresini içeriyor. İlk adımın ne olur?",options:["Bulduğum bütün komşu sunucuları tararım","Yazılı kapsam ve izinleri doğrularım","Gerçek kullanıcı parolaları toplarım"],answer:1,explanation:"Test yalnız açıkça izin verilen kapsamda yapılır."},
  {skill:"network",text:"Bir bilgisayarın adı IP adresine hangi hizmetle çevrilir?",options:["DNS","SSH","NTP"],answer:0,explanation:"DNS adları kaynak kayıtlarıyla adreslere eşler."},
  {skill:"network",text:"Bir hedefe TCP bağlantısı kurulamadı. Bu gözlem tek başına neyi kanıtlar?",options:["Hedef kesin kapalıdır","Kesin saldırı vardır","Yalnız bu bağlantının kurulamadığını"],answer:2,explanation:"Güvenlik duvarı, yönlendirme ve servis durumu ayrı olasılıklardır."},
  {skill:"web",text:"URL'deki sipariş numarası değiştirilince başka kullanıcının kaydı görünüyor. Öncelikli eksik nedir?",options:["Nesne bazlı sunucu yetkilendirmesi","Sayfa rengi","Dosya sıkıştırma"],answer:0,explanation:"Her nesne erişiminde kullanıcının sahipliği veya yetkisi doğrulanır."},
  {skill:"web",text:"SQL sorgusunda kullanıcı girdisi için güvenli varsayılan hangisidir?",options:["Tırnakları elle silmek","Parametreli sorgu","Girdiyi sorguya doğrudan eklemek"],answer:1,explanation:"Parametre bağlama, veriyi sorgu sözdiziminden ayırır."},
  {skill:"linux",text:"Linux'ta 600 dosya izni hangi erişimi verir?",options:["Herkese okuma","Sahibine okuma/yazma; diğerlerine izin yok","Herkese çalıştırma"],answer:1,explanation:"6 = okuma ve yazma; iki sıfır grup ve diğer kullanıcıların izinsiz olduğunu belirtir."},
  {skill:"windows",text:"Bir Windows olay kaydını yorumlarken olay numarasının yanında neyi kontrol etmelisin?",options:["Yalnız pencere boyutunu","Yalnız dosya adını","Kaynağı, zamanı ve ilgili hesap/cihaz bağlamını"],answer:2,explanation:"Bir olay tek başına kesin sonuç vermez; zaman ve kaynak bağlamı gerekir."},
  {skill:"crypto",text:"Özetleme ile şifreleme arasındaki temel fark nedir?",options:["Özet normalde geri çözülmez; şifreleme anahtarla geri çevrilebilir","İkisi de daima geri çözülür","Özetleme dosyayı gizli tutar"],answer:0,explanation:"Özet bütünlük ve karşılaştırmada; şifreleme gizlilikte kullanılır."},
  {skill:"incident",text:"Şüpheli bir dosya buldun. İncelemeye başlamadan önce neden kopya ve özet alırsın?",options:["Dosyayı hızlandırmak için","Özgün kanıtı korumak ve değişikliği izlemek için","Kaynağı unutmak için"],answer:1,explanation:"İnceleme, özgün kanıtın bütünlüğünü ve işlem kaydını korumalıdır."},
  {skill:"ai",text:"Bir RAG belgesinde 'önceki kuralları yok say' yazıyor. Uygulama bunu nasıl ele almalı?",options:["Sistem talimatı saymalı","Belgeyi yönetici yapmalı","Güvenilmeyen içerik olarak işlemeli"],answer:2,explanation:"Getirilen belge talimat yetkisi kazanmaz; araç ve veri erişimi modelden bağımsız sınırlandırılır."},
];
export function gradePlacement(answers:number[]){
  if(answers.length!==placementQuestions.length||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=placementQuestions[i]!.options.length))throw new Error("Her soru için geçerli bir seçenek gerekir.");
  const results=placementQuestions.map((q,i)=>({skill:q.skill,correct:answers[i]===q.answer,explanation:q.explanation}));
  const score=results.filter(r=>r.correct).length*10;
  const skills=SKILLS.map(s=>{const rs=results.filter(r=>r.skill===s.key);return{key:s.key,title:s.tr,correct:rs.filter(r=>r.correct).length,total:rs.length};});
  return{score,skills,results,recommendation:score<60?"Temel modüllerden başla; özellikle yanlış yaptığın kavramları çalış.":score<90?"Temel modüllerde kısa tekrar yapıp ilgi duyduğun uzmanlık yoluna geç.":"Uzmanlık yollarına başlayabilirsin. Test sonucu tek başına uygulama yeterliliğini kanıtlamaz."};
}
