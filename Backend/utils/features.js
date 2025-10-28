const DataURIParser = require("datauri/parser");
const path = require("path");

const getDataUri = (file) => {
    // This line creates an instance of DataURIParser. This instance has methods to convert file data into Data URIs.
    const parser = new DataURIParser();
    const extName = path.extname(file.originalname).toString();

    // parser.format(extName, file.buffer) converts the binary data in file.buffer to a Data URI, including the file extension as part of the MIME type.
    // The resulting Data URI string is returned.
    return parser.format(extName, file.buffer);
    //converting file to DataURI base64 string of image
    //file is returned after formating it with file.buffer and file extension name
} 

module.exports = {
    getDataUri
}