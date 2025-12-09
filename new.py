"""
search_gujarati_in_drive.py
---------------------------
Search for Gujarati text inside all PDFs stored in a specific Google Drive folder.

Supports both:
✅ Text-based PDFs (using pdfplumber)
✅ Scanned PDFs (using OCR via pytesseract)

Before running:
1. Install dependencies:
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib pdfplumber pytesseract pillow

2. Enable Google Drive API:
   - Go to https://console.cloud.google.com/
   - Create a new project
   - Enable "Google Drive API"
   - Create OAuth 2.0 credentials
   - Download credentials.json and place it in the same folder as this script.

3. Replace YOUR_FOLDER_ID below with your Google Drive folder ID.

4. Run:
   python search_gujarati_in_drive.py
"""

from __future__ import print_function
import os
import io
import pickle
import pdfplumber
import pytesseract
from PIL import Image
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import fitz  # PyMuPDF for converting scanned PDFs to images

# Google Drive API scope
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# 🔧 CONFIGURATION
FOLDER_ID = 'YOUR_FOLDER_ID_HERE'  # Replace with your Google Drive folder ID
SEARCH_TEXT = "ગુજરાતી"            # Gujarati text to search for

# Authenticate user
def authenticate():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds

# List all PDF files in the folder
def list_pdfs(service):
    results = service.files().list(
        q=f"'{FOLDER_ID}' in parents and mimeType='application/pdf'",
        fields="files(id, name)"
    ).execute()
    return results.get('files', [])

# Download PDF locally
def download_file(service, file_id, file_name):
    request = service.files().get_media(fileId=file_id)
    fh = io.FileIO(file_name, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.close()

# Search inside text-based PDFs
def search_text_pdf(pdf_path, search_text):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                if search_text in text:
                    return True
    except Exception as e:
        print(f"⚠️ Error reading {pdf_path}: {e}")
    return False

# OCR-based search for scanned PDFs
def search_ocr_pdf(pdf_path, search_text):
    try:
        doc = fitz.open(pdf_path)
        for page_index in range(len(doc)):
            pix = doc.load_page(page_index).get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            extracted_text = pytesseract.image_to_string(img, lang='guj')  # Gujarati OCR
            if search_text in extracted_text:
                return True
    except Exception as e:
        print(f"⚠️ OCR failed on {pdf_path}: {e}")
    return False

def main():
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    pdf_files = list_pdfs(service)
    print(f"\n📂 Found {len(pdf_files)} PDF files in folder.\n")

    for f in pdf_files:
        print(f"🔍 Checking file: {f['name']}")
        local_file = f['name']
        download_file(service, f['id'], local_file)

        found = search_text_pdf(local_file, SEARCH_TEXT)
        if not found:
            found = search_ocr_pdf(local_file, SEARCH_TEXT)

        if found:
            print(f"✅ Found '{SEARCH_TEXT}' in {f['name']}")
        else:
            print(f"❌ Not found in {f['name']}")

        os.remove(local_file)

    print("\n✅ Search completed!")

if __name__ == '__main__':
    main()
