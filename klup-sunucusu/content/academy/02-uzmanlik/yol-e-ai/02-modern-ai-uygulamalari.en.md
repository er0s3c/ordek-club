---
id: e-02
baslik: "Modern AI applications: RAG, embeddings and agents"
hedefler:
  - Explain how RAG, embeddings and tool calling work
  - Mark the trust boundaries in an AI application
---

# Modern AI applications: RAG, embeddings and agents

> Mirror is not just a model that "knows" things; it searches documents, calls tools and does work. Every new capability is a new **mouth** for Veysel.
> 🎭 **Voice 2:** Mirror's brain is small; its real power is the filing cabinet and the toolbox behind it.

::cizgi[e-02-sahne]

## RAG: giving the model a crib sheet

![A robot pulling the three relevant cards out of the library and reading them before answering](../../gorseller/e-02-b.webp)

RAG (*Retrieval-Augmented Generation*): when a question arrives, the application finds the relevant documents and **pastes them into the prompt**.

```text
question → search documents → the 2–5 most relevant chunks → [system + documents + question] → model → answer
```

- **Embedding:** turning text into an array of numbers (a vector) that represents its meaning. Similar meaning → close vectors.
- **Vector database:** searches these vectors for the "closest" document.

The result: every document that enters the knowledge base one day becomes **text placed in front of the model**.

## Tool calling and agents

![A belt around the robot's waist with tools hanging from it, such as a calendar, a mailbox and a calculator](../../gorseller/e-02-c.webp)

Tool calling: the model produces a structured request saying "run this function with these parameters";
the **application** runs the function. An agent: a system that carries this loop on by itself for several steps.

| Capability | Example | What can go wrong? |
|---|---|---|
| Reading | Document search | Fetching the wrong or a secret document |
| Writing | Sending email | Data going to an unintended recipient |
| Action | Deleting a record | An irreversible mistake |

## Trust boundaries

When you draw the diagram of an AI application, ask of every arrow: **where does this data come from, who wrote it?**
If untrusted data (a user, a document, the web) meets powerful capabilities (tools, secret data) in the same prompt,
that is a trust boundary. Attacks always happen there.

## 🧪 Try it (5 min)

With Mirror's toy copy `lab/e-ayna-mini.py` (the local Ollama model must be running):

```bash
python e-ayna-mini.py --debug -q "What time does the library close?"
```

Which documents are in the prompt sent to the model? Is one of them unrelated to the question? How many tools are defined in the system prompt?
Draw the application's flow as a five-box diagram and mark the trust boundaries in red.

## ✅ Remember

- RAG pastes the documents it finds into the prompt.
- The model asks for tools; the application runs them.
- Where untrusted data meets a powerful capability is a trust boundary.
