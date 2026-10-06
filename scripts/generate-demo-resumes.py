"""Generate the fictional demo's matching PDFs using only Python's standard library."""
from pathlib import Path
import re
import textwrap

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "demo-resumes"
OUTPUT.mkdir(exist_ok=True)
samples = re.findall(r"\{id:'([^']+)'[\s\S]*?resume:`([\s\S]*?)`", (ROOT / "demo-candidates.js").read_text())
for key, raw in samples:
    lines = []
    for line in raw.replace("•", "-").splitlines():
        lines.extend(textwrap.wrap(line, width=94, subsequent_indent="  ") or [""])
    commands = ["BT /F1 10.5 Tf 14 TL 50 746 Td"]
    for index, line in enumerate(lines):
        escaped = line.encode("latin-1", "replace").decode("latin-1").replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        commands.append(("0 -14 Td " if index else "") + "(" + escaped + ") Tj")
    commands.append("ET")
    stream = "\n".join(commands).encode("latin-1")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    pdf = b"%PDF-1.4\n"
    offsets = []
    for number, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf += str(number).encode() + b" 0 obj\n" + obj + b"\nendobj\n"
    xref = len(pdf)
    pdf += b"xref\n0 6\n0000000000 65535 f \n"
    pdf += b"".join(f"{offset:010d} 00000 n \n".encode() for offset in offsets)
    pdf += b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + str(xref).encode() + b"\n%%EOF\n"
    (OUTPUT / (key + ".pdf")).write_bytes(pdf)
    print(key + ".pdf")
