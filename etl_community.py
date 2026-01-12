import os
import re
import sys
from pypdf import PdfReader

# --- CONFIGURATION ---
# Point this to where your Next.js public folder lives
PUBLIC_DOCS_PATH = "./public/documents"

def clean_slug(text):
    """Converts 'My Ugly File.pdf' to 'my-ugly-file.pdf'"""
    # Remove extension
    name, ext = os.path.splitext(text)
    # Lowercase, replace spaces with dashes, remove special chars
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    return f"{slug}{ext}"

def get_category(filename):
    """Heuristic to guess category based on filename"""
    lower = filename.lower()
    if 'arc' in lower or 'form' in lower or 'application' in lower:
        return 'Forms'
    return 'Governing'

def get_pretty_title(filename):
    """Converts 'my-file-name.pdf' to 'My File Name'"""
    name, _ = os.path.splitext(filename)
    # Replace dashes with spaces and Title Case
    title = name.replace('-', ' ').title()

    # Common overrides
    if "Ccr" in title: title = title.replace("Ccr", "CCRs")
    if "Hoa" in title: title = title.replace("Hoa", "HOA")
    if "Arc" in title: title = title.replace("Arc", "ARC")

    return title

def process_community(community_name, slug, source_folder):
    """
    1. Renames files in place to be web-friendly.
    2. Generates SQL for Community Downloads.
    3. Extracts text and generates SQL for AI Knowledge Base.
    """

    target_dir = os.path.join(PUBLIC_DOCS_PATH, slug)

    # Safety Check
    if not os.path.exists(source_folder):
        print(f"Error: Source folder '{source_folder}' not found.")
        return

    # Create target directory if it doesn't exist
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Created directory: {target_dir}")

    sql_output = []

    print(f"\n--- Processing: {community_name} ({slug}) ---\n")

    # 1. SQL HEADER
    sql_output.append(f"-- {community_name}")
    # We use ON CONFLICT DO NOTHING so we don't break existing rows
    sql_output.append(f"INSERT INTO communities (name, slug, city, portal_url) VALUES ('{community_name}', '{slug}', 'Durham', 'https://cfnc.cincwebaxis.com') ON CONFLICT (slug) DO NOTHING;")

    files = [f for f in os.listdir(source_folder) if f.lower().endswith('.pdf')]

    for filename in files:
        # A. RENAME FILE
        new_filename = clean_slug(filename)
        old_path = os.path.join(source_folder, filename)
        new_path = os.path.join(target_dir, new_filename)

        # Move/Rename the file to the Next.js public folder
        # If source and target are different, we copy/move.
        # For this script, let's assume we are moving from a 'raw' folder to 'public'.
        if old_path != new_path:
            import shutil
            shutil.copy2(old_path, new_path)
            print(f"Moved: {filename} -> {slug}/{new_filename}")

        # B. GENERATE DOWNLOADS SQL
        title = get_pretty_title(new_filename)
        category = get_category(new_filename)
        web_path = f"/documents/{slug}/{new_filename}"

        sql_output.append(f"""
INSERT INTO community_downloads (community_id, title, category, file_url)
SELECT id, '{title}', '{category}', '{web_path}'
FROM communities WHERE slug = '{slug}';""")

        # C. EXTRACT TEXT FOR AI (RAG)
        try:
            reader = PdfReader(new_path)
            text_content = ""
            for page in reader.pages:
                text_content += page.extract_text() + "\n"

            # Clean text for SQL (escape single quotes)
            clean_text = text_content.replace("'", "''")

            # Add a "Header" so the AI knows what this text is
            final_text = f"[DOCUMENT: {title} for {community_name}]\n{clean_text}"

            # Truncate if massive (Postgres TEXT allows 1GB, but let's be sane)
            if len(final_text) > 100000:
                final_text = final_text[:100000] + "...(truncated)"

            sql_output.append(f"""
INSERT INTO community_docs (community_id, content, created_at)
SELECT id, '{final_text}', NOW()
FROM communities WHERE slug = '{slug}';""")

            print(f"AI Index: Extracted {len(final_text)} characters from {new_filename}")

        except Exception as e:
            print(f"Error reading PDF {filename}: {e}")

    # Write SQL to file
    output_file = f"update_{slug}.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_output))

    print(f"\nSUCCESS! SQL script generated: {output_file}")
    print(f"Files moved to: {target_dir}")

# --- USAGE ---
if __name__ == "__main__":
    # Example Usage:
    # python etl_community.py "Community Name" "slug-name" "./path/to/raw/pdfs"

    if len(sys.argv) < 4:
        print("Usage: python etl_community.py 'Name' 'slug' './raw_files_folder'")
    else:
        process_community(sys.argv[1], sys.argv[2], sys.argv[3])