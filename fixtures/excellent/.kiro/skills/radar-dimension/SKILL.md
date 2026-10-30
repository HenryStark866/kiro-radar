---
name: radar-dimension
description: How to add or change a scoring dimension in Kiro Radar, including good fixture, bad fixture, and tests. Follow this skill when creating or modifying any of the 10 scoring dimensions.
---

# Radar Dimension Skill

## Steps

1. Define the dimension class in dimensions.ts implementing the Dimension interface.
2. Create a good fixture under fixtures/excellent/.kiro/<dimension>/.
3. Create a minimal fixture under fixtures/minimal/.kiro/<dimension>/.
4. Ensure trap fixture has no real content for this dimension.
5. Write tests in packages/core/test/ covering 0, mid, and 10 scores.
6. Verify the dimension does not execute code from the scanned repository.
