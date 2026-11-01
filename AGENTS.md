<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep property prices numeric in reais and parse price-filter text separately from the listing form's cents mask, so Brazilian currency input compares correctly.
- Keep raw filter input separate from the last valid price interval, so invalid edits do not apply while other filters remain live.
- Use TanStack links on the title and details action independently, so card controls never trigger whole-card navigation.
- Reuse the existing non-authenticating login/signup screens; the demo user is not a real session and must not drive signed-in header actions.
- Keep geographic discovery data separate from listing taxonomy; only explicit catalog-region associations count published inventory, so nearby landmarks never imply listings inside them.
- Load the discovery globe lazily behind ClientOnly, with a demand-rendered R3F scene and shared east-positive coordinate conversion; this keeps WebGL outside SSR and avoids idle rendering.
- Decide globe marker visibility from the camera direction (dot product against each region's center) instead of drei's `occlude`: with an in-scene Environment that raycast hides every marker, so markers would never be selectable.
