import io

def generate_pdf(document, user):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import (SimpleDocTemplate, Paragraph,
                                        Spacer, HRFlowable, Table, TableStyle)
    except ImportError:
        raise RuntimeError("reportlab not installed. Run: pip install reportlab")

    content = document.get_content()
    accent  = _hex(document.theme_color or '#6c3fc5')
    buf     = io.BytesIO()

    doc = SimpleDocTemplate(buf, pagesize=A4,
          leftMargin=18*mm, rightMargin=18*mm,
          topMargin=18*mm, bottomMargin=18*mm)

    S = lambda **kw: ParagraphStyle('x', **kw)
    name_s   = S(fontName='Helvetica-Bold',    fontSize=22, textColor=colors.HexColor('#111827'), spaceAfter=3)
    title_s  = S(fontName='Helvetica',         fontSize=12, textColor=accent,                     spaceAfter=5)
    contact_s= S(fontName='Helvetica',         fontSize=9,  textColor=colors.HexColor('#6b7280'), spaceAfter=10)
    sec_s    = S(fontName='Helvetica-Bold',    fontSize=8,  textColor=accent,                     spaceBefore=12, spaceAfter=3, leading=10)
    body_s   = S(fontName='Helvetica',         fontSize=10, textColor=colors.HexColor('#374151'), spaceAfter=3,  leading=15)
    role_s   = S(fontName='Helvetica-Bold',    fontSize=10, textColor=colors.HexColor('#111827'), spaceAfter=2)
    sub_s    = S(fontName='Helvetica-Oblique', fontSize=9,  textColor=accent,                     spaceAfter=1)
    date_s   = S(fontName='Helvetica',         fontSize=9,  textColor=colors.HexColor('#9ca3af'), spaceAfter=3)

    story = []

    def hr(): story.append(HRFlowable(width='100%', thickness=0.6, color=colors.HexColor('#e5e7eb'), spaceAfter=4))
    def sec(t): story.append(Paragraph(t.upper(), sec_s)); hr()

    # Header
    if content.get('name'):   story.append(Paragraph(content['name'], name_s))
    if content.get('title'):  story.append(Paragraph(content['title'], title_s))
    contacts = [x for x in [content.get('email'), content.get('phone'),
                              content.get('location'), content.get('website')] if x]
    if contacts:
        story.append(Paragraph('  ·  '.join(contacts), contact_s))
    story.append(HRFlowable(width='100%', thickness=2, color=accent, spaceAfter=8))

    # Summary
    if content.get('summary'):
        sec('Summary')
        story.append(Paragraph(content['summary'], body_s))
        story.append(Spacer(1, 4))

    # Experience
    exps = content.get('experience', [])
    if exps:
        sec('Experience')
        for e in exps:
            if e.get('role'):    story.append(Paragraph(e['role'], role_s))
            if e.get('company'): story.append(Paragraph(e['company'], sub_s))
            d = ' – '.join(filter(None, [e.get('start',''), e.get('end','')]))
            if d: story.append(Paragraph(d, date_s))
            if e.get('desc'):  story.append(Paragraph(e['desc'], body_s))
            story.append(Spacer(1,4))

    # Education
    edus = content.get('education', [])
    if edus:
        sec('Education')
        for e in edus:
            if e.get('degree'):      story.append(Paragraph(e['degree'], role_s))
            if e.get('institution'): story.append(Paragraph(e['institution'], sub_s))
            d = ' – '.join(filter(None, [e.get('start',''), e.get('end','')]))
            if d: story.append(Paragraph(d, date_s))
            story.append(Spacer(1,4))

    # Skills
    skills = content.get('skills','')
    if skills:
        sec('Skills')
        tags = [s.strip() for s in skills.split(',') if s.strip()]
        if tags:
            cols = 4
            rows_data = [tags[i:i+cols] for i in range(0, len(tags), cols)]
            while len(rows_data[-1]) < cols: rows_data[-1].append('')
            tbl = Table(rows_data, colWidths=[38*mm]*cols)
            tbl.setStyle(TableStyle([
                ('FONTNAME',   (0,0),(-1,-1),'Helvetica'),
                ('FONTSIZE',   (0,0),(-1,-1),8),
                ('TEXTCOLOR',  (0,0),(-1,-1),accent),
                ('BACKGROUND', (0,0),(-1,-1),colors.HexColor('#f5f3ff')),
                ('TOPPADDING', (0,0),(-1,-1),3),
                ('BOTTOMPADDING',(0,0),(-1,-1),3),
                ('LEFTPADDING', (0,0),(-1,-1),6),
                ('RIGHTPADDING',(0,0),(-1,-1),6),
                ('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#ddd6fe')),
            ]))
            story.append(tbl)
            story.append(Spacer(1,6))

    # Languages
    if content.get('languages'):
        sec('Languages')
        story.append(Paragraph(content['languages'], body_s))

    # Certifications
    if content.get('certs'):
        sec('Certifications')
        story.append(Paragraph(content['certs'], body_s))

    # Publications (CV)
    pubs = content.get('publications', [])
    if pubs:
        sec('Publications')
        for p in pubs:
            if p.get('title'): story.append(Paragraph(p['title'], role_s))
            jy = ' '.join(filter(None,[p.get('journal',''), p.get('year','')]))
            if jy: story.append(Paragraph(jy, sub_s))
            story.append(Spacer(1,4))

    # Portfolio projects
    projects = content.get('projects', [])
    if projects:
        sec('Projects')
        for p in projects:
            if p.get('name'): story.append(Paragraph(p['name'], role_s))
            if p.get('tech'): story.append(Paragraph(p['tech'], sub_s))
            if p.get('desc'): story.append(Paragraph(p['desc'], body_s))
            story.append(Spacer(1,4))

    doc.build(story)
    buf.seek(0)
    return buf.read()

def _hex(h):
    from reportlab.lib import colors
    try:    return colors.HexColor(h)
    except: return colors.HexColor('#6c3fc5')
