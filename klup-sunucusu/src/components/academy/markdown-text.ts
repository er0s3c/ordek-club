// Markdown belirteçlerinden düz metin üretimi (sunucu/istemci ortak; "use client" değil).

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
export const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);

// Ham HTML'den yalnız düz metin: önce varlıklar çözülür (&lt;script&gt; da etiket sayılsın), sonra iç içe/parçalı
// etiketler ("<scr<script>ipt>") kalmayana dek silinir, artakalan açılı ayraçlar atılır. Sonuç React metni olarak basılır.
export function stripTags(s: string): string {
  let out = decode(s);
  for (let prev = ""; prev !== out; ) {
    prev = out;
    out = out.replace(/<[^>]*>/g, "");
  }
  return out.replace(/[<>]/g, "");
}
