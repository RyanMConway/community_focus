import os
import re
import sys
import shutil
from pypdf import PdfReader

# --- CONFIGURATION ---
PUBLIC_DOCS_PATH = "./public/documents"

def get_smart_details(filename):
    """
    Analyzes a messy filename and returns a clean (slug, title, category).
    Example: 'gablesbylawswebsite2-25.pdf' -> ('bylaws.pdf', 'Bylaws', 'Governing')
    """
    lower = filename.lower()

    # 1. ARTICLES OF INCORPORATION
    if 'article' in lower and 'incorp' in lower:
        return 'articles.pdf', 'Articles of Incorporation', 'Governing'

    # 2. BYLAWS
    if 'bylaw' in lower:
        return 'bylaws.pdf', 'Bylaws', 'Governing'

    # 3. CCRs / DECLARATION
    if 'ccr' in lower or 'covenant' in lower or 'declaration' in lower:
        return 'ccrs.pdf', 'Declaration of Covenants (CCRs)', 'Governing'

    # 4. RULES
    if 'rule' in lower or 'reg' in lower:
        return 'rules-and-regs.pdf', 'Rules & Regulations', 'Governing'

    # 5. ARC / ARCHITECTURAL
    if 'arc' in lower or 'architect' in lower:
        if 'guide' in lower or 'standard' in lower:
            return 'arc-guidelines.pdf', 'Architectural Guidelines', 'Governing'
        return 'arc-form.pdf', 'ARC Request Form', 'Forms'

    # 6. AMENDMENTS (Generic fallback)
    if 'amend' in lower:
        return 'amendment.pdf', 'Declaration Amendment', 'Governing'

    # 7. FALLBACK (Clean the existing name if we can't guess)
    name, ext = os.path.splitext(filename)
    clean = re.sub(r'[^a-z0-9]', '-', name.lower())
    clean = re.sub(r'-+', '-', clean).strip('-')
    return f"{clean}.pdf", name.replace('-', ' ').title(), 'General'

def process_community(community_name, slug, source_folder):
    target_dir = os.path.join(PUBLIC_DOCS_PATH, slug)

    if not os.path.exists(source_folder):
        print(f"Error: Source folder '{source_folder}' not found.")
        return

    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    sql_output = []
    print(f"\n--- Processing: {community_name} ({slug}) ---\n")

    # SQL HEADER
    sql_output.append(f"INSERT INTO communities (name, slug, city, portal_url) VALUES ('{community_name}', '{slug}', 'Durham', 'https://cfnc.cincwebaxis.com') ON CONFLICT (slug) DO NOTHING;")

    files = [f for f in os.listdir(source_folder) if f.lower().endswith('.pdf')]

    # Counters to handle duplicate types (e.g. two amendments)
    counters = {}

    for filename in files:
        # A. GET SMART NAMES
        new_slug, title, category = get_smart_details(filename)

        # Handle Duplicates (e.g. if we have 3 "Amendments", name them amendment-1, amendment-2)
        base_name, ext = os.path.splitext(new_slug)
        if new_slug in counters:
            counters[new_slug] += 1
            final_filename = f"{base_name}-{counters[new_slug]}{ext}"
            title = f"{title} ({counters[new_slug]})" # Append number to title too
        else:
            counters[new_slug] = 1
            final_filename = new_slug

        # B. COPY FILE
        old_path = os.path.join(source_folder, filename)
        new_path = os.path.join(target_dir, final_filename)
        web_path = f"/documents/{slug}/{final_filename}"

        shutil.copy2(old_path, new_path)
        print(f"  Mapped: '{filename}' -> '{final_filename}' ({title})")

        # C. GENERATE DOWNLOADS SQL
        sql_output.append(f"""
INSERT INTO community_downloads (community_id, title, category, file_url)
SELECT id, '{title}', '{category}', '{web_path}'
FROM communities WHERE slug = '{slug}';""")

        # D. EXTRACT TEXT FOR AI
        try:
            reader = PdfReader(new_path)
            text_content = ""
            for page in reader.pages:
                text = page.extract_text()
                if text: text_content += text + "\n"

            clean_text = text_content.replace("'", "''") # Escape quotes for SQL
            final_text = f"[DOCUMENT: {title} for {community_name}]\n{clean_text}"

            if len(final_text) > 100000: final_text = final_text[:100000]

            sql_output.append(f"""
INSERT INTO community_docs (community_id, content, created_at)
SELECT id, '{final_text}', NOW()
FROM communities WHERE slug = '{slug}';""")
        except Exception as e:
            print(f"  Error reading PDF text: {e}")

    # Write SQL
    output_file = f"update_{slug}.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_output))

    print(f"\nSUCCESS! SQL script generated: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python etl_community.py 'Name' 'slug' './raw_uploads'")
    else:
        process_community(sys.argv[1], sys.argv[2], sys.argv[3])