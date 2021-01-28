var mainDocument = app.activeDocument;
var symbols = activeDocument.layerSets["symbols"];
var copied_symbols = activeDocument.layerSets["copied_symbols"];
var text = activeDocument.layerSets["text"];
var locations = activeDocument.layerSets["locations"];
var toggles = activeDocument.layerSets["toggles"];
var instructions = activeDocument.layerSets["instructions"];

// Testing
createCards([
    {
        toggles: [ ],
        text: {
            "title": "Hello world"
        },
        icons: {
            "": ""
        },
        print: true
    }
]);

/**
 * 
 * @param array items An array of object, each object containing the following format:
 * {
 *   toggles: [ "string" ]
 *   text: {
 *     "loc_name": "text of the text block indicated by loc_name"
 *   },
 *   icons: {
 *     "loc_name": "icon_name"
 *   }
 *   print: boolean
 * }
 * @param config An optional object contains certain configurable properties. All the properties are optional.
 * {
 *  folder: The folder path that you want to save the files to. Default is the location of the photoshop files.
 *  columns: If you want to combine the items into "sheets" this is the number of columns per sheet. Default is 1.
 *  rows: If you want to combine the items into "sheets" this is the number of rows per sheet. Default is 1.
 *  clean: A default item to 'reset' the photoshop file to. This object should be configured as described in the 'items' parameter.
 * }
 */
function createCards(items, config) {
    var config = initConfig(config);
    var printSheet = printer(config.columns, config.rows, config.folder);
    var itemsPerSheet = config.columns * config.rows;
    var sheetIndex = 1;
    var cardIndex = 1;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.print) {
            setup();

            if ((cardIndex-1) >= itemsPerSheet) {
                printSheet(sheetIndex);
                cardIndex = 1;
            }

            prep(item);
            make(cardIndex);
            cardIndex = cardIndex + 1;
        }
    }

    printSheet(sheetIndex);
    setup();
    prep(config.clean);
    alert("Creation complete");
}

function prep(item) {
    // TODO Loop through each of these and show/update the specified child layers.
    // text, locations, toggles
}

function updateText(loc, text) {
    // TODO
}

function updateIcon(loc, iconName) {
    // TODO
}

function updateToggle(toggleName) {
    // TODO
}

function setup() {
    copied_symbols.visible = true;
    text.visible = true;
    locations.visible = true;
    toggles.visible = true;

    // TODO Loop through each of these and hide the child layers.
    // text, locations, toggles

    // TODO Delete all teh child layers of copied_symbols

    symbols.visible = false;
    instructions = false;
}

function make(index) {
    var fileName = "tmp-" + index + ".jpg";

    cardPaths[index-1] = activeDocument.path.fullName + "/tmp/" + fileName;
    var fileRef = new File(cardPaths[index-1]);
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = 12;
    activeDocument.saveAs(fileRef, jpegOptions, true);
}

function printer(columns, rows, saveLocation) {
    return function(index) {
        app.preferences.rulerUnits = Units.INCHES;

        var sheetName = "sheet-" + index;
        var sheetWidth = columns * mainDocument.width.toString().replace(' inches', '');
        var sheetHeight = rows * mainDocument.height.toString().replace(' inches', '');
        var sheetDoc = app.documents.add(sheetWidth, sheetHeight, 300, sheetName, NewDocumentMode.RGB);

        app.preferences.rulerUnits = Units.PIXELS;
    
        for (var i = 0; i < cardsPerSheet; i++) {
            if (cardPaths.length > i) {
                var fileObj = File(cardPaths[i]);
                if (fileObj.exists) {
                    placeFile(fileObj);
                    fileObj.remove();
                    var newLayer = sheetDoc.layers["tmp-" + (i + 1)];
                    moveLayer(newLayer, i+1);
                }
            }
        }
    
        var fileRef = new File(saveLocation + "/" + sheetName + ".jpg");
        var jpegOptions = new JPEGSaveOptions();
        jpegOptions.quality = 12;
        sheetDoc.saveAs(fileRef, jpegOptions, true);
        sheetDoc.close(SaveOptions.DONOTSAVECHANGES);
        app.activeDocument = mainDocument;
    };
}

function initConfig(config) {
    if (!config) config = {};
    if (!config.folder) config.folder = activeDocument.path.fullName;
    if (!config.printColumns) config.columns = 1;
    if (!config.printColumns) config.rows = 1;
    if (!config.clean) config.clean = { };

    return config;
}