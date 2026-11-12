---
name: gradient-objects
description: Create interactive React SVG objects whose color gradients describe material and depth, with Motion gestures grounded in the real mechanism.
---

# Gradient Objects

Start with the light. At rest, the user should already be able to tell what is solid, what is hollow, and where to put a finger. Use motion to reveal a surface that the resting object partly conceals.

## Design the color ramps first

Pick a material and a light source. For these examples daylight falls from upper left. Choose five colors by role: rim, lit face, body, folded edge, deepest recess. Shift hue gently as value falls. A coral face can move through apricot into plum shadow. Simply mixing black into orange tends to give a muddy brown. Test all five swatches against the actual stage background.

| Material | Rim | Light | Body | Fold | Recess |
| --- | --- | --- | --- | --- | --- |
| Sea glass enamel | #EAFFDC | #A5ECBD | #45BBA2 | #257E78 | #16494D |
| Warm lacquer | #FFF2D6 | #FFC1A0 | #EF886E | #B54D53 | #592E40 |
| Orchid cabinet | #F6EBFF | #D8B8FA | #A384DC | #7359AE | #403667 |

Assign ramps per surface:

- A broad painted face takes a diagonal linear gradient. Try rim at 0%, light at 16%, body at 62%, fold at 100%. Pull the brightest stop closer to the edge if the face starts to look metallic.
- A rounded horizontal bolt reflects a horizontal strip of light. Run its gradient vertically, from fold to rim at 22%, through light at 52%, body at 80%, then recess. Rotate that ramp if the cylinder axis changes.
- A cavity starts dark just under the overhang and becomes lighter toward its exposed floor. The edge that casts the shadow must touch it. Keep this ramp on the housing when a part slides through it.
- For a plastic handle use a small radial highlight high and left. For paper use near-white warm grays with low contrast. Putting the same saturated highlight on paper, metal and plastic makes them look like one material.
- Use a radial ground shadow with transparent edges. Keep it at the contact plane. Inspect the thumbnail in grayscale: the moving part and cavity must still separate. If they merge, adjust the midtones before adding another glow.

## Model the interaction

If the mechanism is unfamiliar, ask for a reference before drafting. If images cannot be inspected, ask which part the hand touches, where it attaches, which direction it travels, and what is revealed.

List fixed parts, moving parts, attachment points, rest position and mechanical stop. Paint the recess first, moving parts next, foreground retainers last. Position the midpoint of the gesture manually and check whether it could exist in the physical object.

- **Folder:** back and bottom seam stay still. Only the front lip spreads a few pixels and drops. Use matching SVG path commands in both poses. Raise the papers at slightly different times; keep the label on the anchored lower pocket.
- **Favorite heart:** give the lobes a warm pink highlight and the lower edge a deeper berry fold. Lift on hover and compress on press.
- **Messages:** keep the tail legible at small sizes. Three pale dots lift in sequence over a mint-to-teal face.
- **Notifications:** shade the bell from pale gold to amber and copper. Swing from its crown, leaving room around the silhouette.

## Implement and verify

Use a native button for a two-state action, aria-pressed for its state, and an accessible name describing the action. Use standalone SVGs for stickers, or put them inside an existing action button or navigation link. Support keyboard and touch. Do not shrink the hit target with the graphic.

In React, scope SVG paint-server IDs with useId(). Use motion/react for the few transforms or path morphs that communicate the mechanism. Use gentle damping for paper, firmer stops for metal. Keep icon gestures small enough to remain readable in a toolbar. Respect reduced motion by applying the final state immediately without stagger. Keep every state intelligible without animation.

Inspect the four examples in the included TSX files. Test rest, halfway and final poses at both thumbnail and detail sizes. Check keyboard activation, touch, focus and multiple instances using different IDs. Deliver the complete source and a usage example including dependencies.

## Pasteable brief

“Build [object] for [placement] using React SVG and Motion. Material: [material]. Palette direction: [colors]. First identify the five color roles, then assign separate ramps to the face, cavity, edge and handle. Describe the fixed housing and the moving assembly. Implement [gesture] from [rest] to [stop], exposing [surface]. Keep the anchored edges stationary. Return a self-contained accessible component, a short usage example and a reduced-motion state.”
