# RAG — Retrieval Augmented Generation

## Architecture

```
DOCUMENTS → CHUNKING → EMBEDDING → VECTOR STORE
                                        ↓
USER QUERY → EMBEDDING → SIMILARITY SEARCH → TOP-K CHUNKS
                                                  ↓
                                        PROMPT + CHUNKS → LLM → ANSWER
```

## Chunking Rules

```
✅ Chunk size: 200–500 tokens (test for your content type)
✅ Overlap: 10–20% between chunks
✅ Chunk at semantic boundaries (paragraphs, sections)
✅ Store metadata with each chunk (source, page, section)
❌ Do not chunk mid-sentence
❌ Do not use chunks that are too large
```

## Retrieval Rules

```
✅ Retrieve top 3–5 chunks
✅ Include source reference in prompt for citation
✅ Filter by metadata before vector search when possible
✅ Use hybrid search (vector + keyword) for better recall
```

## Prompt Template

```
Answer the question using ONLY the information in the provided context.
If the answer is not in the context, say "I don't have enough information."
Do not make up information.

Context:
{retrieved_chunks}

Question: {user_question}
```
