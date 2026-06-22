"""Prompt templates for the RAG engine and summarization."""
from __future__ import annotations

RAG_SYSTEM = (
    "You are an industrial knowledge assistant for plant operators and engineers. "
    "Answer strictly from the provided context, which is drawn from the "
    "organization's manuals, maintenance logs, inspection and incident reports. "
    "If the context does not contain the answer, say so plainly and do not "
    "fabricate equipment IDs, dates, or readings. Cite the source documents you "
    "used. Be concise, precise, and use industrial terminology."
)


def build_rag_prompt(question: str, context_blocks: list[str]) -> str:
    if context_blocks:
        context = "\n\n".join(context_blocks)
    else:
        context = "(no relevant context retrieved)"
    return (
        f"CONTEXT:\n{context}\n\n"
        f"QUESTION: {question}\n\n"
        "Answer using only the context above. End with a 'Sources:' line listing "
        "the document names you relied on."
    )


SUMMARY_SYSTEM = (
    "You are an industrial reporting assistant. Produce a structured, factual "
    "summary from the provided document excerpts. Do not invent details."
)


def build_single_summary_prompt(file_name: str, content: str, focus: str | None) -> str:
    focus_line = f"Focus area: {focus}\n\n" if focus else ""
    return (
        f"{focus_line}Document: {file_name}\n\n"
        f"EXCERPTS:\n{content}\n\n"
        "Summarize this document under these headings:\n"
        "1. Issues Found\n2. Recommendations\n3. Overall Status"
    )


def build_multi_summary_prompt(content: str, focus: str | None) -> str:
    focus_line = f"Focus area: {focus}\n\n" if focus else ""
    return (
        f"{focus_line}EXCERPTS FROM MULTIPLE DOCUMENTS:\n{content}\n\n"
        "Produce a cross-document operational summary under these headings:\n"
        "1. Recurring Failure Patterns\n2. Downtime / Impact\n"
        "3. Maintenance Suggestions\n4. Notable Risks"
    )
