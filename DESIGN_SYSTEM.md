# PawHealth Design System

This document outlines the design system for the PawHealth application, ensuring consistency across all UI components and pages.

## Color Palette

### Primary Colors
- **Primary**: `#4FB6B2` (Teal/Mint Green)
- **Primary Light**: `#CFEDEA` (Light Teal)
- **Primary Dark**: `#006a67` (Dark Teal)
- **Primary Hover**: `#3da09c` (Hover Teal)

### Status Colors
- **Success**: `#6BCB77` (Green)
- **Warning**: `#F2B544` (Amber)
- **Error**: `#E76F51` (Coral)
- **Info**: `#4FB6B2` (Teal - same as primary)

### Surface Colors
- **Background**: `#F7FAFA` (Off-white)
- **Card**: `#FFFFFF` (White)
- **Panel**: `#f0fcfb` (Light Teal)

### Content Colors
- **Primary Text**: `#2F3A3A` (Dark Gray)
- **Secondary Text**: `#7A8A8A` (Gray)
- **Tertiary Text**: `#bdc9c7` (Light Gray)
- **Faint Text**: `#eaf6f5` (Very Light Gray)

### Accent Colors
- **Mint**: `#8ff3ef` (Bright Mint)
- **Green**: `#93f59c` (Bright Green)
- **Amber**: `#fabc4a` (Bright Amber)
- **Coral**: `#f5a19d` (Bright Coral)

## Typography

### Font Families
- **Primary**: `DM Sans, system-ui, -apple-system, sans-serif`
- **Heading**: `Manrope, DM Sans, system-ui, -apple-system, sans-serif`
- **Monospace**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)
- **5xl**: `3rem` (48px)
- **6xl**: `3.75rem` (60px)

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800
- **Black**: 900

## Spacing Scale
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)
- **3xl**: `4rem` (64px)

## Border Radius
- **sm**: `0.5rem` (8px)
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `2rem` (32px)

## Shadows
- **sm**: `0 1px 4px rgba(47, 58, 58, 0.06)`
- **md**: `0 4px 12px rgba(79, 182, 178, 0.15)`
- **lg**: `0 10px 25px rgba(47, 58, 58, 0.1)`
- **xl**: `0 20px 48px rgba(19, 29, 30, 0.12)`
- **2xl**: `0 32px 80px rgba(19, 29, 30, 0.18)`

## Transitions
- **fast**: `150ms ease-in-out`
- **normal**: `300ms ease-in-out`
- **slow**: `500ms ease-in-out`
- **spring**: `cubic-bezier(0.16, 1, 0.3, 1)`

## Animations
- **float**: `pawFloat 4.5s ease-in-out infinite`
- **floatSlow**: `pawFloatB 6s ease-in-out 1.3s infinite`
- **pulse**: `pulseRing 2.3s ease-out infinite`
- **shimmer**: `shimmerBtn 2.8s linear infinite`
- **breathe**: `breathe 3s ease-in-out infinite`

## Component Guidelines

### Cards
- Use `rounded-3xl` for card corners
- Apply subtle shadows (`shadow-sm`)
- Maintain consistent padding (`p-7`)
- Use white backgrounds (`#FFFFFF`) on off-white background (`#F7FAFA`)

### Buttons
- Use `rounded-full` for pill-shaped buttons
- Apply consistent hover and active states
- Use appropriate color variants (primary, secondary, danger, ghost)

### Inputs
- Use `rounded-xl` for input fields
- Apply floating labels
- Use teal focus states
- Maintain consistent sizing

### Navigation
- Desktop: Underline tab style
- Mobile: Pill tab style
- Consistent icon usage
- Clear visual hierarchy

## Responsive Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `≥ 1024px`

## Accessibility
- Maintain sufficient color contrast ratios
- Use semantic HTML
- Provide proper focus states
- Ensure keyboard navigation support

## Usage Examples

### Health Ring Component
```tsx
import { HealthRing } from '@/components/dashboard/HealthRing';

<HealthRing score={85} size="md" />
```

### Dashboard Card Component
```tsx
import { DashboardCard } from '@/components/dashboard/DashboardCard';

<DashboardCard dark={true} hoverEffect={true}>
  <h3>Card Content</h3>
</DashboardCard>
```

### Action Button Component
```tsx
import { ActionButton } from '@/components/ui/ActionButton';

<ActionButton variant="primary" size="md" icon={<PlusIcon />}>
  Add Pet
</ActionButton>
```

This design system ensures a consistent, professional, and accessible user experience across the entire PawHealth application.