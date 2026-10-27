---
id: e-05
baslik: "RAG security: how does a poisoned document get into the knowledge base?"
hedefler:
  - Recognise the types of poisoned document and data poisoning
  - Protect RAG with document metadata, access filtering and source verification
---

# RAG security: how does a poisoned document get into the knowledge base?

> In RAG the attacker does not even need to talk to the model; **getting one document into the knowledge base** is enough.
> 🎭 **Voice 5:** Announcements posted on the campus forum slip into Mirror's knowledge base by themselves overnight. Nobody checks them.

::cizgi[e-05-sahne]

## Types of poisoned document

| Type | What does it do? | Example |
|---|---|---|
| Hidden instruction | Indirect injection | An HTML comment, white text on a white background |
| False information | Misleads the user | "Email your password to this address" |
| Search trap | Stuffs in popular words so it is fetched for every question | "scholarship exam dormitory library…" |

Data poisoning (LLM04) is the training-side version of the same idea: putting bad examples into the data used to train
or fine-tune a model.

## Verify the source

Add **metadata** to every document and use it when fetching:

- `kaynak`: an official unit, a forum, or an unknown upload?
- `tarih` and `yukleyen`: who added it, and when?
- `erisim`: everyone, or staff only?

Keep user content and official content in **separate collections**. Show the source in the answer so the user can check it.

## The front door of the knowledge base

![A guard at the library entrance checking documents one by one; a document dripping poisonous green is turned away](../../gorseller/e-05-b.webp)

```text
upload → clean (HTML comments, hidden styling, invisible characters) → scan (instruction patterns) → approve → index
```

- Only authorised units write to the official collection.
- During retrieval the user's authority is filtered (E04). If this filter is forgotten in the vector search,
  a secret document comes back too because it is "similar" (LLM08).
- Every suspicious document is logged and can be rolled back.

## 🧪 Try it (5 min)

Open `lab/e-ayna-belgeler.jsonl` in a text editor (without running anything):

1. Find the document carrying a hidden instruction.
2. Find the document containing false information. Which metadata field warned you? Which document contradicts it?
3. Which document could be fetched for anyone without the necessary authority?

## ✅ Remember

- In RAG, every document that enters the knowledge base is a candidate instruction given to the model.
- Source, date and access authority are kept in the metadata and used during retrieval.
- Entry to the knowledge base is cleaned, approved and reversible, like a software deployment.
