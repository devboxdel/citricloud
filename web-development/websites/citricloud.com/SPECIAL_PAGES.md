# Special Pages Documentation

This documentation covers the special pages created for CITRICLOUD including Coming Soon, Maintenance, and Landing pages.

## Overview

Three specialized pages have been implemented to support different business scenarios:

1. **Coming Soon Page** - For announcing upcoming features or products
2. **Maintenance Page** - For scheduled maintenance windows
3. **Landing Page** - For marketing and user acquisition

## Pages

### 1. Coming Soon Page (`/coming-soon`)

A beautiful countdown page for announcing upcoming features, products, or launches.

#### Features:
- **Live Countdown Timer**: Real-time countdown showing days, hours, minutes, and seconds
- **Email Notification Signup**: Collect emails from interested users
- **Animated Background**: Smooth blob animations with gradient effects
- **Feature Preview**: Showcase upcoming features in cards
- **Responsive Design**: Mobile-first, fully responsive layout
- **Dark Mode Support**: Automatic theme switching

#### Use Cases:
- New product launches
- Major feature releases
- Beta program announcements
- Site redesign previews

#### Configuration:
Edit the launch date in the component:
```tsx
// Set launch date (example: 30 days from now)
const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + 30);
```

#### Customization:
- Update countdown duration
- Modify feature preview cards
- Change color scheme
- Add social media links
- Customize email submission handler

---

### 2. Maintenance Page (`/maintenance`)

A professional maintenance page to display during scheduled downtime.

#### Features:
- **Animated Construction Icon**: Eye-catching animated icon
- **Status Information**: Clear communication about maintenance activities
- **Progress Bar**: Visual representation of maintenance progress
- **Expected Duration**: Inform users how long maintenance will take
- **Action Buttons**: Check Again and Go Home options
- **Contact Information**: Emergency support contact details
- **Responsive Design**: Works on all devices
- **Dark Mode Support**: Theme-aware styling

#### Use Cases:
- Server upgrades
- Database maintenance
- Security updates
- Infrastructure improvements
- Emergency maintenance

#### What's Included:
- Expected duration display
- List of maintenance activities
- Coming improvements preview
- Support contact information
- Link to status page
- Progress indicator

#### Customization:
- Update maintenance details
- Adjust progress percentage
- Modify activity list
- Change color scheme
- Update contact information

---

### 3. Landing Page (`/landing`)

A comprehensive marketing landing page designed for user acquisition and product promotion.

#### Features:
- **Hero Section**: Eye-catching hero with CTA and email capture
- **Animated Background**: Smooth gradient blob animations
- **Feature Grid**: Showcase 6 key features with icons
- **Statistics Section**: Display impressive metrics
- **Testimonials**: Social proof with customer reviews
- **Multiple CTAs**: Strategic placement of call-to-action buttons
- **Responsive Design**: Mobile-optimized layout
- **Dark Mode Support**: Full theme support

#### Sections:

1. **Hero Section**
   - Main headline and value proposition
   - Email capture form
   - Benefits checklist
   - Visual mockup

2. **Features Section**
   - Cloud-Based infrastructure
   - Lightning-fast performance
   - Enterprise security
   - Team collaboration
   - Analytics & insights
   - Global CDN

3. **Stats Section**
   - Active users count
   - Uptime percentage
   - Countries served
   - Support availability

4. **Testimonials Section**
   - Customer reviews
   - Star ratings
   - Role and company information

5. **CTA Section**
   - Final conversion push
   - Multiple action buttons
   - Clear value proposition

6. **Footer**
   - Quick navigation links
   - Brand identity
   - Copyright information

#### Customization:
- Update hero content
- Modify feature descriptions
- Change statistics
- Update testimonials
- Adjust color schemes
- Add/remove sections

---

## Routing

All pages are accessible via direct URLs:

```
/coming-soon   - Coming Soon page
/maintenance   - Maintenance page
/landing       - Landing page
```

Routes are configured in `App.tsx`:
```tsx
<Route path="/coming-soon" element={<ComingSoon />} />
<Route path="/maintenance" element={<Maintenance />} />
<Route path="/landing" element={<Landing />} />
```

---

## Navigation

Links to these pages are available in the footer under "Resources":
- Landing Page
- Coming Soon
- Maintenance

---

## Design System

### Color Schemes

**Coming Soon:**
- Primary: Blue → Purple → Pink gradient
- Background: Light pastels (light mode) / Dark blues (dark mode)
- Accent: Yellow for sparkles

**Maintenance:**
- Primary: Orange → Amber gradient
- Background: Orange/yellow pastels (light mode) / Orange/yellow dark (dark mode)
- Status: Orange for active maintenance

**Landing:**
- Primary: Blue → Purple → Pink gradient
- Background: White/light pastels (light mode) / Gray/blue dark (dark mode)
- Accent: Blue and purple combinations

### Animations

All pages include smooth animations:
- **Blob animations**: Floating gradient orbs in background
- **Hover effects**: Scale and shadow transitions
- **Pulse effects**: Drawing attention to key elements
- **Countdown animation**: Real-time updating numbers
- **Progress bars**: Animated loading indicators

### Typography

- **Headings**: Black weight (900) for maximum impact
- **Body text**: Regular to medium weights for readability
- **Gradients**: Text gradients for emphasis
- **Font sizes**: Responsive scaling from mobile to desktop

---

## Integration Examples

### Redirect to Maintenance During Updates

```tsx
// In your App.tsx or main component
const isUnderMaintenance = false; // Set to true during maintenance

if (isUnderMaintenance) {
  return <Navigate to="/maintenance" replace />;
}
```

### Show Coming Soon for Beta Features

```tsx
// In your feature route
const isBetaAvailable = false;

<Route 
  path="/beta-feature" 
  element={isBetaAvailable ? <BetaFeature /> : <ComingSoon />} 
/>
```

### Use Landing as Alternative Home

```tsx
// Redirect root to landing page
<Route path="/" element={<Navigate to="/landing" replace />} />
```

---

## Best Practices

### Coming Soon Page
1. Set realistic launch dates
2. Collect emails for notifications
3. Provide enough information to build interest
4. Update countdown regularly
5. Have a backup plan if launch is delayed

### Maintenance Page
1. Communicate maintenance schedule in advance
2. Provide accurate time estimates
3. Offer alternative contact methods
4. Update progress regularly
5. Remove page immediately after completion

### Landing Page
1. Focus on benefits, not features
2. Use social proof effectively
3. Have clear, prominent CTAs
4. Optimize for mobile first
5. Test different variations (A/B testing)
6. Keep content concise and scannable

---

## Accessibility

All pages include:
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- High contrast ratios
- Focus indicators
- Screen reader friendly content

---

## Performance

Optimization features:
- Lazy-loaded components
- Optimized images (when added)
- Minimal dependencies
- CSS animations (GPU accelerated)
- Responsive loading
- Code splitting

---

## SEO Considerations

### Coming Soon
- Set appropriate meta tags
- Include launch date in structured data
- Add social media preview images
- Use descriptive title and description

### Maintenance
- Set temporary unavailable status
- Include expected duration
- Provide alternative contact methods
- Add meta robots noindex during maintenance

### Landing
- Optimize for target keywords
- Include structured data (Organization, Product)
- Add social media meta tags
- Optimize page title and description
- Include relevant schema markup

---

## Future Enhancements

Potential improvements:
- Add video backgrounds
- Implement newsletter integration
- Add live chat support
- Create A/B testing variants
- Add analytics tracking
- Implement progressive web app features
- Add multilingual support
- Create variant pages for different campaigns

---

## Email Collection Backend Integration

Example backend endpoint for email collection:

```python
# backend/app/api/v1/endpoints/newsletter.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()

class EmailSubmission(BaseModel):
    email: EmailStr
    page: str  # 'coming-soon' or 'landing'

@router.post("/subscribe")
async def subscribe_email(data: EmailSubmission):
    # Store email in database
    # Send confirmation email
    # Add to mailing list
    return {"message": "Successfully subscribed"}
```

Frontend integration:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.post('/newsletter/subscribe', {
      email,
      page: 'coming-soon'
    });
    setSubmitted(true);
  } catch (error) {
    console.error('Subscription failed:', error);
  }
};
```

---

## Monitoring

Track page performance:
- Page load times
- Email submission rates
- Bounce rates
- Time on page
- CTA click rates
- Form abandonment rates

---

## Testing Checklist

- [ ] Responsive design on all devices
- [ ] Dark/light mode switching
- [ ] Form submission works
- [ ] Countdown timer accuracy
- [ ] All links functional
- [ ] Animations perform smoothly
- [ ] Accessibility compliance
- [ ] Cross-browser compatibility
- [ ] Email validation
- [ ] Error handling

---

## Quick Reference

| Page | Route | Primary Use | Key Feature |
|------|-------|-------------|-------------|
| Coming Soon | `/coming-soon` | Pre-launch | Countdown Timer |
| Maintenance | `/maintenance` | Downtime | Status Display |
| Landing | `/landing` | Marketing | Feature Showcase |

---

## Support

For questions or issues with these pages:
- Check the component source code
- Review this documentation
- Contact the development team
- Submit issues on GitHub
