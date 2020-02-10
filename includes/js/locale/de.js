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
    locale["de"] =
        {
            ERROR_TITLE: "Fehler",
            ERROR_UPLOAD_PHP: "Keine upload.php Datei gefunden oder falsche Datei",
            ERROR_NO_FILES: "Keine Dateien gefunden",
            ERROR_NO_PDF: "Es wurde keine PDF Datei im Zielordner gefunden",

            LOADING: "Laden...",
            LOADING_FINISHED: "Fertig",
            LOADING_ERROR: "Fehler",

            PROCESSING_TITLE: "Inhaltvorbereitung",
            PROCESSING_TEXT: "Bitte warten Sie während Ihr Inhalt zum ersten mal Vorbereitet wird",
            PROCESSING_INIT: "Initialisieren...",
            PROCESSING_PREP: "Vorbereiten...",
            PROCESSING_PREPARING: "Bereite {0} Seiten vor...",
            PROCESSING_FINISHED: "Fertig.",
            PROCESSING_WORKING: "Verarbeite Seite {0} von {1}...",
            PROCESSING_UPLOADING: "Lade Seite {0} von {1} hoch...",
            PROCESSING_PDF: "Lade PDF Dokument... ({0}%)",

            UNSUPPORTED_AUDIO: "Ihr Browser unterstützt dieses Audioformat nicht.",
            UNSUPPORTED_VIDEO: "Ihr Browser unterstützt dieses Videoformat nicht."
        };

})(window);