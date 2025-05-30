#### Maintained by: Roney Dsilva

## Custom S3 Upload Control
This is a custom S3 upload component designed to give more features to S3 AC module when uploading files.

## S3 Upload Control Properties:
Properties for configuring the behavior and appearance of the upload control.
  - **ID**: Identifier for the upload control.
  - **Class**: CSS class for styling purposes.
  - **Url**: Wappler API endpoint (POST) having put file from the custom s3 upload.
  - **Input name**: Input name for the input tag and to send as post parameter name for the file, default is `s3_upload`.
  - **Accept**: Allowed file types/extensions for upload.
  - **Validation Url**: Wappler API endpoint to validate file, (Sends the file in request).Leave `blank` if you don't want server-side validation.
  - **Validation Message**: Message displayed when file type validation fails.
  - **File Size Limit**: File size limit in bytes.
  - **Auto Upload**: Option to automatically upload files after selection.
  - **CSV Options**: Additional properties specifically for handling CSV files.
  - **CSV Row Limit**: Maximum number of rows allowed in a CSV file.
  - **CSV Limit Validation**: Validation message displayed when the CSV row limit is exceeded.
  - **CSV No Records Validation**: Validation message displayed when a CSV file has no records.

## Actions
- **Abort**: Action to abort the upload process.
- **Reset**: Action to reset the upload control.
- **Select**: Action to select a file for upload.
- **Upload**: Action to initiate the file upload process.


### CSV Schema Validation

The following JavaScript code snippet defines the schema used for validating CSV files. If using, it needs to be defined on the page or accessible to the page:

```html
<script>
  function isEmailValid(email) {
    // Regular expression to validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  let val_csv_schema = {
      headers: [
        {
          name: 'First Name',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
          }
        },
        {
          name: 'Last Name',
          required: true,
          requiredError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`
          }
        },
        {
          name: 'Email',
          required: false,
          validate: function (email) {
            return isEmailValid(email)
          },
          validateError: function (headerName, rowNumber, columnNumber) {
            return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
          }
        }
      ]
    }
</script>
