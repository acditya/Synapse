"""
LangChain prompt templates for Llama 3.2 evaluation tasks.
Contains structured prompts for summarization, evaluation, and consistency checking.
"""

from typing import List, Dict, Any
from langchain.prompts import PromptTemplate
from langchain.schema import BaseOutputParser
from pydantic import BaseModel, Field

from ..models.schemas import EvaluationCriteria


class EvaluationOutput(BaseModel):
    """Structured output for evaluation results."""
    overall_score: float = Field(ge=0.0, le=10.0, description="Overall score between 0 and 10")
    criterion_scores: List[Dict[str, Any]] = Field(description="Scores for each criterion")
    summary: str = Field(description="Summary of the evaluation")
    strengths: List[str] = Field(description="Identified strengths")
    weaknesses: List[str] = Field(description="Identified weaknesses")
    recommendations: List[str] = Field(description="Improvement recommendations")
    consistency_issues: List[str] = Field(description="Detected inconsistencies")
    missing_information: List[str] = Field(description="Missing information")


# Base system prompt for Llama 3.2
SYSTEM_PROMPT = """You are an expert AI evaluator specializing in document analysis and quality assessment. 
You provide thorough, objective, and constructive evaluations based on multiple criteria.
Always respond with structured, actionable feedback that helps improve document quality."""

# Document summarization prompt
SUMMARY_PROMPT = PromptTemplate(
    input_variables=["document_content", "max_length"],
    template="""{system_prompt}

Please provide a comprehensive summary of the following document. 
Focus on the main points, key findings, and important details.

Document Content:
{document_content}

Requirements:
- Maximum length: {max_length} words
- Include key findings and main arguments
- Highlight important data or statistics
- Maintain objectivity and accuracy

Summary:""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Document evaluation prompt
EVALUATION_PROMPT = PromptTemplate(
    input_variables=["document_content", "evaluation_criteria", "context"],
    template="""{system_prompt}

Please evaluate the following document based on the specified criteria. 
Provide detailed scores, reasoning, and actionable feedback.

Document Content:
{document_content}

Evaluation Criteria:
{evaluation_criteria}

Additional Context:
{context}

Please provide your evaluation in the following JSON format:
{{
    "overall_score": <float between 0-10>,
    "criterion_scores": [
        {{
            "criterion": "<criterion_name>",
            "score": <float between 0-10>,
            "reasoning": "<detailed explanation>"
        }}
    ],
    "summary": "<comprehensive evaluation summary>",
    "strengths": ["<strength1>", "<strength2>", ...],
    "weaknesses": ["<weakness1>", "<weakness2>", ...],
    "recommendations": ["<recommendation1>", "<recommendation2>", ...],
    "consistency_issues": ["<issue1>", "<issue2>", ...],
    "missing_information": ["<missing1>", "<missing2>", ...]
}}

Evaluation:""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Consistency check prompt
CONSISTENCY_CHECK_PROMPT = PromptTemplate(
    input_variables=["document_content", "retrieved_documents"],
    template="""{system_prompt}

Please analyze the following document for consistency issues by comparing it with the retrieved reference documents.

Main Document:
{document_content}

Reference Documents:
{retrieved_documents}

Please identify:
1. Contradictions between the main document and references
2. Inconsistent facts or claims
3. Missing context that references provide
4. Potential misinformation or outdated information

Provide your analysis in the following format:
{{
    "consistency_score": <float between 0-10>,
    "contradictions": ["<contradiction1>", "<contradiction2>", ...],
    "inconsistencies": ["<inconsistency1>", "<inconsistency2>", ...],
    "missing_context": ["<missing1>", "<missing2>", ...],
    "recommendations": ["<recommendation1>", "<recommendation2>", ...]
}}

Consistency Analysis:""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Relevance scoring prompt
RELEVANCE_PROMPT = PromptTemplate(
    input_variables=["query", "document_content", "context"],
    template="""{system_prompt}

Please evaluate how relevant the following document is to the given query.

Query: {query}

Document Content:
{document_content}

Context: {context}

Rate the relevance on a scale of 0-10 and provide reasoning:

Relevance Score: <float between 0-10>
Reasoning: <detailed explanation of why this score was given>
Key Relevant Points: <list of the most relevant aspects>
Missing Information: <what information would make this more relevant>""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Quality assessment prompt
QUALITY_ASSESSMENT_PROMPT = PromptTemplate(
    input_variables=["document_content", "quality_criteria"],
    template="""{system_prompt}

Please assess the quality of the following document based on the specified criteria.

Document Content:
{document_content}

Quality Criteria:
{quality_criteria}

Provide a comprehensive quality assessment:

Quality Score: <float between 0-10>
Strengths: <list of strong points>
Areas for Improvement: <list of areas that need work>
Specific Recommendations: <actionable suggestions>
Overall Assessment: <summary of the document's quality>""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Multi-document comparison prompt
COMPARISON_PROMPT = PromptTemplate(
    input_variables=["documents", "comparison_criteria"],
    template="""{system_prompt}

Please compare the following documents based on the specified criteria.

Documents:
{documents}

Comparison Criteria:
{comparison_criteria}

Provide a detailed comparison:

Comparison Results:
{{
    "best_document": "<document_id>",
    "ranking": [
        {{
            "document_id": "<id>",
            "score": <float>,
            "strengths": ["<strength1>", "<strength2>"],
            "weaknesses": ["<weakness1>", "<weakness2>"]
        }}
    ],
    "key_differences": ["<difference1>", "<difference2>"],
    "consensus_points": ["<point1>", "<point2>"],
    "conflicting_information": ["<conflict1>", "<conflict2>"]
}}""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Fact-checking prompt
FACT_CHECK_PROMPT = PromptTemplate(
    input_variables=["claim", "supporting_documents"],
    template="""{system_prompt}

Please fact-check the following claim using the provided supporting documents.

Claim: {claim}

Supporting Documents:
{supporting_documents}

Provide a fact-check analysis:

Fact-Check Results:
{{
    "verification_status": "<verified|partially_verified|unverified|contradicted>",
    "confidence_level": <float between 0-1>,
    "supporting_evidence": ["<evidence1>", "<evidence2>"],
    "contradicting_evidence": ["<evidence1>", "<evidence2>"],
    "missing_evidence": ["<missing1>", "<missing2>"],
    "recommendations": ["<recommendation1>", "<recommendation2>"]
}}""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Custom prompt for specific evaluation criteria
def create_custom_evaluation_prompt(criteria: List[EvaluationCriteria]) -> PromptTemplate:
    """Create a custom evaluation prompt for specific criteria."""
    criteria_descriptions = {
        EvaluationCriteria.RELEVANCE: "How well does the content address the intended topic or question?",
        EvaluationCriteria.ACCURACY: "How accurate and factually correct is the information presented?",
        EvaluationCriteria.COMPLETENESS: "How comprehensive and thorough is the coverage of the topic?",
        EvaluationCriteria.CONSISTENCY: "How consistent is the information throughout the document?",
        EvaluationCriteria.CLARITY: "How clear, well-organized, and easy to understand is the content?"
    }
    
    criteria_list = "\n".join([f"- {criterion.value}: {criteria_descriptions[criterion]}" for criterion in criteria])
    
    return PromptTemplate(
        input_variables=["document_content", "context"],
        template=f"""{{system_prompt}}

Please evaluate the following document based on these specific criteria:

{criteria_list}

Document Content:
{{document_content}}

Context: {{context}}

Provide your evaluation in JSON format:
{{
    "overall_score": <float between 0-10>,
    "criterion_scores": [
        {{
            "criterion": "<criterion_name>",
            "score": <float between 0-10>,
            "reasoning": "<detailed explanation>"
        }}
    ],
    "summary": "<comprehensive evaluation summary>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "recommendations": ["<recommendation1>", "<recommendation2>"]
}}""",
        partial_variables={"system_prompt": SYSTEM_PROMPT}
    )


# Prompt for generating questions from documents
QUESTION_GENERATION_PROMPT = PromptTemplate(
    input_variables=["document_content", "num_questions"],
    template="""{system_prompt}

Based on the following document, generate {num_questions} thoughtful questions that would test understanding of the content.

Document Content:
{document_content}

Generate questions that:
- Test comprehension of key concepts
- Require analysis and critical thinking
- Cover different aspects of the content
- Are clear and unambiguous

Questions:
1. <question1>
2. <question2>
3. <question3>
...""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)

# Prompt for document improvement suggestions
IMPROVEMENT_PROMPT = PromptTemplate(
    input_variables=["document_content", "evaluation_results"],
    template="""{system_prompt}

Based on the evaluation results, provide specific suggestions for improving the following document.

Document Content:
{document_content}

Evaluation Results:
{evaluation_results}

Provide actionable improvement suggestions:

Improvement Suggestions:
{{
    "priority_improvements": ["<high_priority_suggestion1>", "<high_priority_suggestion2>"],
    "content_enhancements": ["<enhancement1>", "<enhancement2>"],
    "structural_improvements": ["<structural1>", "<structural2>"],
    "style_improvements": ["<style1>", "<style2>"],
    "factual_corrections": ["<correction1>", "<correction2>"]
}}""",
    partial_variables={"system_prompt": SYSTEM_PROMPT}
)
