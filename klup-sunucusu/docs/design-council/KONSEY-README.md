# CIU Cyber Security Club — 16 Ajanlı Tasarım Konseyi

Claude Code ile kullanılmak üzere 16 özgün UX/eğitim/öğrenci perspektifi subagent tanımı ve ana yönlendirme promptu.

## Kurulum

1. Bu ZIP içindeki `.claude/agents/` klasörünü **kendi projenin kök dizinine** kopyala. Projede zaten `.claude/` varsa içeriğini birleştir, mevcut ajanları silme.
2. `MASTER_PROMPT.md` dosyasının tüm içeriğini Claude Code oturumuna yapıştır.
3. `.claude/agents/` klasörünü ilk kez oluşturduysan Claude Code'u yeniden başlatman gerekebilir.
4. Eğer ajanların birbiriyle **doğrudan mesajlaşmasını** istiyorsan Claude Code Agent Teams (deneysel) modunu etkinleştir; aksi durumda ana Claude ajanı subagent raporları arasında tartışma yönetir.

PowerShell (Windows) terminalinde, yalnızca bu oturum için:

```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
claude
```

Claude Code'un resmi dokümantasyonu: https://code.claude.com/docs/en/sub-agents ve https://code.claude.com/docs/en/agent-teams

## Model kullanımı

- Zorlu tasarım, pedagojik karar, hikâye ve mimari ajanlarında `opus` alias kullanılmıştır.
- Diğer ajanlar `sonnet` alias kullanır.
- Bu alias'lar sağlayıcının o an desteklediği modele çözülür; sabit sürüm pinlenmemiştir.
- 16 ajan pahalı olabilir: önce üç tasarım + üç öğrenci + hikâyeci + eğitim uzmanı olmak üzere 8 kritik ajandan başlayıp diğerlerini ikinci dalgada kullanabilirsin. Ana prompt ise tüm 16 rolün sonunda görüş vermesini talep eder.

## Önemli kısıtlar

- Bu paketin **ajanları tanımlanmıştır** ancak senin bilgisayarında otomatik olarak çalıştırılmış değildir; Claude Code içine yerleştirilince çalışır.
- Öğrenci ajanları gerçek öğrencilerle yapılmış araştırma değildir.
- TryHackMe / Hack The Box personeli taklit edilmez; orijinal arayüz kopyalanmaz.
- Mr. Robot'tan yalnızca tür/atmosfer ilhamı alınır; Elliot karakteri veya replikleri kopyalanmaz.
- Varsayılan ajan yetkileri salt-okumadır. Kod yazma ve sistem değişiklikleri ana ajan eliyle güvenli biçimde yürütülür.
