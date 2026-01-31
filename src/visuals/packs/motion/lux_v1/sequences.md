# Luxury Motion v1 — Sequences (Implemented)

These sequences define **slow, breathable** motion. Nothing should snap.

## Global rules
- Stagger reveals: frame → label → value → detail
- Never animate everything at once
- Completed states settle into stillness

## States
### loading
- Progress: allow **flow loop**
- Numbers: no odometer ticks until first valid data

### live
- Progress: allow subtle periodic drift (not constant)
- Numbers: animate deltas lightly (no full reroll)

### idle
- No loops
- Only enter/exit transitions

### complete
- No loops
- No shimmer
- Settle with minimal fade/translate

## Reduce motion
If `reduceMotion=true`, disable:
- Rolodex tick
- Flow loop shimmer
- Scene transitions (use instant scene swap)
