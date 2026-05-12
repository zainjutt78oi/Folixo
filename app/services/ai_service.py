from flask import current_app

def get_ai_suggestions(document_data: dict, category: str) -> dict:
    api_key = current_app.config.get('GEMINI_API_KEY', '')
    if not api_key or api_key == 'your_gemini_api_key_here':
        return {
            "score": 0,
            "suggestions": [],
            "error": "Gemini API key not set. Get free key from: aistudio.google.com — then add GEMINI_API_KEY in .env file"
        }
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model  = genai.GenerativeModel('gemini-2.5-flash')
        prompt = _build_prompt(document_data, category)
        resp   = model.generate_content(prompt)
        return _parse(resp.text)
    except Exception as e:
        return {"score": 0, "suggestions": [], "error": str(e)}


def _build_prompt(data: dict, category: str) -> str:
    return f"""You are an expert {category} coach and HR recruiter with 15+ years experience at top tech companies.
Analyze this {category} and give 4-6 specific actionable improvement suggestions.

{category.upper()} DATA:
{_fmt(data)}

Reply in EXACTLY this format (no extra text, no markdown symbols):
SCORE: [0-100]
SUGGESTIONS:
- [SECTION]: [specific actionable tip]
- [SECTION]: [specific actionable tip]
- [SECTION]: [specific actionable tip]
- [SECTION]: [specific actionable tip]

Section names: SUMMARY, EXPERIENCE, EDUCATION, SKILLS, KEYWORDS, IMPACT, FORMATTING, OVERALL"""


def _fmt(data: dict) -> str:
    lines = []
    for k, v in data.items():
        if isinstance(v, list):
            if v:
                lines.append(f"{k.upper()}:")
                for item in v:
                    if isinstance(item, dict):
                        lines.append("  " + " | ".join(f"{ik}: {iv}" for ik, iv in item.items() if iv))
        elif v:
            lines.append(f"{k.upper()}: {v}")
    return "\n".join(lines)


def _parse(raw: str) -> dict:
    score       = 65
    suggestions = []
    for line in raw.splitlines():
        line = line.strip()
        if line.upper().startswith('SCORE:'):
            try:
                score = int(''.join(c for c in line.split(':', 1)[1] if c.isdigit()))
            except:
                pass
        elif line.startswith('-'):
            parts = line.lstrip('- ').split(':', 1)
            if len(parts) == 2:
                suggestions.append({'section': parts[0].strip().title(), 'tip': parts[1].strip()})
            elif parts[0].strip():
                suggestions.append({'section': 'General', 'tip': parts[0].strip()})
    return {"score": min(100, max(0, score)), "suggestions": suggestions}
