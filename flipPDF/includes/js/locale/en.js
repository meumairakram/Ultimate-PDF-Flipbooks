/// <reference path="../_references.js" />

(function InitLocale(window)
{
    if (window['exHelp'] == void 0 || window['exHelpExtend'] == void 0)
    {
        return setTimeout(InitLocale, 100, window);
    }

    // Create shorthand
    var p = exHelp;

    var locale = p.storage("locale");
    locale["en"] =
        {
            ERROR_TITLE: "ERROR",
            ERROR_UPLOAD_PHP: "No upload.php file found or incorrect file",
            ERROR_NO_FILES: "No files found",
            ERROR_NO_PDF: "No PDF file could be found in the target directory",

            LOADING: "Loading...",
            LOADING_FINISHED: "Finished",
            LOADING_ERROR: "Error",

            PROCESSING_TITLE: "Content preparation",
            PROCESSING_TEXT: "Please wait while your content is being prepared for the first time",
            PROCESSING_INIT: "Initializing...",
            PROCESSING_PREP: "Preparing...",
            PROCESSING_PREPARING: "Preparing {0} pages...",
            PROCESSING_FINISHED: "Finished. Please reload the page.",
            PROCESSING_WORKING: "Processing page {0} of {1}...",
            PROCESSING_UPLOADING: "Uploading page {0} of {1}...",
            PROCESSING_PDF: "Loading PDF Document... ({0}%)",

            UNSUPPORTED_AUDIO: "Your Browser doesn't support this type of audio.",
            UNSUPPORTED_VIDEO: "Your Browser doesn't support this type of video."
        };

})(window);