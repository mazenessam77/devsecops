import os

def remove_comments(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        stripped = line.lstrip()
        # Skip lines that are purely comments or decorative comment blocks
        if stripped.startswith('#') or stripped.startswith('//'):
            continue
        new_lines.append(line)
        
    # Remove trailing empty lines and consecutive empty lines to clean up formatting
    cleaned_content = "".join(new_lines).strip() + "\n"
    
    with open(filepath, 'w') as f:
        f.write(cleaned_content)

if __name__ == '__main__':
    base_dir = '/Users/macbookair/Desktop/devsecops/infra'
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.yaml') or file.endswith('.yml') or file.endswith('.tf'):
                filepath = os.path.join(root, file)
                remove_comments(filepath)
                print(f"Cleaned: {filepath}")
