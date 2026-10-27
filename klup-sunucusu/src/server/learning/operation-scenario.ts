// Original, versioned scenario. No live targets or real credentials are involved.
export const scenario={
  version:1,title:"Şüpheli Mesaj · MF-021",roles:["Mesaj inceleme","Giriş kayıtları","Alan adı inceleme"],
  briefing:"Mavi Fener'in etkinlik hesabından beklenmeyen bir bağlantı paylaşılmış. Kanıtlarını takımınla incele; gözlem ile varsayımı ayır.",
  evidence:[
    {title:"E-posta",text:"From: Event Desk <events@mavifener-help.example>\nSubject: Davetli listesini doğrula\nBağlantı: https://mavifener-help.example/account\nİstek: Mevcut parolanı yazarak listeyi doğrula."},
    {title:"Giriş kayıtları",text:"08:42 account=events src=192.0.2.12 result=failed\n08:43 account=events src=192.0.2.12 result=success\n08:44 account=events action=share-link\nNot: Kaynak adresi tek başına kişinin kimliğini kanıtlamaz."},
    {title:"Alan adı kartı",text:"Kurumun bilinen adresi: mavifener.example\nMesajdaki adres: mavifener-help.example\nTLS: sertifika sunulmuş\nNot: HTTPS, sitenin kuruma ait olduğunu tek başına kanıtlamaz."},
  ],
  stages:[
    {title:"İlk müdahale",question:"İlk olarak hangi adımı öneriyorsun?",choices:["İlgili oturumları iptal et ve hesap sahibini bilinen kanaldan doğrula","Bağlantıyı açıp mevcut parolayı dene","Kanıt toplamadan tüm kurumu çevrim dışı bırak"],outcomes:["İlgili oturumlar sınırlandı; hesap sahibinden doğrulama isteniyor.","Deneme parolası kurgusal sahte forma iletildi. Parola yenileme ve oturum iptali artık öncelikli.","Geniş kesinti oluştu; kanıtın kapsamı henüz bu müdahaleyi desteklemiyor."]},
    {title:"Yeni kanıt",question:"Hesap sahibi mesajı göndermediğini doğruladı. Sonraki adımın ne?",choices:["Kanıtları koru, erişimi sınırla, parola/MFA ve kapsam incelemesini yürüt","Kayıtları silip hesabı kullanmaya devam et","Kanıt olmadan başka hesapları suçla"],outcomes:["Kanıt korundu; sınırlama ve doğrulama adımları gerekçelendirildi.","Olayın yeniden kurulması zorlaştı; kanıt bütünlüğü zarar gördü.","Desteklenmeyen varsayım gerçek bulguların önüne geçti."]},
  ],
  debrief:"Gönderen adı, HTTPS ve tek bir başarılı giriş ayrı ayrı güven kanıtı değildir. Alan adını bağımsız doğrula, kanıtı koru, müdahaleyi gözlenen etkiyle orantılı seç. Seçimlerin gerekçesini raporla.",
};
export function visibleEvidence(team:number,solo:boolean,stage:number){return scenario.evidence.filter((_,i)=>solo||stage>=1||i===team);}
