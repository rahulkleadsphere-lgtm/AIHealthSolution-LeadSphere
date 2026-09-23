# Design System Document: The Empathetic Guardian

## 1. Overview & Creative North Star: "The Digital Sanctuary"
This design system moves beyond the cold, clinical aesthetic of traditional healthcare software. Our Creative North Star is **"The Digital Sanctuary."** In the context of rural healthcare, technology must feel like a trusted community elder: authoritative yet deeply approachable, sophisticated yet simple.

We break the "standard template" look by rejecting rigid, boxed-in grids. Instead, we utilize **Intentional Asymmetry** and **Tonal Depth**. By layering soft surfaces rather than drawing hard lines, we create an interface that feels organic and breathable. This is not just a platform; it is a clear, calm path to wellness.

---

## 2. Colors: The Palette of Trust
Our color strategy avoids high-contrast "digital" vibrations in favor of a natural, earth-toned clinical palette.

*   **Primary (#005bbf / #1a73e8):** The "Anchor Blue." Used for primary actions and navigational landmarks to signal reliability.
*   **Secondary (#006e2c / #34a853):** The "Healing Green." Used for success states, health recovery indicators, and safety-verified content.
*   **Tertiary & Error (#b81d17 / #ea4335):** The "Urgent Alert." Reserved strictly for critical health warnings and high-priority notifications.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. Use `surface-container-low` for secondary sections sitting on a `surface` background. Let the change in tone define the edge, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
*   **Base:** `surface` (#f7f9ff)
*   **Level 1 (Sections):** `surface-container-low` (#f1f4fa)
*   **Level 2 (Cards/Interaction):** `surface-container-lowest` (#ffffff)
*   **Level 3 (Pop-overs):** `surface-bright` with Glassmorphism.

### The "Glass & Gradient" Rule
To elevate the experience, use a **Signature Gradient** for main Hero CTAs: a subtle transition from `primary` (#005bbf) to `primary_container` (#1a73e8) at a 135-degree angle. This adds "soul" and prevents the interface from feeling flat and mechanical.

---

## 3. Typography: Authoritative Editorial
We pair **Plus Jakarta Sans** for high-impact display moments with **Inter** for dense information, ensuring maximum legibility for all literacy levels.

*   **Display (Plus Jakarta Sans):** Large, bold, and welcoming. Use `display-lg` (3.5rem) for hero greetings to make the user feel seen and welcomed.
*   **Headlines:** Use `headline-md` (1.75rem) to introduce new health topics. The generous tracking ensures readability even on low-resolution mobile screens.
*   **Body (Inter):** All body text defaults to `body-lg` (1rem). We never go below `body-sm` (0.75rem) to respect accessibility for aging eyes in rural populations.
*   **Hierarchy Note:** Use `on_surface_variant` (#414754) for secondary metadata to create a clear visual distinction from the primary `on_surface` (#181c20) text.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "heavy" for a clean healthcare environment. We use **Atmospheric Depth.**

*   **The Layering Principle:** Instead of shadows, stack `surface-container-lowest` cards on `surface-container-low` backgrounds. This creates a soft, natural lift.
*   **Ambient Shadows:** For floating elements (like a medical emergency button), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(0, 91, 191, 0.08);`. Note the blue tint in the shadow—this mimics natural light passing through a clinical environment.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in forms, use `outline_variant` at **20% opacity**. Never use 100% opaque borders.
*   **Glassmorphism:** For the WhatsApp-style chat headers, use a `surface_variant` background with a `backdrop-filter: blur(12px)`. This allows the content behind to bleed through, making the app feel integrated and light.

---

## 5. Components: Human-Centric Elements

### Accessible Buttons
*   **Primary:** High-radius (`xl`: 1.5rem), using the Signature Gradient. Padding: `spacing-4` (1.4rem) horizontal, `spacing-3` (1rem) vertical.
*   **Secondary:** No background, only a "Ghost Border" and `on_primary_fixed_variant` text.
*   **Touch Target:** Ensure all buttons have a minimum hit area of 48px to accommodate all users.

### Chat Bubbles (The "Seva" Interface)
*   **User Bubbles:** `primary_container` with `on_primary_container` text. Alignment: Right. Shape: `lg` (1rem) rounding, but with the bottom-right corner at `sm` (0.25rem).
*   **AI/Health Worker Bubbles:** `surface_container_high` with `on_surface`. Alignment: Left. Shape: `lg` rounding, but with the bottom-left corner at `sm`.

### Health Indicator Badges
*   **Critical:** `error_container` background with `on_error_container` text.
*   **Stable:** `secondary_container` background with `on_secondary_container` text.
*   **Visual Style:** Pills (Rounded: `full`). No borders.

### Cards & Lists
*   **The Divider Ban:** Strictly forbid 1px dividers between list items. Use `spacing-3` (1rem) of vertical white space or alternating tonal backgrounds (`surface-container-low` vs `surface-container-lowest`) to separate items.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If the screen feels crowded, increase spacing using the `spacing-10` (3.5rem) token.
*   **DO** use iconography from a consistent, rounded-corner library to match our `roundedness-lg` scale.
*   **DO** prioritize "Mobile-First" layouts. Even on desktop, maintain a centered, readable column width (max 800px) for medical articles.

### Don't
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#181c20) to maintain a soft, premium feel.
*   **DON'T** use "Warning Yellow" (#FBBC04) for text. Use it only for backgrounds with `on_surface` text to ensure AAA contrast.
*   **DON'T** use standard "Drop Shadows." Stick to the Ambient Shadow values defined in Section 4.