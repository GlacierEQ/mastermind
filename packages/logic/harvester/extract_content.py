import os
from pypdf import PdfReader
from docx import Document

def extract_pdf(path, output):
    if not os.path.exists(path): return
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    with open(output, 'w') as f:
        f.write(text)

def extract_docx(path, output):
    if not os.path.exists(path): return
    doc = Document(path)
    text = "\n".join([para.text for para in doc.paragraphs])
    with open(output, 'w') as f:
        f.write(text)

if __name__ == "__main__":
    extract_pdf("/home/user/Extracted Aspen Grove 2.pdf", "/home/user/ZENITH_NEXUS/swarms/harvester/payloads/aspen_grove_extracted.txt")
    extract_docx("/home/user/operators code mega copy copy.docx", "/home/user/ZENITH_NEXUS/swarms/harvester/payloads/operators_code_mega.txt")
