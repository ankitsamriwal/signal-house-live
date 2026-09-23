| # | Test | Result | Notes |
|---|------|--------|-------|
| s01 | Warm accelerating lead (Sarah) | PASS | intent 3/3, trust 2/3, accelerating, methodical-evaluator, send-tailored-proof; 308ms |
| s12 | Arabic interactions | PASS | HTTP 200, 398ms, pattern methodical-evaluator, velocity steady, intent 2 |
| s13 | XSS in notes escaped | PASS | HTTP 200, 374ms, pattern single-threaded, velocity steady, intent 0 |
| s14 | Very long history (30 interactions) | PASS | HTTP 200, 336ms, pattern methodical-evaluator, velocity steady, intent 1 |
| s15 | Single cold touch - low intent expected | PASS | HTTP 200, 297ms, pattern ghosting, velocity gone-cold, intent 0 |
| s16 | Multi-threading across stakeholders | PASS | HTTP 200, 303ms, pattern multi-threading, velocity steady, intent 3 |
| s17 | Unknown channel normalizes to other | PASS | HTTP 200, 333ms, pattern single-threaded, velocity accelerating, intent 2 |
| s18 | Undated interaction tolerated | PASS | HTTP 200, 281ms, pattern single-threaded, velocity steady, intent 2 |
| s19 | Duplicate names - order preserved | PASS | HTTP 200, 317ms, pattern single-threaded, velocity steady, intent 3 |
| s20 | Emoji and unicode | PASS | HTTP 200, 299ms, pattern methodical-evaluator, velocity steady, intent 3 |
| s21 | Long note text | PASS | HTTP 200, 426ms, pattern methodical-evaluator, velocity steady, intent 2 |
| w1 | Loads at 390px, no overflow | PASS | overflow 0px |
| w2 | Lead form accepts input | PASS | filled |
| w3 | Add lead adds a card | PASS | 2 leads |
| w4 | Remove lead works | PASS | 1 lead |
| w5 | Live analysis renders result card | PASS | visible |
| w6 | No undefined/NaN rendered | PASS | clean |
| w7 | Pattern + next move blocks render | PASS | present |
| w8 | Timeline renders 4 interactions | PASS | 4 entries |
| w9 | Channel badges cover all channels | PASS | MEETING,LINKEDIN,CALL,EMAIL |
| w10 | Channel mix pills render | PASS | 1x meeting 1x linkedin 1x call 1x email |
| w11 | No overflow after render | PASS | overflow 0px |
| w12 | Empty submit shows inline error | PASS | Add at least one lead with interaction history. |
| w13 | Zero JS page errors | PASS | none |
