#### Maintained by: Roney Dsilva
# Custom S3 Upload Control


This is a custom S3 upload component designed to give more features to S3 AC module when uploading files.
## S3 Upload Control Properties: 
Properties for configuring the behavior and appearance of the upload control.
  - **ID**: Identifier for the upload control.
  - **Class**: CSS class for styling purposes.
  - **Url**: Wappler API endpoint (POST) having the Signed Upload module returning "url" as response.
  - **Accept**: Allowed file types/extensions for upload.
  - **Validation Message**: Message displayed when file type validation fails.
  - **Auto Upload**: Option to automatically upload files after selection.
- ****CSV Options****: Additional properties specifically for handling CSV files.
  - **CSV Row Limit**: Maximum number of rows allowed in a CSV file.
  - **CSV Limit Validation**: Validation message displayed when the CSV row limit is exceeded.
  - **CSV No Records Validation**: Validation message displayed when a CSV file has no records.

## Actions
- **Abort**: Action to abort the upload process.
- **Reset**: Action to reset the upload control.
- **Select**: Action to select a file for upload.
- **Upload**: Action to initiate the file upload process.
