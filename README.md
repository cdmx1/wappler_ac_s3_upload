This is a custom S3 upload component designed to give more features to S3 AC module when uploading files.
## S3 Upload Control Properties: 
Properties for configuring the behavior and appearance of the upload control.
1. **ID**: Identifier for the upload control.
2. **Class**: CSS class for styling purposes.
3. **Url**: Wappler API endpoint (POST) having the Signed Upload module returning "url" as response.
4. **Accept**: Allowed file types/extensions for upload.
5. **Validation Message**: Message displayed when file type validation fails.
6. **Auto Upload**: Option to automatically upload files after selection.
7. ****CSV Options****: Additional properties specifically for handling CSV files.
8. **CSV Row Limit**: Maximum number of rows allowed in a CSV file.
9. **CSV Limit Validation**: Validation message displayed when the CSV row limit is exceeded.
10. **CSV No Records Validation**: Validation message displayed when a CSV file has no records.

## Actions
1. **Abort**: Action to abort the upload process.
2. **Reset**: Action to reset the upload control.
3. **Select**: Action to select a file for upload.
4. **Upload**: Action to initiate the file upload process.
