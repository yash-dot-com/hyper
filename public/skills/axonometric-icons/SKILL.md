---
name: axonometric-icons
description: Draw recognizable physical objects as isometric or dimetric SVG icons with coherent projection, raised details, material shading, and correct occlusion. Use for an individual icon, icon family, or a React SVG component.
---

# Axonometric icons

Build the object in local 3D coordinates. Emit an ordinary SVG. The deliverable must remain usable without a 3D runtime.

## Resolve uncertainty before drawing

If you do not know what the requested object looks like, ask the user for the visual reference they want before spending tokens on a speculative rendering. Ask one focused question: “Could you share a front or three-quarter reference, or describe the silhouette and the two details that identify this object?” If you cannot view images, say so and request a text description: width relative to height, visible faces, control locations, distinctive parts, and intended colors. Never imply you inspected an image you cannot see. Do not require a reference for a familiar object whose intended form is clear. If a reference shows an unfamiliar mechanism, draw the visible geometry; do not invent hidden internals.

## Make a part list

1. Name the recognizable silhouette and two identifying features. A turntable needs a platter and a pivoted tonearm; a box with circles could be anything.
2. Pick the final display size. At 32px prioritize silhouette and two or three large masses. At 96–256px add fittings that stay legible. Reserve fine grooves, bevels and screws for sizes that can resolve them.
3. Write a compact part ledger before coding: part, parent, local origin, width, depth, height, material. Specify where each part meets its parent. A knob starts at the panel height, and its pointer belongs on its lid. For a recess put the back surface below its rim.
4. Choose one material palette and one light direction for the family. Separate adjacent parts by value as well as hue. A light cap on a dark wall is legible even when the icon is small.

## Use one projector for the entire object

Let x and y run along the base, and let positive z point up. Use SVG screen coordinates with positive Y downward. A useful camera looks toward the origin from positive x and positive y. With elevation e, set u = 1/sqrt(2), v = sin(e)/sqrt(2), h = cos(e). Use radians.

    P(x,y,z) = (ox + u*(x-y), oy + v*(x+y) - h*z)

For isometric use e = asin(1/sqrt(3)), approximately 35.264°. The two ground axes appear at ±30° to the horizontal and all three axes have equal scale. For dimetric try e = 20°. Both ground axes retain equal scale but vertical lengths now have a different scale. Recompute every part, including sidewalls, when the projection changes. Tilting the top alone breaks the joints.

For panel graphics at constant z, use SVG matrix(u v -u v ox oy-h*z), substituting numbers before serializing. For a graphic on the x=W wall, use an origin at P(W,0,0) and basis vectors (-u,v) and (0,-h). Apply local coordinates inside that group. This puts labels and slots on the correct plane without guessing rotations.

## Construct surfaces, then details

- **Box or chamfered cap:** define a footprint in x/y. Project it once at the base height and once at the lid height. Join the matching vertices of each visible edge into a four-point wall; paint the lid last. Clip corners in the footprint before projection to obtain a consistent bevel. A second flat rectangle offset on the panel cannot supply these walls.
- **Upright cylinder:** a circular footprint of radius r projects to an ellipse with rx=r and ry=r*sin(e). The top ellipse sits h*height screen units above its base. Join its left and right extrema to the matching base points and use the visible half of the base arc for the lower edge. Draw the top ellipse last. To add knurling, terminate each rib on the curved boundary, not on a straight horizontal line.
- **Recess or display:** draw a rim, darker inner lip, then a clipped face. Place the waveform, ticks or display contents in the face's local coordinates. A subtle highlight on the glass should preserve contrast. Keep the bezel thick enough to survive at target size.
- **Irregular silhouette:** trace a low-point-count closed boundary before adding holes or ornament. Extrude the boundary and its cutouts together. Use an even-odd path for a through-hole and include the visible inner wall. For curved shells use several cross-sections or connected curves sharing endpoints.
- **Placement:** draw the case, its flush graphics, and then its raised hardware. On the same plane draw farther hardware first (smaller x+y in this convention). For tall or overlapping parts, inspect their projected bounds. Split partly occluded paths where a single ordering cannot satisfy both overlaps. A foot behind the case must not paint over its front.
- **Material:** choose explicit lid and side colors; keep their light ordering consistent. Use a narrow highlight on an exposed edge, not a white outline around every polygon. Keep contact shadows tight to a raised part's base. Painted markings should not cast shadows. Use gradients for curved surfaces or metal only where they clarify form.

## Fit and verify

Project all extrema including feet, antennae, handles and raised lids. Compute a viewBox enclosing them with a small optical margin. A tilted antenna may extend above the top face; a tall knob's top may extend above its base box. For a family center the visible mass and match perceived scale. Preserve aspect ratio and a transparent background. Scope clip, mask and gradient IDs per instance for inline React, for example with useId(). Give informative SVGs an accessible name; hide purely decorative icons from assistive technology.

Render at intended size and at 2×. Check silhouette first, then look for floating parts, reversed light, seams, intersections, clipped corners and details thinner than a display pixel. In both projections compare the bottom of each wall to the footprint below. If rendering is unavailable, check these numeric invariants and report that visual review remains outstanding. Return complete standalone SVG or TSX as requested, with any required helper included.

## Prompts to adapt

**Single object:** “Use the procedure above to draw [object] for [placement] at [size]. Its defining features are [features]. Use [projection] with [palette/material]. Establish proportions from [reference or written description]. Give [raised part] visible sidewalls and seat [inset part] inside its rim. Return complete [SVG/TSX].”

**Matching family:** “Create [list] as a family. First choose one camera, light, optical margin, and smallest readable detail. Keep each silhouette distinct. Reuse projection helpers, not the same underlying box for every object. Show the family together at [size] before finalizing individual assets.”

**Repair a flat drawing:** “Inspect [existing SVG]. Classify every visible detail as printed, raised, recessed or cut through. Keep printed geometry on its plane. Rebuild raised and recessed geometry using shared world coordinates. Preserve object identity and API, then compare both projection views.”

The examples folder contains six standalone worked drawings: a turntable, cassette, keyboard, speaker and handheld console in isometric, plus a compact camera in dimetric. Use them to inspect how geometry meets, not as mandatory templates.
