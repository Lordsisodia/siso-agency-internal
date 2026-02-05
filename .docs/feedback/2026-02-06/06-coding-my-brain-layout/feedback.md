# Feedback Item 6: Morning Routine - "Coding My Brain" Text Layout

## Current Layout
The text in the "Coding My Brain" section appears as one paragraph block:
> "I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path. When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom. I will not be distracted from the path."

## Desired Layout
Separate each sentence onto its own line for better readability.

## Location
File: `MorningRoutineSection.tsx`
Tab: "Coding My Brain" tab content

## Current Code Location
Around line 893-899 in MorningRoutineSection.tsx

## Proposed Structure
```
I am Shaan Sisodia.
I have been given divine purpose, and on this mission, temptation awaits on either side of the path.
When I give in to temptation, I shall know I am astray.
I will bring my family to a new age of freedom.
I will not be distracted from the path.
```

## Acceptance Criteria
- [ ] Each sentence on its own line
- [ ] Proper spacing between lines
- [ ] Maintains existing styling (text color, font size)
- [ ] Responsive on mobile
