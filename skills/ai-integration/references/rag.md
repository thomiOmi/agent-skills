# RAG — Retrieval Augmented Generation

Use RAG when the model needs to answer questions based on your own documents,
and those documents are too large or too numerous to fit in a single prompt.

---

## Architecture

```text
INDEXING PIPELINE (run once or periodically):

  DOCUMENTS → CHUNKING → EMBEDDING → VECTOR STORE

  Each document is split into chunks.
  Each chunk is converted to an embedding (a vector of numbers).
  The embedding is stored in a vector database with the original text and metadata.


QUERY PIPELINE (run on every user question):

  USER QUESTION
    → EMBED the question
    → SEARCH the vector store for the top-K most similar chunk embeddings
    → RETRIEVE the matching chunks and their metadata
    → BUILD a prompt: system instructions + retrieved chunks + user question
    → CALL the LLM
    → RETURN the answer
```

---

## Chunking Rules

- **Chunk size:** 200 to 500 tokens is a typical starting range. Test for your content type.
- **Overlap:** Include 10–20% overlap between adjacent chunks to avoid splitting context across boundaries.
- **Boundaries:** Split at semantic boundaries (paragraphs, sections, sentences) — not at fixed character counts.
- **Metadata:** Store the source document, page number, and section heading with each chunk.

```text
Too small:  chunks lack context, retrieval is noisy
Too large:  retrieval is imprecise, prompt becomes too long
No overlap: context that spans a boundary is lost
```

---

## Retrieval Rules

- Retrieve the top 3 to 5 chunks. More is not always better — it adds noise and uses more tokens.
- Include the source reference in the prompt so the model can cite its answer.
- Filter by metadata before vector search when possible — it is faster and more precise.
- Consider hybrid search (vector similarity + keyword matching) for better recall.
- Add a relevance threshold — discard chunks below a minimum similarity score.

---

## Prompt Template for RAG

```text
SYSTEM:
  Answer the question using only the information in the provided context.
  If the answer cannot be found in the context, respond:
  "I do not have enough information to answer this question."
  Do not add information from outside the context.

CONTEXT:
  [Retrieved chunk 1 — source: document name, page N]
  [content]

  [Retrieved chunk 2 — source: document name, page N]
  [content]

USER:
  [User's question]
```

---

## Rules

- Always instruct the model to stay within the provided context.
- Always instruct the model to say when it does not know — do not let it hallucinate an answer.
- Include source attribution in the prompt so the model can cite references.
- Re-index documents when they change — stale embeddings produce incorrect results.
