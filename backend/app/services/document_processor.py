"""
Document processing service for extracting metadata from grant proposals.
"""

import os
import re
from typing import Dict, Any, List
import PyPDF2
from docx import Document
import magic

class DocumentProcessor:
    """Service for processing grant documents and extracting metadata."""
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.docx', '.doc']
    
    async def process_document(self, file_path: str) -> Dict[str, Any]:
        """Process a document and extract grant metadata."""
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Document not found: {file_path}")
        
        # Determine file type
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            text = self._extract_text_from_pdf(file_path)
        elif file_extension in ['.docx', '.doc']:
            text = self._extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        # Extract metadata from text
        metadata = self._extract_metadata(text)
        
        return metadata
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
        
        return text
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error extracting text from DOCX: {str(e)}")
    
    def _extract_metadata(self, text: str) -> Dict[str, Any]:
        """Extract structured metadata from document text."""
        
        metadata = {
            "title": self._extract_title(text),
            "principal_investigator": self._extract_pi(text),
            "pi_email": self._extract_pi_email(text),
            "pi_institution": self._extract_pi_institution(text),
            "co_investigators": self._extract_co_investigators(text),
            "budget_requested": self._extract_budget(text),
            "budget_breakdown": self._extract_budget_breakdown(text),
            "duration_months": self._extract_duration(text),
            "aims": self._extract_aims(text),
            "abstract": self._extract_abstract(text),
            "keywords": self._extract_keywords(text),
            "irb_approval": self._extract_irb_status(text),
            "irb_number": self._extract_irb_number(text),
            "human_subjects": self._detect_human_subjects(text),
            "animal_subjects": self._detect_animal_subjects(text)
        }
        
        return metadata
    
    def _extract_title(self, text: str) -> str:
        """Extract grant title."""
        # Look for common title patterns
        patterns = [
            r'(?i)title[:\s]*([^\n\r]+)',
            r'(?i)project\s+title[:\s]*([^\n\r]+)',
            r'(?i)proposal\s+title[:\s]*([^\n\r]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                title = match.group(1).strip()
                if len(title) > 10:  # Reasonable title length
                    return title
        
        # Fallback: use first non-empty line that's not too short
        lines = text.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if len(line) > 20 and not line.startswith(('Page', 'Date', 'From:', 'To:')):
                return line
        
        return "Untitled Grant Proposal"
    
    def _extract_pi(self, text: str) -> str:
        """Extract principal investigator name."""
        patterns = [
            r'(?i)principal\s+investigator[:\s]*([^\n\r,]+)',
            r'(?i)PI[:\s]*([^\n\r,]+)',
            r'(?i)lead\s+investigator[:\s]*([^\n\r,]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                name = match.group(1).strip()
                # Clean up common suffixes/prefixes
                name = re.sub(r'^(Dr\.?|Prof\.?|Professor)\s+', '', name, flags=re.IGNORECASE)
                name = re.sub(r'\s+(MD|PhD|Ph\.D\.?|M\.D\.?)\s*$', '', name, flags=re.IGNORECASE)
                if len(name) > 2:
                    return name
        
        return "Unknown"
    
    def _extract_pi_email(self, text: str) -> str:
        """Extract PI email address."""
        # Look for email patterns near PI mention
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        
        if emails:
            # Return first email found (could be improved with context analysis)
            return emails[0]
        
        return None
    
    def _extract_pi_institution(self, text: str) -> str:
        """Extract PI institution."""
        patterns = [
            r'(?i)institution[:\s]*([^\n\r]+)',
            r'(?i)university[:\s]*([^\n\r]+)',
            r'(?i)affiliation[:\s]*([^\n\r]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                institution = match.group(1).strip()
                if len(institution) > 5:
                    return institution
        
        # Look for common university/institution keywords
        institution_keywords = ['University', 'College', 'Institute', 'Hospital', 'Medical Center']
        lines = text.split('\n')
        
        for line in lines[:20]:  # Check first 20 lines
            for keyword in institution_keywords:
                if keyword in line:
                    return line.strip()
        
        return None
    
    def _extract_co_investigators(self, text: str) -> List[Dict[str, str]]:
        """Extract co-investigators information."""
        co_investigators = []
        
        # Look for co-investigator sections
        patterns = [
            r'(?i)co-?investigators?[:\s]*([^\n\r]+)',
            r'(?i)collaborators?[:\s]*([^\n\r]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                names_text = match.group(1)
                # Split on common delimiters
                names = re.split(r'[,;]', names_text)
                for name in names:
                    name = name.strip()
                    if len(name) > 2:
                        co_investigators.append({"name": name, "role": "Co-Investigator"})
        
        return co_investigators
    
    def _extract_budget(self, text: str) -> float:
        """Extract total budget amount."""
        # Look for budget patterns
        patterns = [
            r'(?i)total\s+budget[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)',
            r'(?i)budget\s+request[ed]?[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)',
            r'(?i)funding\s+request[ed]?[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    return float(amount_str)
                except ValueError:
                    continue
        
        # Look for any dollar amounts that might be budget
        dollar_pattern = r'\$([0-9,]+(?:\.[0-9]{2})?)'
        amounts = re.findall(dollar_pattern, text)
        
        if amounts:
            # Return largest amount found (likely to be total budget)
            amounts_float = []
            for amount in amounts:
                try:
                    amounts_float.append(float(amount.replace(',', '')))
                except ValueError:
                    continue
            
            if amounts_float:
                return max(amounts_float)
        
        return None
    
    def _extract_budget_breakdown(self, text: str) -> Dict[str, Any]:
        """Extract detailed budget breakdown."""
        # This is a simplified version - could be more sophisticated
        breakdown = {}
        
        budget_categories = [
            'personnel', 'equipment', 'supplies', 'travel', 'indirect',
            'salary', 'fringe', 'materials', 'overhead'
        ]
        
        for category in budget_categories:
            pattern = rf'(?i){category}[:\s]*\$?([0-9,]+(?:\.[0-9]{{2}})?)'
            match = re.search(pattern, text)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    breakdown[category] = float(amount_str)
                except ValueError:
                    continue
        
        return breakdown if breakdown else None
    
    def _extract_duration(self, text: str) -> int:
        """Extract project duration in months."""
        patterns = [
            r'(?i)duration[:\s]*([0-9]+)\s*months?',
            r'(?i)project\s+period[:\s]*([0-9]+)\s*months?',
            r'(?i)([0-9]+)\s*months?\s+project',
            r'(?i)([0-9]+)\s*year[s]?'  # Convert years to months
        ]
        
        for i, pattern in enumerate(patterns):
            match = re.search(pattern, text)
            if match:
                duration = int(match.group(1))
                # Convert years to months for the last pattern
                if i == 3:  # Year pattern
                    duration *= 12
                return duration
        
        return None
    
    def _extract_aims(self, text: str) -> str:
        """Extract specific aims or objectives."""
        patterns = [
            r'(?i)specific\s+aims?[:\s]*([^§]+?)(?=\n\s*\n|\n[A-Z][^a-z]+|$)',
            r'(?i)objectives?[:\s]*([^§]+?)(?=\n\s*\n|\n[A-Z][^a-z]+|$)',
            r'(?i)research\s+aims?[:\s]*([^§]+?)(?=\n\s*\n|\n[A-Z][^a-z]+|$)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                aims = match.group(1).strip()
                if len(aims) > 50:  # Reasonable aims length
                    return aims
        
        return None
    
    def _extract_abstract(self, text: str) -> str:
        """Extract abstract or summary."""
        patterns = [
            r'(?i)abstract[:\s]*([^§]+?)(?=\n\s*\n|\n[A-Z][^a-z]+|$)',
            r'(?i)summary[:\s]*([^§]+?)(?=\n\s*\n|\n[A-Z][^a-z]+|$)',
            r'(?i)project\s+summary[:\s]*([^§]+?)(?=\n\s*\n|\n[A-Z][^a-z]+|$)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                abstract = match.group(1).strip()
                if len(abstract) > 100:  # Reasonable abstract length
                    return abstract
        
        return None
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords or key terms."""
        keywords = []
        
        patterns = [
            r'(?i)keywords?[:\s]*([^\n\r]+)',
            r'(?i)key\s+terms?[:\s]*([^\n\r]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                keywords_text = match.group(1)
                # Split on common delimiters
                keywords = [kw.strip() for kw in re.split(r'[,;]', keywords_text) if kw.strip()]
                break
        
        # If no explicit keywords, extract from title and abstract
        if not keywords:
            # This is a simplified approach - could use NLP for better extraction
            title = self._extract_title(text)
            abstract = self._extract_abstract(text)
            
            if title or abstract:
                # Extract potential keywords (this is very basic)
                combined_text = f"{title or ''} {abstract or ''}"
                # Remove common words and extract meaningful terms
                words = re.findall(r'\b[A-Za-z]{4,}\b', combined_text)
                keywords = list(set(words[:10]))  # Take first 10 unique words
        
        return keywords
    
    def _extract_irb_status(self, text: str) -> str:
        """Extract IRB approval status."""
        if re.search(r'(?i)irb\s+approv(ed|al)', text):
            return "Approved"
        elif re.search(r'(?i)irb\s+pending', text):
            return "Pending"
        elif re.search(r'(?i)no\s+irb\s+required', text):
            return "Not Required"
        elif re.search(r'(?i)irb', text):
            return "Mentioned"
        
        return None
    
    def _extract_irb_number(self, text: str) -> str:
        """Extract IRB approval number."""
        patterns = [
            r'(?i)irb\s+(?:number|#)[:\s]*([A-Z0-9-]+)',
            r'(?i)protocol\s+(?:number|#)[:\s]*([A-Z0-9-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        
        return None
    
    def _detect_human_subjects(self, text: str) -> bool:
        """Detect if study involves human subjects."""
        human_subject_indicators = [
            'human subjects', 'participants', 'patients', 'volunteers',
            'clinical trial', 'clinical study', 'human research',
            'informed consent', 'recruitment'
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in human_subject_indicators)
    
    def _detect_animal_subjects(self, text: str) -> bool:
        """Detect if study involves animal subjects."""
        animal_subject_indicators = [
            'animal subjects', 'laboratory animals', 'mice', 'rats',
            'animal care', 'iacuc', 'animal welfare', 'animal research',
            'animal models', 'animal studies'
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in animal_subject_indicators)