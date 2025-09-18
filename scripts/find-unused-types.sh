#!/bin/bash
# Find Unused Types Script
# Scans for potentially unused type exports across the codebase

set -e

echo "🔍 Scanning for unused type exports..."

TYPES_DIR="src/types"
SRC_DIR="src"
TEMP_FILE="/tmp/unused-types.txt"

# Clear temp file
> "$TEMP_FILE"

echo "📊 Analysis Results:"
echo "==================="

# Find all exported types, interfaces, and enums in types directory
find "$TYPES_DIR" -name "*.ts" | while read -r file; do
    echo "Analyzing $file..."
    
    # Extract exported type names
    grep -E "^export (interface|type|enum) [A-Za-z]" "$file" | while read -r export_line; do
        # Extract the type name
        type_name=$(echo "$export_line" | sed -E 's/^export (interface|type|enum) ([A-Za-z0-9_]+).*/\2/')
        
        # Search for usage outside of types directory
        usage_count=$(grep -r "$type_name" "$SRC_DIR" --exclude-dir=types --include="*.ts" --include="*.tsx" | wc -l)
        
        if [ "$usage_count" -eq 0 ]; then
            echo "❌ UNUSED: $type_name in $file" >> "$TEMP_FILE"
        else
            echo "✅ USED: $type_name ($usage_count references)"
        fi
    done
done

echo ""
echo "📋 Summary of Unused Types:"
echo "=========================="
if [ -s "$TEMP_FILE" ]; then
    cat "$TEMP_FILE"
    unused_count=$(wc -l < "$TEMP_FILE")
    echo ""
    echo "⚠️  Found $unused_count potentially unused type exports"
    echo "💡 Review these manually before removal - some may be used in complex patterns"
else
    echo "✅ No unused types detected!"
fi

# Cleanup
rm -f "$TEMP_FILE"