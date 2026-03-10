# UI/UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Fix all critical accessibility violations, restore brand color consistency, add missing form feedback states, improve animation performance, and polish layout/interaction details across the Community Focus of NC website.

**Architecture:** All fixes are isolated to existing components and pages — no new routes are created. Sprint 1 is pure accessibility/correctness with zero visual change. Sprints 2–4 are progressively more visual. Each task has a clear verification step so work can resume safely after any interruption.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React icons

**Working Directory:** All commands run from `community-focus/` unless stated otherwise.

---

## HOW TO RESUME AFTER INTERRUPTION

1. Open this file and find the last `✅ DONE` task.
2. Start from the **next task** in sequence.
3. All tasks are idempotent — re-running a completed task will not cause harm.

**Status legend:**
- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Complete

---

## Sprint 1: Accessibility (WCAG Compliance) — CRITICAL

**Sprint goal:** Fix all WCAG 2.1 AA violations. Zero visual regressions. 5 tasks.

Sprint 1 status: `[ ]` Not started

---

### Task 1.1: Skip-to-main-content link in root layout

**Why:** WCAG 2.1 Success Criterion 2.4.1 — keyboard users must be able to bypass navigation. This is the very first interactive element on every page.

**Files:**
- Modify: `src/app/layout.tsx` (lines 73–75, inside `<body>` before `<Navbar />`)

**Current code at `layout.tsx:70–80`:**
```tsx
<PageCurtain />

<Navbar />

{/* Page transition wrapper */}
<PageTransition>
    <main className="flex-grow">
        {children}
    </main>
    <Footer />
</PageTransition>
```

**Step 1: Add skip link before `<Navbar />`**

Replace lines 68–75 in `src/app/layout.tsx`:

```tsx
{/* Page load curtain reveal */}
<PageCurtain />

{/* Skip-to-main-content: visually hidden until focused by keyboard */}
<a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg focus:outline-none"
>
    Skip to main content
</a>

<Navbar />
```

**Step 2: Add `id="main-content"` to the `<main>` element**

Find the `<main className="flex-grow">` on line 74 and update it:

```tsx
<main id="main-content" className="flex-grow">
```

**Step 3: Verify**

Run `npm run dev` from `community-focus/`, open `http://localhost:3000`, press **Tab** once. A green "Skip to main content" button should appear in the top-left corner. Press **Tab** again to move past it. It should disappear.

**Step 4: Lint check**
```bash
npm run lint
```
Expected: No new lint errors.

**Status:** `[ ]`

---

### Task 1.2: Hamburger button — add `aria-expanded` and `aria-label`

**Why:** WCAG 4.1.2 — UI components must expose state to assistive technologies. Without `aria-expanded`, screen readers cannot tell users whether the mobile menu is open or closed.

**Files:**
- Modify: `src/components/Navbar.tsx` (lines 110–115)

**Current code at `Navbar.tsx:109–116`:**
```tsx
{/* Mobile Menu Button */}
<button
    className={`lg:hidden focus:outline-none ${showSolidNav ? 'text-brand-snow' : 'text-slate-800 md:text-white'}`}
    onClick={() => setIsOpen(!isOpen)}
>
    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
</button>
```

**Step 1: Replace the mobile button with accessible version**

```tsx
{/* Mobile Menu Button */}
<button
    className={`lg:hidden focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-brand-dark rounded-md p-1 ${showSolidNav ? 'text-brand-snow' : 'text-slate-800 md:text-white'}`}
    onClick={() => setIsOpen(!isOpen)}
    aria-expanded={isOpen}
    aria-controls="mobile-menu"
    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
>
    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
</button>
```

**Step 2: Add `id` and `aria` role to the mobile menu dropdown**

Find the mobile menu dropdown at `Navbar.tsx:119–139`. Add `id` and `role`:

Current (line 120):
```tsx
<div className="lg:hidden bg-brand-dark border-t border-brand-edge absolute w-full shadow-lg h-screen top-20 left-0">
```

Replace with:
```tsx
<div
    id="mobile-menu"
    role="navigation"
    aria-label="Mobile navigation"
    className="lg:hidden bg-brand-dark border-t border-brand-edge absolute w-full shadow-lg h-screen top-20 left-0"
>
```

**Step 3: Verify**

Open `http://localhost:3000`, open browser DevTools → Accessibility tree. Find the hamburger button. It should show:
- Role: `button`
- Name: `"Open navigation menu"`
- Expanded: `false`

Click the hamburger. The accessible name should change to `"Close navigation menu"` and Expanded should be `true`.

**Status:** `[ ]`

---

### Task 1.3: Add `aria-label` to all icon-only buttons

**Why:** WCAG 1.3.1 and 4.1.2 — buttons that contain only an icon are completely invisible to screen readers without an accessible name.

There are two offending locations:

#### 1.3a — AlertBanner close button

**Files:**
- Modify: `src/components/AlertBanner.tsx` (lines 62–67)

**Current code:**
```tsx
<button
    onClick={() => setIsVisible(false)}
    className="p-1 hover:bg-white/20 rounded-full transition-colors"
>
    <X className="w-4 h-4" />
</button>
```

**Replace with:**
```tsx
<button
    onClick={() => setIsVisible(false)}
    className="p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
    aria-label="Close alert"
>
    <X className="w-4 h-4" aria-hidden="true" />
</button>
```

#### 1.3b — Community page download buttons

**Files:**
- Modify: `src/app/communities/[slug]/page.tsx` (lines 180–195)

The download link `<a>` element contains a `<Download />` icon and a document title. The title provides context, but the icon itself should be hidden from screen readers to avoid duplicate announcements.

Find the download icon on line 192:
```tsx
<Download className="w-4 h-4" />
```

Replace with:
```tsx
<Download className="w-4 h-4" aria-hidden="true" />
```

Also add `aria-label` to the download link itself so screen readers announce the file name clearly. Find `<a` at line 180:

```tsx
<a
    key={doc.id}
    href={doc.file_url}
    target="_blank"
    className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group"
>
```

Replace with:
```tsx
<a
    key={doc.id}
    href={doc.file_url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Download ${doc.title} (opens in new tab)`}
    className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group"
>
```

**Note:** Also added `rel="noopener noreferrer"` — required security attribute for all `target="_blank"` links.

**Step 3: Verify**

Use browser accessibility inspector or a screen reader (Windows Narrator: Win+Ctrl+Enter to start). Tab to the alert banner close button — it should announce "Close alert, button". Tab to a document download link — it should announce "Download [document name] (opens in new tab), link".

**Status:** `[ ]`

---

### Task 1.4: Add `<label>` elements to all contact form inputs

**Why:** WCAG 1.3.1 — form inputs must have programmatically associated labels. Placeholder text disappears when typing and is not read by all screen readers as a label.

The general inquiry form at `contact/page.tsx:89–112` uses only `placeholder` attributes. The `BidManagementForm` already uses floating labels correctly (see `BidManagementForm.tsx:7–18`).

**Files:**
- Modify: `src/app/contact/page.tsx` (lines 89–112)

**Current form code:**
```tsx
<form className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
        <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            placeholder="First Name"
        />
        <input
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            placeholder="Last Name"
        />
    </div>
    <input
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
        placeholder="Email Address"
        type="email"
    />
    <textarea
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
        placeholder="How can we help?"
    />
    <button className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-sm hover:shadow-glow">
        Send Message
    </button>
</form>
```

**Replace entire form with labeled version:**
```tsx
<form className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="contact-first-name" className="block text-sm font-medium text-slate-600 mb-1.5">
                First Name
            </label>
            <input
                id="contact-first-name"
                name="firstName"
                autoComplete="given-name"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                placeholder="Jane"
            />
        </div>
        <div>
            <label htmlFor="contact-last-name" className="block text-sm font-medium text-slate-600 mb-1.5">
                Last Name
            </label>
            <input
                id="contact-last-name"
                name="lastName"
                autoComplete="family-name"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                placeholder="Smith"
            />
        </div>
    </div>
    <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-600 mb-1.5">
            Email Address
        </label>
        <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            placeholder="jane@example.com"
        />
    </div>
    <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-600 mb-1.5">
            Message
        </label>
        <textarea
            id="contact-message"
            name="message"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
            placeholder="How can we help?"
        />
    </div>
    <button
        type="submit"
        className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-sm hover:shadow-glow cursor-pointer"
    >
        Send Message
    </button>
</form>
```

**Step 2: Verify**

Open `http://localhost:3000/contact`. Click on the "First Name" label text — the input should receive focus (proving the `for`/`id` association works). Tab through the form — each field should be announced with its label by a screen reader.

**Status:** `[ ]`

---

### Task 1.5: Add `prefers-reduced-motion` support to all animations

**Why:** WCAG 2.3.3 (AAA) and 2.3.1 — animations can cause harm to users with vestibular disorders. The OS-level "reduce motion" setting must be respected.

There are three animation layers to address:

#### 1.5a — CSS animations in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Add at the end of the file:**
```css
/* Respect prefers-reduced-motion for all CSS animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This single rule disables all CSS-based transitions and animations (including `animate-infinite-scroll` in `Testimonials.tsx`) for users who have enabled reduced motion.

#### 1.5b — Framer Motion animations in `Reveal.tsx`

**Files:**
- Modify: `src/components/Reveal.tsx`

Framer Motion provides a `useReducedMotion()` hook. Import and use it to skip animations.

**Current imports (line 3):**
```tsx
import { motion, useInView, useAnimation } from "framer-motion";
```

**Replace with:**
```tsx
import { motion, useInView, useAnimation, useReducedMotion } from "framer-motion";
```

**Current `Reveal` function (lines 15–57):**
```tsx
export default function Reveal({
    children,
    width = "fit-content",
    delay = 0,
    className = "",
    direction = 'up',
    stagger = false,
}: Props) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls]);
```

**Replace with:**
```tsx
export default function Reveal({
    children,
    width = "fit-content",
    delay = 0,
    className = "",
    direction = 'up',
    stagger = false,
}: Props) {
    const ref = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView || prefersReducedMotion) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls, prefersReducedMotion]);
```

This ensures that when reduced motion is preferred, `Reveal` immediately shows content in the visible state rather than animating it in.

#### 1.5c — Framer Motion animations in `HeroSection.tsx`

The parallax scroll effect (`contentOpacity`, `contentY`) should be disabled for reduced-motion users.

**Files:**
- Modify: `src/components/HeroSection.tsx`

**Current imports (line 4):**
```tsx
import { motion, useScroll, useTransform } from 'framer-motion';
```

**Replace with:**
```tsx
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
```

**After line 59 (`const heroRef = useRef...`), add:**
```tsx
const prefersReducedMotion = useReducedMotion();
```

**Current lines 62–67:**
```tsx
const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
});

const contentOpacity = useTransform(scrollYProgress, [0.25, 0.75], [1, 0]);
const contentY = useTransform(scrollYProgress, [0.25, 0.75], ['0%', '-8%']);
```

**Replace with:**
```tsx
const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
});

// Disable parallax for users who prefer reduced motion
const contentOpacity = useTransform(scrollYProgress, [0.25, 0.75], prefersReducedMotion ? [1, 1] : [1, 0]);
const contentY = useTransform(scrollYProgress, [0.25, 0.75], prefersReducedMotion ? ['0%', '0%'] : ['0%', '-8%']);
```

**Step 4: Verify**

**macOS:** System Settings → Accessibility → Display → Reduce Motion (ON)
**Windows:** Settings → Ease of Access → Display → Show animations (OFF)
**Chrome DevTools:** Rendering panel → Emulate CSS media feature `prefers-reduced-motion: reduce`

With reduced motion active:
1. Reload `http://localhost:3000` — hero content should appear instantly, no blur-in animation
2. Scroll — hero content should NOT fade/move on scroll
3. Scroll to testimonials — the cards should be static, not scrolling
4. Scroll to any `<Reveal>` section — content should be visible immediately

**Status:** `[ ]`

---

### Sprint 1 Final Verification

After all 5 tasks are complete:

```bash
# From community-focus/
npm run lint
npm run build
```

Expected: 0 lint errors, successful build.

**Manual checklist:**
- [ ] Tab through homepage with keyboard only — focus is always visible
- [ ] Skip link appears on first Tab press on every page
- [ ] Mobile hamburger announces expanded state to screen reader
- [ ] Alert banner close button announces "Close alert"
- [ ] Contact form labels visible above inputs on `/contact`
- [ ] With OS reduce-motion ON: no animations on homepage or community pages

---

## Sprint 2: Brand Color Consistency + Form Feedback — HIGH

**Sprint goal:** Eliminate all off-brand blue colors from community pages, fix alert banner palette, and add proper form submission states to the general inquiry form.

Sprint 2 status: `[ ]` Not started

---

### Task 2.1: Fix off-brand blue colors in community page

**Why:** The community detail page (`[slug]/page.tsx`) uses Tailwind `blue-*` classes that break the emerald brand identity. Affected elements: manager avatar background, hover states, portal card, download icon hover, document row hover.

**Files:**
- Modify: `src/app/communities/[slug]/page.tsx`

**Change 1 — Manager avatar (line 108):**

Current:
```tsx
<div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-brand font-bold text-xl border border-blue-100">
```

Replace with:
```tsx
<div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center text-brand font-bold text-xl border border-emerald-100">
```

**Change 2 — Manager email icon hover (line 119):**

Current:
```tsx
<div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
```

Replace with:
```tsx
<div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
```

**Change 3 — Manager phone icon hover (line 125):**

Current:
```tsx
<div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
```

Replace with:
```tsx
<div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
```

**Change 4 — Resident portal card shadow (line 140):**

Current:
```tsx
<div className="relative bg-gradient-to-br from-brand to-brand-dark text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20 overflow-hidden">
```

Replace with:
```tsx
<div className="relative bg-gradient-to-br from-brand to-brand-dark text-white p-6 rounded-2xl shadow-lg shadow-brand/20 overflow-hidden">
```

**Change 5 — Resident portal text (line 146):**

Current:
```tsx
<p className="text-blue-100 text-sm mb-6">
```

Replace with:
```tsx
<p className="text-brand-snow/80 text-sm mb-6">
```

**Change 6 — Portal button hover (line 152):**

Current:
```tsx
className="block w-full bg-white text-brand text-center py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm"
```

Replace with:
```tsx
className="block w-full bg-white text-brand text-center py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-sm"
```

**Change 7 — Document row hover background (line 184):**

Current:
```tsx
className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group"
```

Replace with:
```tsx
className="flex items-center justify-between px-6 py-4 hover:bg-emerald-50/50 transition-colors group"
```

**Change 8 — Download icon hover (line 192):**

Current:
```tsx
<div className="p-2 rounded-full text-slate-300 group-hover:text-brand group-hover:bg-blue-100/50 transition-all">
```

Replace with:
```tsx
<div className="p-2 rounded-full text-slate-300 group-hover:text-brand group-hover:bg-emerald-100/50 transition-all">
```

**Step 2: Verify**

Visit a community page (e.g., `http://localhost:3000/communities/[any-slug]`). The sidebar manager card, portal card, and document rows should all use green/emerald tones — no blue anywhere on the page.

**Status:** `[ ]`

---

### Task 2.2: Fix AlertBanner brand colors

**Why:** The alert banner uses generic Tailwind colors (`blue-600`, `amber-500`, `red-600`) that don't match the brand system. The `info` type (blue) is the most jarring — it should use brand emerald.

**Files:**
- Modify: `src/components/AlertBanner.tsx` (lines 40–44)

**Current styles object:**
```tsx
const styles = {
    info: "bg-blue-600 text-white",
    warning: "bg-amber-500 text-white",
    emergency: "bg-red-600 text-white"
};
```

**Replace with brand-consistent styles:**
```tsx
const styles = {
    info: "bg-brand text-white",
    warning: "bg-amber-500 text-slate-900",
    emergency: "bg-red-600 text-white"
};
```

**Note:** Warning type changes text to `slate-900` for better contrast against amber (amber-500 with white text fails WCAG AA contrast ratio).

**Step 2: Verify**

In the admin panel, set an alert of type `info` on a test community. Visit the community page — the banner should be emerald green, not blue. Test `warning` type — banner should be amber with dark text. Test `emergency` — red with white text.

**Status:** `[ ]`

---

### Task 2.3: Wire up general inquiry contact form with submission states

**Why:** The general inquiry form currently has no `onSubmit` handler, loading state, or success/error feedback. Submitting the form does nothing visible to the user.

This task has two parts: (a) create a server-side API route, and (b) add client-side submission state to the form.

**Note:** The existing `/api/contact/route.ts` likely already handles this. Check first before creating a new route.

**Files:**
- Read first: `src/app/api/contact/route.ts`
- Modify: `src/app/contact/page.tsx`

**Step 1: Read the existing API route**

Read `src/app/api/contact/route.ts` to understand what fields it expects. Look for: field names, response format (success/error JSON shape).

**Step 2: Convert the contact page to use state**

The page is already `"use client"` and imports `useState`. Add form state management.

Add these imports to `contact/page.tsx` (after existing imports):
```tsx
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
```

Update the `useState` line at the top of `ContactPage`:
```tsx
const [activeTab, setActiveTab] = useState<'general' | 'bid'>('general');
const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
const [formError, setFormError] = useState<string>('');
```

**Step 3: Replace the `<form>` element to handle submission**

Replace `<form className="space-y-4">` with:
```tsx
<form
    className="space-y-4"
    onSubmit={async (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        setFormError('');
        const formData = new FormData(e.currentTarget);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                }),
            });
            if (!res.ok) throw new Error('Failed to send');
            setFormStatus('success');
        } catch {
            setFormStatus('error');
            setFormError('Something went wrong. Please try again or call us directly.');
        }
    }}
>
```

**Step 4: Add success state — show after successful submit**

Wrap the existing form card with a conditional. Before `<div className="bg-white rounded-2xl ...">` insert:

```tsx
{formStatus === 'success' ? (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Thank you for reaching out. We will get back to you within 1 business day.</p>
        <button
            onClick={() => setFormStatus('idle')}
            className="mt-6 text-brand font-bold hover:text-brand-dark text-sm cursor-pointer"
        >
            Send another message
        </button>
    </div>
) : (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {/* ... existing form content ... */}
    </div>
)}
```

**Step 5: Update the submit button to show loading state**

Replace the submit button:
```tsx
<button
    type="submit"
    disabled={formStatus === 'submitting'}
    className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-sm hover:shadow-glow cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
>
    {formStatus === 'submitting' ? (
        <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Sending...
        </>
    ) : (
        <>
            <Send className="w-4 h-4" aria-hidden="true" />
            Send Message
        </>
    )}
</button>
```

**Step 6: Add error message display**

After the `</form>` closing tag, add:
```tsx
{formStatus === 'error' && formError && (
    <div className="flex items-center gap-2 mt-3 text-red-600 text-sm" role="alert">
        <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{formError}</span>
    </div>
)}
```

**Step 7: Verify**

1. Visit `http://localhost:3000/contact`
2. Fill in the form and submit — button should show spinner and "Sending..."
3. On success: success message should replace the form
4. Click "Send another message" — form should reset and show again
5. To test error state: temporarily change the fetch URL to `/api/nonexistent` and submit

**Status:** `[ ]`

---

### Sprint 2 Final Verification

```bash
npm run lint
npm run build
```

**Manual checklist:**
- [ ] Visit any community page — zero blue colors visible anywhere
- [ ] Create a test `info` alert in admin — banner shows emerald green
- [ ] Submit contact form — loading state visible, success message appears
- [ ] Error state displays when API fails

---

## Sprint 3: Layout & Interaction Polish — MEDIUM

**Sprint goal:** Fix responsive hero height, footer CTA mobile spacing, testimonials performance, animate tab switches, animate mobile menu, and apply consistent line-height to body text.

Sprint 3 status: `[ ]` Not started

---

### Task 3.1: Responsive hero height on community pages

**Why:** `CommunityHero.tsx` uses a fixed `h-[450px]` that is too tall on mobile (375px screen) and too short on wide screens.

**Files:**
- Read first then Modify: `src/components/CommunityHero.tsx`

**Step 1: Find the fixed height class**

Read `src/components/CommunityHero.tsx`. Find where `h-[450px]` appears (likely the outer container).

**Step 2: Replace with responsive height**

Replace `h-[450px]` with:
```
h-[280px] md:h-[380px] lg:h-[450px]
```

**Step 3: Verify**

Use Chrome DevTools device toolbar. Check at 375px (iPhone SE), 768px (iPad), 1280px (desktop). Hero should scale appropriately at each breakpoint.

**Status:** `[ ]`

---

### Task 3.2: Footer CTA card — fix mobile overflow

**Why:** The floating CTA card uses `absolute -top-20` with no mobile adjustment. On small screens the card overlaps page content unintentionally.

**Files:**
- Modify: `src/components/Footer.tsx` (lines 19–44)

**Current code (line 20):**
```tsx
<div className="absolute -top-20 left-0 w-full px-4">
```

**Replace with:**
```tsx
<div className="absolute -top-12 sm:-top-16 md:-top-20 left-0 w-full px-4">
```

Also ensure the footer `mt-32` is sufficient for the smaller card offset on mobile. Update `Footer.tsx` line 16:

Current:
```tsx
<footer className={`relative bg-brand-canopy pt-20 text-brand-snow/60 transition-all ${showCTA ? 'mt-32' : 'mt-0'}`}>
```

Replace with:
```tsx
<footer className={`relative bg-brand-canopy pt-20 text-brand-snow/60 transition-all ${showCTA ? 'mt-24 sm:mt-28 md:mt-32' : 'mt-0'}`}>
```

**Step 3: Verify**

Using DevTools at 375px width, scroll to the bottom of any page. The CTA card should not overlap the last section's content.

**Status:** `[ ]`

---

### Task 3.3: Pause testimonials scroll when off-screen

**Why:** The `animate-infinite-scroll` CSS animation runs at all times even when the user has scrolled past the section. This wastes GPU and battery on mobile devices.

**Files:**
- Modify: `src/components/Testimonials.tsx`

**Step 1: Add `useRef` and `useEffect` for IntersectionObserver**

The component is already `"use client"`. Add these imports:
```tsx
import { useRef, useEffect } from 'react';
```

**Step 2: Add ref and IntersectionObserver**

After the `displayReviews` const, add:
```tsx
const scrollRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        },
        { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
}, []);
```

**Step 3: Attach ref to the scrolling element**

Find `<div className="flex gap-8 animate-infinite-scroll w-max py-4">` and add the ref:
```tsx
<div ref={scrollRef} className="flex gap-8 animate-infinite-scroll w-max py-4">
```

**Step 4: Verify**

Open browser DevTools → Performance tab. Record while scrolling past the testimonials section and back. The GPU paint should drop to near-zero when the section is off-screen.

**Status:** `[ ]`

---

### Task 3.4: Animate contact page tab switching

**Why:** The "General Inquiry" / "Bid for Management" tab content switches instantly with no transition, which feels jarring compared to the rest of the site's polished animation style.

**Files:**
- Modify: `src/app/contact/page.tsx`

**Step 1: Add AnimatePresence import**

Update the existing imports. The page already uses React; add Framer Motion:
```tsx
import { AnimatePresence, motion } from 'framer-motion';
```

**Step 2: Wrap tab content in `AnimatePresence`**

Find the tab content section (around line 84):
```tsx
{/* Content */}
{activeTab === 'bid' ? (
    <BidManagementForm />
) : (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        ...
    </div>
)}
```

Replace with:
```tsx
{/* Content */}
<AnimatePresence mode="wait">
    {activeTab === 'bid' ? (
        <motion.div
            key="bid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            <BidManagementForm />
        </motion.div>
    ) : (
        <motion.div
            key="general"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                {/* form content */}
            </div>
        </motion.div>
    )}
</AnimatePresence>
```

**Step 3: Verify**

Visit `http://localhost:3000/contact`. Click between "General Inquiry" and "Bid for Management" — content should fade and slide between tabs smoothly at ~200ms.

**Status:** `[ ]`

---

### Task 3.5: Animate mobile navigation menu open/close

**Why:** The mobile menu (`isOpen && <div>...`) appears/disappears with no animation. A 200ms fade+slide would match the polish level of the rest of the site.

**Files:**
- Modify: `src/components/Navbar.tsx`

**Step 1: Add AnimatePresence import**

Update imports (line 3):
```tsx
import { useState, useEffect } from 'react';
```
Add Framer Motion after existing imports:
```tsx
import { AnimatePresence, motion } from 'framer-motion';
```

**Step 2: Wrap mobile menu dropdown**

Find the conditional render at line 119:
```tsx
{isOpen && (
    <div className="lg:hidden bg-brand-dark border-t border-brand-edge absolute w-full shadow-lg h-screen top-20 left-0">
```

Replace with:
```tsx
<AnimatePresence>
    {isOpen && (
        <motion.div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden bg-brand-dark border-t border-brand-edge absolute w-full shadow-lg h-screen top-20 left-0"
        >
```

Close with `</motion.div>` instead of `</div>`, and close `</AnimatePresence>` after.

**Note:** Also remove the `id` and `role` from the inner div in Task 1.2 since it's now on the `motion.div`.

**Step 3: Verify**

On a mobile viewport, tap the hamburger — menu should slide/fade in. Tap again or tap a link — menu should fade out.

**Status:** `[ ]`

---

### Task 3.6: Apply consistent `leading-relaxed` to body text

**Why:** The UI/UX Pro Max tool guidelines specify 1.5–1.75 line-height for readable body text. Several paragraphs across the site omit line-height, defaulting to Tailwind's tight `leading-normal` (1.5) or even tighter values.

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add a global body paragraph rule**

Add after the existing `body` block in `globals.css`:
```css
/* Consistent readable line-height for body text */
p {
  line-height: 1.65;
}
```

This applies globally without touching any component files. Headings (h1-h6) are unaffected since they have explicit Tailwind classes.

**Step 2: Verify**

Visually scan the homepage, about page, and community page. Body paragraphs should have slightly more breathing room between lines. Check that headings are unaffected.

**Status:** `[ ]`

---

### Sprint 3 Final Verification

```bash
npm run lint
npm run build
```

**Manual checklist:**
- [ ] Community hero at 375px width — hero is not excessively tall
- [ ] Footer CTA card at 375px — no overlap with page content above
- [ ] Tab switch on `/contact` — smooth fade animation between tabs
- [ ] Mobile menu — animates in/out smoothly
- [ ] Scroll past testimonials and back — animation pauses off-screen (check in DevTools Performance)
- [ ] Body text on multiple pages has improved line-height

---

## Sprint 4: Enhancements — LOW PRIORITY

**Sprint goal:** Reusable FormInput component, sticky community sidebar, skeleton loaders for document lists. These are improvements, not fixes.

Sprint 4 status: `[ ]` Not started

---

### Task 4.1: Create reusable `<FormInput>` component

**Why:** Three separate forms (`contact/page.tsx`, the floating-label variant in `BidManagementForm.tsx`) have duplicated input styling. A shared component reduces drift.

**Files:**
- Create: `src/components/FormInput.tsx`
- Modify: `src/app/contact/page.tsx` (replace inline inputs)

**Step 1: Create `src/components/FormInput.tsx`**

```tsx
import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

export function FormInput({ label, id, error, className = '', ...props }: FormInputProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">
                {label}
            </label>
            <input
                id={id}
                className={`w-full p-3 bg-slate-50 border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand focus:ring-brand/20'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error ? 'true' : undefined}
                {...props}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
    error?: string;
}

export function FormTextarea({ label, id, error, className = '', ...props }: FormTextareaProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">
                {label}
            </label>
            <textarea
                id={id}
                className={`w-full p-3 bg-slate-50 border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand focus:ring-brand/20'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none ${className}`}
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error ? 'true' : undefined}
                {...props}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
```

**Step 2: Update `contact/page.tsx` to use the new components**

Replace the labeled inputs from Task 1.4 with `<FormInput>` components:

```tsx
import { FormInput, FormTextarea } from '@/components/FormInput';

// Inside the form:
<FormInput
    id="contact-first-name"
    label="First Name"
    name="firstName"
    autoComplete="given-name"
    placeholder="Jane"
    required
/>
```

**Step 3: Verify**

Visit `/contact`. Labels should still be visible above inputs and function identically to Task 1.4.

**Status:** `[ ]`

---

### Task 4.2: Sticky community sidebar

**Why:** On long community pages with many documents, users scroll down to read documents but can't access the portal login link or manager contact without scrolling back up. A sticky sidebar fixes this.

**Files:**
- Modify: `src/app/communities/[slug]/page.tsx` (line 98)

**Step 1: Add `sticky` positioning to the left column**

Find the left column wrapper (line 98):
```tsx
<div className="space-y-8">
```

Replace with:
```tsx
<div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
```

**Explanation:** `top-28` (112px) accounts for the 80px navbar (`h-20`) plus 32px breathing room. `self-start` prevents the sticky element from stretching to the grid row height.

**Step 2: Verify**

Visit a community page with many documents. On desktop (1024px+), scroll down through the document list — the sidebar (manager card + portal link) should stay visible in the top-right as you scroll.

**Status:** `[ ]`

---

### Task 4.3: Skeleton loader for community documents

**Why:** The document list is fetched server-side, but if loading is slow (cold NeonDB connection), the page shows nothing until data arrives. A skeleton prevents layout shift and signals that content is loading.

**Note:** Since `[slug]/page.tsx` is a server component (`async function`), the skeleton should be implemented as a `loading.tsx` file in the same route segment, which Next.js App Router handles automatically.

**Files:**
- Create: `src/app/communities/[slug]/loading.tsx`

**Step 1: Create the loading skeleton**

```tsx
export default function CommunityPageSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero skeleton */}
            <div className="h-[280px] md:h-[380px] lg:h-[450px] bg-brand-dark animate-pulse" />

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-16 relative z-20">
                {/* Sidebar skeleton */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-white/50">
                        <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-brand/20 p-6 rounded-2xl animate-pulse h-36" />
                </div>

                {/* Documents skeleton */}
                <div className="lg:col-span-2 space-y-6 lg:mt-24">
                    <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="flex items-center justify-between px-6 py-4">
                                        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                                        <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
```

**Step 2: Verify**

Next.js automatically shows `loading.tsx` while the page's async data fetches. To test: temporarily add `await new Promise(r => setTimeout(r, 3000))` at the top of `getData()` in `[slug]/page.tsx`, visit a community page — skeleton should appear for 3 seconds then replace with real content. Remove the delay after testing.

**Status:** `[ ]`

---

### Sprint 4 Final Verification

```bash
npm run lint
npm run build
```

**Manual checklist:**
- [ ] `FormInput` component renders correctly with label and error state
- [ ] Community page sidebar is sticky on desktop scroll
- [ ] Community page loading skeleton appears during data fetch

---

## Quick Reference: All Files Modified

| File | Modified In |
|---|---|
| `src/app/layout.tsx` | Sprint 1, Task 1.1 |
| `src/components/Navbar.tsx` | Sprint 1 Task 1.2 · Sprint 3 Task 3.5 |
| `src/components/AlertBanner.tsx` | Sprint 1 Task 1.3 · Sprint 2 Task 2.2 |
| `src/app/communities/[slug]/page.tsx` | Sprint 1 Task 1.3 · Sprint 2 Task 2.1 · Sprint 4 Task 4.2 |
| `src/app/contact/page.tsx` | Sprint 1 Task 1.4 · Sprint 2 Task 2.3 · Sprint 3 Task 3.4 · Sprint 4 Task 4.1 |
| `src/app/globals.css` | Sprint 1 Task 1.5 · Sprint 3 Task 3.6 |
| `src/components/Reveal.tsx` | Sprint 1 Task 1.5 |
| `src/components/HeroSection.tsx` | Sprint 1 Task 1.5 |
| `src/components/Testimonials.tsx` | Sprint 3 Task 3.3 |
| `src/components/CommunityHero.tsx` | Sprint 3 Task 3.1 |
| `src/components/Footer.tsx` | Sprint 3 Task 3.2 |
| `src/components/FormInput.tsx` (new) | Sprint 4 Task 4.1 |
| `src/app/communities/[slug]/loading.tsx` (new) | Sprint 4 Task 4.3 |
