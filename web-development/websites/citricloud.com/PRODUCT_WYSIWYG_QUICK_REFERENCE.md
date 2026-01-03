# Product Description WYSIWYG - Quick Reference

## What Changed?

### Before: Plain Text
```
Product Form:
┌─────────────────────────────────┐
│ Description                     │
│ ┌─────────────────────────────┐ │
│ │ Plain text only...          │ │
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Display:
Plain text only...
```

### After: Rich Text with HTML
```
Product Form:
┌─────────────────────────────────┐
│ Description                     │
│ ┌─────────────────────────────┐ │
│ │ [B] [I] [U] [•] [#] [🔗] [...│ │
│ │ **Bold** *italic* with      │ │
│ │ • Lists                     │ │
│ │ • Links                     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Display:
**Bold** *italic* with
• Lists
• Links (clickable)
```

## Where to Use It

### 1. ERP Dashboard - Product Management
```
URL: https://my.citricloud.com/dashboard/erp/products

1. Click "Add Product" or "Edit" on any product
2. Scroll to "Short Description" and "Description" fields
3. Use the rich text editor toolbar:
   
   Toolbar Options:
   ┌────────────────────────────────────┐
   │ [B] [I] [U] [•] [#] [🔗] [↺] [Aa] │
   │  │   │   │   │   │   │    │    │  │
   │  │   │   │   │   │   │    │    └─ Font Size
   │  │   │   │   │   │   │    └────── Clear Format
   │  │   │   │   │   │   └─────────── Insert Link
   │  │   │   │   │   └─────────────── Headings
   │  │   │   │   └─────────────────── Lists
   │  │   │   └─────────────────────── Underline
   │  │   └─────────────────────────── Italic
   │  └─────────────────────────────── Bold
   └────────────────────────────────────┘

4. Format your text as desired
5. Save the product
```

### 2. Shop - Product Display
```
URL: https://shop.citricloud.com/

Formatted content appears:
- Product detail pages (full description)
- List view (short description excerpt)
```

## Formatting Examples

### Bold & Italic
```
Type: This is **important** and *emphasized*
Shows: This is important and emphasized
```

### Lists
```
Type: 
• Feature 1
• Feature 2
• Feature 3

Shows as bulleted list
```

### Links
```
Type: Click here (with link to https://example.com)
Shows: Clickable "Click here" link
```

### Headings
```
Type: # Main Title
      ## Subtitle
      ### Section

Shows: Properly sized headings
```

## Tips

✅ **DO:**
- Use bold for important features
- Use lists for specifications
- Add links to documentation
- Use headings to organize long descriptions

❌ **DON'T:**
- Overuse formatting
- Create walls of bold text
- Use too many colors
- Make descriptions too long

## Keyboard Shortcuts (Editor)

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- Select text + click button - Apply formatting

## Browser Support

✅ All modern browsers
✅ Mobile devices
✅ Dark mode compatible
✅ Responsive design

## Questions?

- Check [PRODUCT_WYSIWYG_IMPLEMENTATION.md](./PRODUCT_WYSIWYG_IMPLEMENTATION.md) for full details
- Test on demo product first
- Preview in shop after saving
