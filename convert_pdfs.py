#!/usr/bin/env python3
import os
from pypdf import PdfReader

pdf_files = [
    "FRA_BRD_v2.pdf",
    "FRA_GovS013_Template.pdf",
    "FRAUD RISK 1,1 (FRA).pdf",
    "FRAUD RIS. part 1(FRA).pdf",
    "Comprehensive Fraud Risk Assessment - Sections 9.3-14.pdf",
    "6.7628_CO_Govt-Functional-Std_GovS013-Counter-Fraud_v4.pdf",
    "Failure+to+Prevent+Fraud+Guidance+-+English+Language+v1.5.pdf",
    "Failure to prevent fraud- what should you be doing before September? | Global Regulation Tomorrow.pdf"
]

for pdf_file in pdf_files:
    if not os.path.exists(pdf_file):
        print(f"Warning: {pdf_file} not found, skipping...")
        continue
    
    print(f"Converting {pdf_file}...")
    
    try:
        reader = PdfReader(pdf_file)
        text = ""
        
        for page_num, page in enumerate(reader.pages, 1):
            page_text = page.extract_text()
            if page_text:
                text += f"\n\n--- Page {page_num} ---\n\n"
                text += page_text
        
        output_file = pdf_file.replace(".pdf", ".md")
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"# {pdf_file}\n\n")
            f.write(text)
        
        print(f"  ✓ Created {output_file}")
        
    except Exception as e:
        print(f"  ✗ Error converting {pdf_file}: {e}")

print("\nConversion complete!")
