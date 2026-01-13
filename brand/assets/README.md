# Brand Assets

This directory contains visual assets for Guarding Assessment and Stop FRA.

## Directory Structure

### `/logos`
Logo files in various formats:
- `logo-primary.svg` - Full color primary logo
- `logo-white.svg` - White version for dark backgrounds
- `logo-black.svg` - Black version for light backgrounds
- `logo-icon.svg` - Icon/symbol only
- Various PNG exports (16x16 to 2048x2048)

### `/colors`
Color palette documentation and assets:
- Hex color values
- RGB values
- Pantone references (if applicable)
- Color palette images
- Accessibility contrast ratios

### `/typography`
Typography specimens and guidelines:
- Font files (if custom fonts)
- Typography scale examples
- Heading hierarchy examples
- Body text examples

### `/icons`
Icon library:
- Navigation icons
- Feature icons
- Status icons
- Social media icons
- File type icons
- Custom illustrated icons

### `/photography`
Photography library:
- Hero images
- Background images
- Team photos
- Office photos
- Stock photography library

### `/illustrations`
Illustration library:
- Conceptual illustrations
- Infographics
- Diagrams
- Charts and graphs templates
- Custom artwork

### `/ui-mockups`
UI design mockups:
- Desktop application mockups
- Mobile application mockups
- Web application mockups
- Dashboard designs
- Marketing page designs

### `/templates`
Design templates:
- PowerPoint/Keynote templates
- Email templates
- Social media templates
- Document templates
- Print templates

## Asset Specifications

### Logo Usage
- **Minimum size:** 24px height for digital, 0.5" for print
- **Clear space:** Minimum 25% of logo height around all sides
- **Backgrounds:** Use appropriate logo version for background color
- **Do not:** Stretch, rotate, add effects, change colors

### Color Palette

#### Primary Colors
```
Primary Blue:   #1d70b8 (RGB: 29, 112, 184)
Dark Blue:      #003078 (RGB: 0, 48, 120)
Light Blue:     #5694ca (RGB: 86, 148, 202)
```

#### Secondary Colors
```
Success Green:  #00703c (RGB: 0, 112, 60)
Warning Orange: #f47738 (RGB: 244, 119, 56)
Error Red:      #d4351c (RGB: 212, 53, 28)
```

#### Neutral Colors
```
Dark Gray:      #0b0c0c (RGB: 11, 12, 12)
Mid Gray:       #505a5f (RGB: 80, 90, 95)
Light Gray:     #f3f2f1 (RGB: 243, 242, 241)
White:          #ffffff (RGB: 255, 255, 255)
```

### Typography

#### System Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, "Helvetica Neue", Arial, sans-serif;
```

#### Font Sizes
- Display: 48px / 3rem
- H1: 36px / 2.25rem
- H2: 30px / 1.875rem
- H3: 24px / 1.5rem
- H4: 20px / 1.25rem
- Body: 16px / 1rem
- Small: 14px / 0.875rem
- Caption: 12px / 0.75rem

#### Font Weights
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Icon Specifications
- Format: SVG preferred
- Size: 24x24px standard, scalable
- Stroke width: 2px
- Style: Rounded corners, consistent visual weight
- Color: Single color, designed for color override

## File Naming Conventions

```
[category]-[description]-[variant]-[size].[ext]

Examples:
logo-primary-color.svg
icon-dashboard-outline-24px.svg
photo-hero-office-2048x1536.jpg
illustration-risk-assessment-concept.svg
```

## Asset Management

### Version Control
- Keep source files (AI, Sketch, Figma) in `/source` subdirectory
- Export optimized versions to main directories
- Document export settings for consistency
- Archive old versions when updating

### Optimization
- **SVG:** Optimize with SVGO, remove unnecessary metadata
- **PNG:** Compress with TinyPNG or similar
- **JPG:** 85% quality, progressive encoding
- **Minimum file sizes** while maintaining quality

### Accessibility
- Provide alt text descriptions for all images
- Ensure minimum contrast ratios (WCAG AA: 4.5:1)
- Include text alternatives where applicable
- Test icon clarity at small sizes

## Usage Rights

All assets are proprietary to Guarding Assessment.

### Internal Use
- Approved for all marketing and product materials
- Can be used across all company communications
- Must follow brand guidelines

### External Use
- Require approval for partner/vendor use
- Press kit available for media use
- Attribution required for external publications

## Asset Requests

To request new assets or modifications:
1. Create issue describing the need
2. Include specifications and use case
3. Provide examples or references
4. Specify deadline and priority
5. Tag appropriate team members

## Resources

- Brand guidelines: `../guidelines/brand-guidelines.md`
- Design system: `../guidelines/design-system.md`
- Accessibility standards: `../guidelines/accessibility.md`
