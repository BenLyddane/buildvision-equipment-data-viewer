# BuildVision Design System Style Guide

## Font Family

**Primary Font:** Inter

Use Inter for all text throughout the application. Import from Google Fonts or use system fallbacks: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

---

## Typography Scale

All typography uses format: `size/line-height` in pixels.

### Headers

| Style | Size/Line-Height | Weight |
|-------|------------------|--------|
| Header 1 | 64px / 88px | Regular (400) |
| Header 1 Bold | 64px / 88px | Bold (700) |
| Header 2 | 56px / 72px | Regular (400) |
| Header 2 Bold | 56px / 72px | Bold (700) |
| Header 3 | 48px / 56px | Regular (400) |
| Header 3 Bold | 48px / 56px | Bold (700) |
| Header 4 | 36px / 48px | Regular (400) |
| Header 4 Bold | 36px / 48px | Bold (700) |
| Header 5 | 24px / 32px | Regular (400) |
| Header 5 Bold | 24px / 32px | Bold (700) |

### Body Text

| Style | Size/Line-Height | Weight |
|-------|------------------|--------|
| Body Large | 24px / 38px | Regular (400) |
| Body Large Bold | 24px / 38px | Bold (700) |
| Body Medium | 18px / 28px | Regular (400) |
| Body Medium Bold | 18px / 28px | Bold (700) |
| Body Small | 16px / 22px | Regular (400) |
| Body Small Bold | 16px / 22px | Bold (700) |

### Detail & Micro Text

| Style | Size/Line-Height | Weight |
|-------|------------------|--------|
| Detail | 14px / 18px | Regular (400) |
| Detail Bold | 14px / 18px | Bold (700) |
| Micro | 12px / 16px | Regular (400) |
| Micro Bold | 12px / 16px | Bold (700) |

### List Styles

| Style | Size/Line-Height |
|-------|------------------|
| Body Large List | 24px / 32px |
| Body Medium List | 18px / 38px |
| Body Small List | 18px / 32px |
| Detail List | 14px / 30px |

### Link Styles

| Style | Size/Line-Height |
|-------|------------------|
| Body Large Link | 24px / 38px |
| Body Medium Link | 18px / 28px |
| Body Small Link | 16px / 22px |
| Detail Link | 14px / 18px |
| Micro Link | 14px / 18px |

**Link States:**
- Default: Underlined, Primary BV Blue (#4A3AFF)
- Hover: Underlined, Primary BV Blue (#4A3AFF)

---

## Color Palette

### Neutral Colors

Used for backgrounds, text colors, separators, models, and supporting secondary elements.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Neutral 50 | #F8F8F8 | Lightest background |
| Neutral 100 | #EDEDED | Light background |
| Neutral 200 | #C9CBCF | Borders, dividers |
| Neutral 300 | #AEB0B7 | Disabled text, placeholders |
| Neutral 400 | #9E9EA5 | Secondary text |
| Neutral 500 | #8C8C92 | Mid-tone elements |
| Neutral 600 | #6C6C71 | Body text |
| Neutral 700 | #535257 | Dark text |
| Neutral 800 | #2A2A2F | Headings, primary text |
| Neutral 900 | #18191B | Darkest text |

### Primary BV Blue

The primary brand color used for interactive elements: CTAs, links, inputs, active states.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Blue 100 | #E9EEFF | Light blue background |
| Blue 200 | #ABBBFF | Light accent |
| Blue 300 | #7383FF | Hover states |
| **Blue 400 (BV Blue)** | **#4A3AFF** | **Primary brand color** |
| Blue 500 | #3F31DE | Pressed states |
| Blue 600 | #3528BE | Dark accent |
| Blue 700 | #201B80 | Dark blue |
| Blue 800 | #171063 | Very dark blue |
| Blue 900 | #06042E | Darkest blue |

### Semantic Colors

#### Red (Error / Negativity / Important)

Conveys negativity. Used for error states and important alerts.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Red 100 | #FFDADA | Error background |
| Red 400 | #EC4343 | Error text, icons |
| Red 700 | #C85E3C | Dark error accent |

#### Yellow (Warning / Caution)

Conveys caution. Used for warning states.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Yellow 100 | #FFECAA | Warning background |
| Yellow 400 | #FFCC17 | Warning text, icons |
| Yellow 700 | #CC9300 | Dark warning accent |

#### Green (Success / Positivity)

Conveys positivity. Used for success states.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Green 100 | #B2FFDA | Success background |
| Green 400 | #16DA7C | Success text, icons |
| Green 700 | #0B864B | Dark success accent |

#### Purple (Extended Palette)

Extended color for additional use cases.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Purple 100 | #F3E8FF | Light purple background |
| Purple 400 | #CC98F6 | Purple accent |
| Purple 700 | #6B21A8 | Dark purple |

### Shades

Pure black and white for flexible use.

| Token | Hex Code | Usage |
|-------|----------|-------|
| Shade 00 | #FFFFFF | White |
| Shade 100 | #000000 | Black |

---

## Quick Reference

### Primary Actions
- **Button Background:** #4A3AFF (Blue 400)
- **Button Hover:** #7383FF (Blue 300)
- **Button Pressed:** #3F31DE (Blue 500)

### Text Hierarchy
- **Primary Text:** #2A2A2F (Neutral 800)
- **Secondary Text:** #6C6C71 (Neutral 600)
- **Disabled Text:** #AEB0B7 (Neutral 300)
- **Links:** #4A3AFF (Blue 400)

### Backgrounds
- **Page Background:** #FFFFFF (Shade 00)
- **Card Background:** #F8F8F8 (Neutral 50)
- **Hover Background:** #EDEDED (Neutral 100)

### Borders
- **Default Border:** #C9CBCF (Neutral 200)
- **Focus Border:** #4A3AFF (Blue 400)

### Status Colors
- **Success:** #16DA7C (Green 400)
- **Warning:** #FFCC17 (Yellow 400)
- **Error:** #EC4343 (Red 400)
- **Info:** #4A3AFF (Blue 400)

---

## CSS Variables Template

```css
:root {
  /* Font */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Neutral */
  --neutral-50: #F8F8F8;
  --neutral-100: #EDEDED;
  --neutral-200: #C9CBCF;
  --neutral-300: #AEB0B7;
  --neutral-400: #9E9EA5;
  --neutral-500: #8C8C92;
  --neutral-600: #6C6C71;
  --neutral-700: #535257;
  --neutral-800: #2A2A2F;
  --neutral-900: #18191B;
  
  /* Primary Blue */
  --blue-100: #E9EEFF;
  --blue-200: #ABBBFF;
  --blue-300: #7383FF;
  --blue-400: #4A3AFF; /* BV Blue - Primary */
  --blue-500: #3F31DE;
  --blue-600: #3528BE;
  --blue-700: #201B80;
  --blue-800: #171063;
  --blue-900: #06042E;
  
  /* Red */
  --red-100: #FFDADA;
  --red-400: #EC4343;
  --red-700: #C85E3C;
  
  /* Yellow */
  --yellow-100: #FFECAA;
  --yellow-400: #FFCC17;
  --yellow-700: #CC9300;
  
  /* Green */
  --green-100: #B2FFDA;
  --green-400: #16DA7C;
  --green-700: #0B864B;
  
  /* Purple */
  --purple-100: #F3E8FF;
  --purple-400: #CC98F6;
  --purple-700: #6B21A8;
  
  /* Shades */
  --white: #FFFFFF;
  --black: #000000;
}
```

---

## Tailwind Config Extension

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        neutral: {
          50: '#F8F8F8',
          100: '#EDEDED',
          200: '#C9CBCF',
          300: '#AEB0B7',
          400: '#9E9EA5',
          500: '#8C8C92',
          600: '#6C6C71',
          700: '#535257',
          800: '#2A2A2F',
          900: '#18191B',
        },
        'bv-blue': {
          100: '#E9EEFF',
          200: '#ABBBFF',
          300: '#7383FF',
          400: '#4A3AFF',
          500: '#3F31DE',
          600: '#3528BE',
          700: '#201B80',
          800: '#171063',
          900: '#06042E',
          DEFAULT: '#4A3AFF',
        },
        red: {
          100: '#FFDADA',
          400: '#EC4343',
          700: '#C85E3C',
        },
        yellow: {
          100: '#FFECAA',
          400: '#FFCC17',
          700: '#CC9300',
        },
        green: {
          100: '#B2FFDA',
          400: '#16DA7C',
          700: '#0B864B',
        },
        purple: {
          100: '#F3E8FF',
          400: '#CC98F6',
          700: '#6B21A8',
        },
      },
      fontSize: {
        'h1': ['64px', { lineHeight: '88px' }],
        'h2': ['56px', { lineHeight: '72px' }],
        'h3': ['48px', { lineHeight: '56px' }],
        'h4': ['36px', { lineHeight: '48px' }],
        'h5': ['24px', { lineHeight: '32px' }],
        'body-lg': ['24px', { lineHeight: '38px' }],
        'body-md': ['18px', { lineHeight: '28px' }],
        'body-sm': ['16px', { lineHeight: '22px' }],
        'detail': ['14px', { lineHeight: '18px' }],
        'micro': ['12px', { lineHeight: '16px' }],
      },
    },
  },
}
```