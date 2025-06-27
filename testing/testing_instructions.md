# Testing Instructions for ToolsJockey

## How to Use the Testing Files

Each tool has a dedicated testing checklist in category-specific files. All files are located in the `testing` directory:

- `pdf_tools_testing_checklist.csv`
- `video_tools_testing_checklist.csv`
- `image_tools_testing_checklist.csv`
- `excel_csv_tools_testing_checklist.csv`
- `document_tools_testing_checklist.csv`
- `color_design_tools_testing_checklist.csv`
- `developer_tools_testing_checklist.csv`
- `utility_tools_testing_checklist.csv`
- `tools_testing_checklist.csv` (master list)

## Using the "Tester Notes" Column

The "Tester Notes" column is provided for you to record important observations during testing. Use this column to document:

1. **Issues Found**: Record any bugs, errors, or unexpected behavior
2. **Browser Differences**: Note if behavior varies across browsers or devices
3. **Performance Observations**: Document how the tool performs with large files or complex operations
4. **Edge Cases**: Record any unusual situations or inputs that caused problems
5. **UI/UX Issues**: Note any usability problems or interface inconsistencies
6. **Improvement Suggestions**: Add ideas for enhancing the tool's functionality

## Example Notes Format

When adding notes, consider using this format for clarity:

```
[Issue/Observation Type]: Description of what was found. 
[Browser/Device]: Specific environment where issue occurs.
[Reproduction Steps]: Brief steps to reproduce if relevant.
```

## Example Tester Notes

Here are some examples of good tester notes:

1. `[BUG]: Failed to compress PDFs larger than 25MB. Error message: "Processing timeout"`
2. `[BROWSER]: Watermark positioning inconsistent in Firefox vs. Chrome`
3. `[PERFORMANCE]: Slows significantly with videos longer than 10 minutes`
4. `[UX]: Unclear which fields are required in the form filling interface`
5. `[SUGGESTION]: Add batch processing option for multiple images`

## Marking Tests as Complete

Once you've completed testing for a tool:

1. Change the checkbox from `□ Tested` to `✓ Tested` in the CSV file
2. Ensure you've added relevant notes in the Tester Notes column
3. Update the master checklist (`tools_testing_checklist.csv`) with the same status

## Testing Resources

Refer to the [Testing Resources Guide](./testing_resources.md) for sample test files and testing environment recommendations.

## Testing Master Index

The [Testing Master Index](./testing_master_index.md) provides an overview of all testing materials and can be used to track overall testing progress. 