# Styling Audit Checklist

Audit date: February 22, 2026

## Baseline Metrics

- Inline `style={{...}}` attributes in `src/`: `6` (now `0`)
- `sx={{...}}` usages in `src/`: `14` (kept where MUI-local overrides are intentional)
- Empty `styled(...)` wrappers in `src/`: `15` (now `0`)
- `theme.spacing(...)` calls: `236`
- Decimal spacing calls: `115` (partially reduced in low-risk hotspots)

## Low-Hanging Fruit Pass

- [x] Remove all inline `style` attributes from app code.
- [x] Remove empty `styled()` wrappers and replace with plain elements or real primitives.
- [x] Normalize obvious spacing outliers (`45px` menu offset, `p: 1.2`, mismatched input paddings).
- [x] Deduplicate repeated card/surface styling by introducing shared surface style reuse.
- [x] Add lint guardrail to prevent inline style regressions.

## Follow-Up Backlog

- [ ] Reduce high-variance spacing decimals in dense files (for example `src/pages/Books/boardStyles.ts`, `src/components/Comments/styles.ts`, `src/pages/Home/styles.ts`).
- [ ] Standardize radius usage in legacy components that still use ad hoc values.
- [ ] Add visual regression snapshots for key pages before larger spacing normalization.

