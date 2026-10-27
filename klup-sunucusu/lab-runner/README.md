# Ayrı Linux lab çalıştırıcısı

Bu servis **Club makinesinde başlatılmaz**. Linux, Docker, kayıtlı `runsc` çalışma zamanı, Node.js 22+ ve yalnız bu servis için ayrılmış karşılıklı TLS sertifikaları gerekir. Club'ın erişimi özel ağla sınırlandırılmalıdır. Ortak CA farklı uygulamalara istemci sertifikası vermemelidir.

Bu depodaki ilk lab `linux-permissions` görevidir. 24 Ekim 2026'da yerel Ubuntu WSL VM'de gerçek
gVisor başlangıcı, mTLS, iki bağımsız dosya alanı, terminal komutu, çözüm doğrulama, sıfırlama,
20 eşzamanlı PTY'de komut çalıştırma ve 21. oturumun kuyruktan terfisi doğrulandı. Sentetik test
oturumları temizlendi. Bu ölçümler yerel VM'ye aittir; üretim hostunda yeniden çalıştırılmalıdır.
Uzun süreli yük, süre/hareketsizlik ve zorla servis kesintisi senaryoları ayrıca doğrulanmalıdır.

## Docker ile kurulum

Çalıştırıcı da Docker konteyneridir. Öğrenci konteynerlerini ayrı Linux Docker motorunda oluşturur.
Club uygulamasına Docker soketi bağlanmaz. Çalıştırıcı, Docker soketini kullanabildiğinden lab hostunu
yönetebilen güvenilir bir servistir; lab hostu/VM Club'ın veritabanını veya dosya deposunu barındırmaz.
Öğrenci konteynerlerine soket, host dosyası veya ağ bağlantısı verilmez.

Lab hostunda Docker Compose, OpenSSL ve Docker'a kayıtlı `runsc` gerekir. gVisor'u
[resmî kurulum belgesine](https://gvisor.dev/docs/user_guide/install/) göre kurun. Kurulum script'i
`runsc` yoksa durur; varsayılan Docker runtime'ına düşmez. UID 1000 olan servis operatörüyle:

```bash
cd klup-sunucusu
# DNS/IP sertifika SAN'ına eklenir. İkinci adres yalnız özel ağ arayüzüdür.
bash scripts/labs.sh setup lab.kampus.example 10.20.30.40
bash scripts/labs.sh up
bash scripts/labs.sh status
bash scripts/labs.sh check
```

Örnek DNS/IP adreslerini gerçek özel ağ adresleriyle değiştirin. Yerel VM denemesi için
`bash scripts/labs.sh setup localhost` yalnız 127.0.0.1:9443'ü yayımlar. Hazırlık, resmi Node/Docker/Debian
imajlarını indirip digest'lerini `.env.labs` dosyasına sabitler ve öğrenci imajını derler. Sertifikalar
`storage/lab-pki` altında üretilir. Mevcut yapılandırma veya sertifikaların üzerine yazılmaz.
CA beş yıl, sunucu/istemci sertifikaları bir yıl geçerlidir; süre dolmadan yenilenmelidir.
CA özel anahtarı çalışma konteynerlerine bağlanmaz. Çalıştırıcının sağlık kontrolü ayrı istemci
sertifikasıyla mTLS kullanır. TLS'de SAN/CA doğrulaması hiçbir adımda kapatılmaz.

Club hostuna yalnız `ca.pem`, `club-client.pem`, `club-client-key.pem` aktarın; dosyaları uygulamanın
UID 1000 kullanıcısının okuyabileceği biçimde koruyun. Club `.env` dosyasına `CLUB_LAB_URL` özel
HTTPS adresini yazın. Docker'daki Club uygulaması için:

```bash
docker compose -f compose.yaml -f compose.lab-client.yaml up -d --build app
docker compose -f compose.yaml -f compose.lab-client.yaml exec -T app node dist/cli.js lab-enable
```

Son komut, sağlık kontrolü başarılıysa özelliği aktif kulüp üyelerine açar ve denetim kaydı oluşturur.
Öğrenciye ayrı Linux parolası veya sertifika verilmez. Club üyelik oturumuyla `/academy/labs` ekranına
girer; kullanıcı başına tek oturum, toplam 20 çalışan oturum, 30 dakika süre, 10 dakika hareketsizlik,
1 CPU/512 MiB/128 süreç sınırı sunucuda uygulanır. 21. öğrenci sıraya alınır. Bu sayı yük testiyle
ayrıca doğrulanmalıdır. Üyelerin erişeceği gerçek Club adresini `APP_URL` olarak yapılandırın;
lab portunu öğrencilere açmanız gerekmez.

Club'ı `npm run dev` ile çalıştırıyorsanız dört `CLUB_LAB_*` ayarını yerel sertifika yollarıyla
doldurun ve sunucuyu yeniden başlatın. Ardından:

```bash
npm run lab:check
npm run lab:pilot-test
npm run lab:pilot-test -- --capacity
npm run cli -- lab-enable
```

Pilot komutları gerçek, sentetik oturumlar açar; öğrenci kaydı/XP oluşturmaz. Normal test iki
oturumda mTLS, kabuk, ayrı dosya alanları, doğrulama ve sıfırlamayı denetler. `--capacity` ayrıca
21 sentetik kullanıcıyla 20 çalışan/1 sırada durumunu, 20 açık PTY'de komut çalıştırmayı ve boşalan yere geçişi denetler. Sonunda yalnız
bu testin başlattığı oturumlar sonlandırılır. Testleri boş lab çalıştırıcısında yürütün.

Windows geliştirme ortamında Docker Desktop'ın runtime ayarları değiştirilmez. Mevcut Ubuntu WSL VM
içinde bağımsız bir geliştirme motoru kurmak için açık operatör komutu:

```bash
# Ubuntu WSL içinde, proje dizininden:
sudo bash lab-runner/install-wsl-engine.sh
export DOCKER_HOST=unix:///run/ordek-lab/docker.sock
unset DOCKER_CONTEXT
bash scripts/labs.sh setup localhost
bash scripts/labs.sh up
```

Bu yardımcı yalnız yeni `ordek-lab-docker` systemd servisini, `/run/ordek-lab/docker.sock` soketini
ve `/var/lib/ordek-lab-docker` veri alanını kullanır. Docker Desktop servislerini yeniden başlatmaz.
gVisor resmi arşivinin SHA-512 toplamı doğrulanır. Sabit Docker Engine paketi kullanılan bu yol
yerel geliştirme içindir; üretimde paket yöneticisiyle güncellenen ayrı Linux host kullanın.
[Docker'ın statik kurulum açıklaması](https://docs.docker.com/engine/install/binaries/).

Kapatma: `bash scripts/labs.sh stop` aktif oturumları kapatır; dosyalar geçicidir. Zorla kapanıştan
sonra eski etiketli konteynerler kalırsa servis otomatik silme yapmadan durur. Operatör incelemesi gerekir.

## Hazırlık

```sh
cd klup-sunucusu/lab-runner
npm ci
npm test
docker info --format '{{json .Runtimes}}'
```

`runsc` yoksa servis açılmaz. Başlangıçta eski lab konteynerleri bulunursa **hiçbirini silmeden** durur; operatörün kimlikleri kontrol ederek uzlaştırması gerekir.

Güvenilir, platforma uygun ve digest'i doğrulanmış bir Debian taban imajıyla eğitim imajını oluşturun:

```sh
docker build --build-arg BASE_IMAGE='debian@sha256:GERCEK_DOGRULANMIS_DIGEST' \
  -t ordek-linux-permissions:v1 images/linux-permissions
docker image inspect ordek-linux-permissions:v1 --format '{{.Id}}'
```

Çıktıdaki gerçek `sha256:...` kimliğini `LAB_IMAGE` olarak kullanın. Etiket tek başına kabul edilmez. Çalışma sırasında imaj çekilmez. Yerel imaj kimliği desteklendiğinden bir kayıt sunucusuna yayımlamak gerekmez.

## Çalıştırıcı yapılandırması

```sh
export LAB_IMAGE='sha256:GERCEK_YEREL_IMAJ_KIMLIGI'
export LAB_TLS_CA='/etc/ordek-lab/ca.pem'
export LAB_TLS_CERT='/etc/ordek-lab/server.pem'
export LAB_TLS_KEY='/etc/ordek-lab/server-key.pem'
export LAB_BIND='OZEL_AG_IP_ADRESI'
export LAB_PORT=9443
npm start
```

Yer tutucuları gerçek değerlerle değiştirin. Anahtarı yalnız servis kullanıcısı okuyabilmelidir. Servis Docker kullanabildiği için ayrı makine/VM sınırı önemlidir. Bu komutlar otomatik çalıştırılmaz.

Club sunucusunda:

```dotenv
CLUB_LAB_URL=https://lab.ic-ag.example:9443
CLUB_LAB_CA=/run/secrets/lab-ca.pem
CLUB_LAB_CERT=/run/secrets/club-client.pem
CLUB_LAB_KEY=/run/secrets/club-client-key.pem
```

Sertifikanın SAN alanı adresle eşleşmeli; TLS doğrulamasını kapatmayın. `compose.yaml` kullanırken bu dosyaları salt okunur secret/bind olarak ayrıca bağlayın ve dört değişkeni uygulama servisine aktarın. Sertifika veya host erişimi olmadan Lab özelliği açılmamalıdır.

Club dizininde `npm run lab:check` çalıştırın. Bu komut eksik ayarları listeler; ayarlar hazırsa
karşılıklı TLS ile yalnız `/health` adresini sorgular. Oturum veya konteyner başlatmaz. Ayarları
değiştirdikten sonra Club sunucusunu yeniden başlatın. Yönetim → Özellikler ekranında yerel kurulum
durumu görünür; öğrenciye sertifika yolları veya sunucu adresi gösterilmez. Sağlık kontrolünün başarılı
olması, aşağıdaki pilot kabul ve kapasite testlerinin tamamlandığı anlamına gelmez.

## Sözleşme ve sınırlar

- `POST /session`: mTLS ile `{userId, action, lab:"linux-permissions"}`. `action`: start/status/stop/reset/ticket/check.
- `/terminal?ticket=...`: 30 saniyelik, tek kullanımlık bağlantı bileti. Tarayıcı doğrudan çalıştırıcıya bağlanmaz; Club `/ws/lab` üzerinden kullanıcı oturumunu doğrular ve vekillik eder.
- Kullanıcı başına bir oturum; 20 çalışan oturum; bekleyenler dahil en fazla 100 kayıt.
- Oturum: 30 dakika; 10 dakika giriş yapılmaması hâlinde kapanış.
- 1 CPU, 512 MiB, 128 süreç, salt okunur kök, kısıtlı tmpfs, ağ erişimi kapalı, yetkisiz kullanıcı, gVisor zorunlu.
- Çözüm kontrolü sabit komutla dosya izinlerini okur. İstemcinin “başardım” beyanı kabul edilmez.
- Geçerli oturum sonlandırılırken ad, konteyner kimliği ve bu servis sürecinin etiketi birlikte doğrulanır. Toplu veya başlangıç temizliği yoktur.
- İlerleme Club veritabanında kalır. Konteyner dosyaları geçicidir. Çalıştırıcı yeniden başlarsa eski oturumlar operatör uzlaştırması gerektirir.
- İlk PTY sürümünde dinamik satır/sütun yeniden boyutlandırma yoktur.

## Pilot kabul testi

1. İstemci sertifikası olmadan HTTP ve WebSocket reddedilmeli.
2. Bir öğrencinin bileti başka öğrencinin tarayıcı oturumundan kullanılamamalı.
3. Konteynerden kampüs/internet/host ağına erişim olmamalı; host dosyaları bağlanmamalı.
4. Yirmi oturum çalışırken 21. öğrenci kuyruğa girmeli; boşalan yer sıradakine geçmeli.
5. Süre dolması, hareketsizlik, bağlantı kopması, sıfırlama ve servis yeniden başlatma denenmeli.
6. Aynı çözüm yeniden doğrulandığında yeni öğrenme ödülü oluşmamalı.

Bu kontroller geçmeden sistem genel kullanıma açılmamalıdır.
Çalıştırıcıya 2 CPU, 1 GiB bellek ve 512 süreç bütçesi ayrılır; bu bütçe eşzamanlı Docker exec
istemcilerini kapsar. Öğrenci başına 1 CPU/512 MiB/128 süreç sınırı ayrı uygulanır.

