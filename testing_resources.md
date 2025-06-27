# ToolsJockey Testing Resources Guide

## Testing Approach

This guide provides resources and guidelines for thorough testing of all ToolsJockey tools. For each tool, follow these general steps:

1. Review the tool-specific testing checklist CSV file
2. Prepare the required test files
3. Execute all testing steps in order
4. Verify results against expected outcomes
5. Check performance with larger datasets where applicable
6. Mark as tested when all criteria are met

## Sample Test Files

### PDF Test Files
- [Sample PDF Form](https://www.irs.gov/pub/irs-pdf/fw4.pdf) (IRS W-4 form)
- [Sample PDF with Text/Images](https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf)
- [Large PDF Document](https://www.hathitrust.org/sites/www.hathitrust.org/files/documents/HathiTrust_Copyright_Policies.pdf)
- [Password-protected PDF](https://helpx.adobe.com/acrobat/kb/protected-pdf-file-opens-error.html) (use sample files)

### Video Test Files
- [Sample MP4 Video](https://www.learningcontainer.com/mp4-sample-video-files-download/)
- [Sample WebM Video](https://www.webmfiles.org/demo-files/)
- [Sample Videos Collection](https://gist.github.com/jsturgis/3b19447b304616f18657)

### Image Test Files
- [Sample Images Collection](https://github.com/image-size/image-size/tree/main/test/fixtures)
- [High-resolution Photos](https://unsplash.com/)
- [Images with EXIF data](https://github.com/ianare/exif-samples/tree/master/jpg)

### Spreadsheet Test Files
- [Sample CSV Files](https://people.math.sc.edu/Burkardt/data/csv/csv.html)
- [Sample Excel Files](https://www.contextures.com/xlsamplefiles.html)
- [Large Dataset Examples](https://github.com/datablist/sample-csv-files)

### Document Test Files
- [Sample Word Documents](https://github.com/microsoft/Word-Add-in-JavaScript-SpecKit/tree/master/samples)
- [Markdown Examples](https://github.com/matiassingers/awesome-readme/blob/master/readme.md)

### Developer Test Files
- [JSON Samples](https://github.com/jdorfman/awesome-json-datasets)
- [CSS Sample Files](https://github.com/vincentbouillart/sample-css-files)

## Testing Environment

For consistent testing results:

1. Test on multiple browsers:
   - Chrome (latest version)
   - Firefox (latest version)
   - Safari (latest version)
   - Edge (latest version)

2. Test on different devices:
   - Desktop (Windows & Mac)
   - Tablet (iOS & Android)
   - Mobile (iOS & Android)

3. Test with varying internet speeds:
   - Use browser throttling to simulate slower connections
   - Test with large files both on fast and slow connections

## Testing Documentation

For each tool:
1. Record any bugs or issues in the appropriate CSV file
2. Document edge cases where the tool performs unexpectedly
3. Note any performance limitations discovered
4. Suggest potential improvements

## Common Testing Scenarios

Check all tools for these common issues:

1. **Error Handling**:
   - Does the tool gracefully handle invalid input?
   - Are error messages clear and helpful?
   - Does the tool recover properly after errors?

2. **Performance**:
   - How does the tool perform with maximum expected file sizes?
   - Is there noticeable UI lag during processing?
   - Are progress indicators shown for long operations?

3. **Usability**:
   - Is the tool interface intuitive?
   - Are all functions clearly labeled?
   - Does the tool provide helpful guidance/tooltips?

4. **Accessibility**:
   - Can the tool be operated via keyboard?
   - Does it work with screen readers?
   - Is there sufficient color contrast?

5. **Privacy/Security**:
   - Is all processing done client-side as expected?
   - Are there any unintended network requests?
   - Is sensitive data handled properly? 