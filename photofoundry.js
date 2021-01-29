var mainDocument = app.activeDocument;
var symbols = activeDocument.layerSets["symbols"];
var copiedSymbols = activeDocument.layerSets["copied_symbols"];
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
    }, {
        toggles: [ ],
        text: {
            "title": "Hello world 2"
        },
        icons: {
            "": ""
        },
        print: true
    }
], {
    rows: 1,
    columns: 2
});

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
    var cardPathIndex = 1;
    var cardPaths = [];

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.print) {
            setup();

            if (itemsPerSheet > 1 && (cardIndex-1) >= itemsPerSheet) {
                printSheet(sheetIndex, cardPaths);
                sheetIndex = sheetIndex + 1;
                cardPathIndex = 1;
            }

            prep(item);
            cardPaths = make(cardPathIndex, cardPaths);
            cardIndex = cardIndex + 1;
            cardPathIndex = cardPathIndex + 1;
        }
    }

    if (itemsPerSheet > 1) {
        printSheet(sheetIndex, cardPaths);
    }
    setup();
    prep(config.clean);
    alert("Creation complete");
}

function prep(item) {
    forEach(item.text ? item.text : [], function(location, content) {
        updateText(location, content);
    });

    forEach(item.icon ? item.icon : [], function(location, iconName) {
        updateIcon(location, iconName);
    });

    forEach(item.toggles ? item.toggles : [], function(toggleName) {
        updateToggle(toggleName);
    });
}

function updateText(location, text) {
    // TODO
}

function updateIcon(location, iconName) {
    // TODO
}

function updateToggle(toggleName) {
    // TODO
}

function setup() {
    copiedSymbols.visible = true;
    text.visible = true;
    locations.visible = true;
    toggles.visible = true;

    hideLayers(text.layers);
    hideLayers(locations.layers);
    hideLayers(toggles.layers);

    for (var i = 0; i < text.layers.length; i++) {
        var layer = text.layers[i];
        layer.visible = false;
    }

    deleteLayers(copiedSymbols.layers);

    symbols.visible = false;
    instructions = false;
}

function deleteLayers(layers) {
    forEach(layers, function(layer) {
        layer.remove();
    });
}

function hideLayers(layers) {
    forEach(layers, function(layer) {
        layer.visible = false;
    });
}

function forEach(obj, func) {
    if (obj.length === 0 || obj.length) {
        for (var i = 0; i < obj.length; i++) {
            func(obj[i]);
        }
    } else {
        var keys = keysOfObject(obj);

        for (var i = 0; i < keys.length; i++) {
            func(keys[i], obj[keys[i]]);
        }
    }
}

function make(index, cardPaths) {
    var fileName = "item-" + index;

    cardPaths[index-1] = mainDocument.path.fullName + "/" + fileName + ".jpg";
    var fileRef = new File(cardPaths[index-1]);
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = 12;
    mainDocument.saveAs(fileRef, jpegOptions, true);

    return cardPaths;
}

function printer(columns, rows) {
    return function(index, cardPaths) {
        app.preferences.rulerUnits = Units.INCHES;

        var sheetName = "sheet-" + index;
        var sheetWidth = columns * mainDocument.width.toString().replace(' inches', '');
        var sheetHeight = rows * mainDocument.height.toString().replace(' inches', '');
        var sheetDoc = app.documents.add(sheetWidth, sheetHeight, 300, sheetName, NewDocumentMode.RGB);

        app.preferences.rulerUnits = Units.PIXELS;
    
        for (var i = 0; i < columns * rows; i++) {
            if (cardPaths.length > i) {
                var fileObj = File(cardPaths[i]);
                if (fileObj.exists) {
                    placeFile(fileObj);
                    var newLayer = sheetDoc.layers["item-" + (i + 1)];
                    moveLayer(newLayer, i+1);
                }
            }
        }

        fileRef = new File(mainDocument.path.fullName + "/" + sheetName + ".jpg");
        var jpegOptions = new JPEGSaveOptions();
        jpegOptions.quality = 12;
        sheetDoc.saveAs(fileRef, jpegOptions, true);
        sheetDoc.close(SaveOptions.DONOTSAVECHANGES);
        app.activeDocument = mainDocument;
    };
}

function placeFile(file) {
    var desc21 = new ActionDescriptor();
    desc21.putPath( charIDToTypeID('null'), new File(file) );
    desc21.putEnumerated( charIDToTypeID('FTcs'), charIDToTypeID('QCSt'), charIDToTypeID('Qcsa') );
    var desc22 = new ActionDescriptor();
    desc22.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), 0.000000 );
    desc22.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), 0.000000 );
    desc21.putObject( charIDToTypeID('Ofst'), charIDToTypeID('Ofst'), desc22 );
    executeAction( charIDToTypeID('Plc '), desc21, DialogModes.NO );
}

function moveLayer(layer, cardPos) {
    var position = layer.bounds;
    var cardXPos = (cardPos-1) % 4;
    var cardYPos = Math.floor((cardPos-1) / 4);
    var width = (position[2].value) - (position[0].value);
    var height = (position[3].value) - (position[1].value);
    var moveX = cardXPos * width;
    var moveY = cardYPos * height;
    moveLayerTo(layer, moveX , moveY);
}

function moveLayerTo(fLayer,fX,fY) {
    var position = fLayer.bounds;
    position[0] = fX - position[0];
    position[1] = fY - position[1];
    fLayer.translate(-position[0],-position[1]);
}

function initConfig(config) {
    if (!config) config = {};
    if (!config.folder) config.folder = activeDocument.path.fullName;
    if (!config.columns) config.columns = 1;
    if (!config.rows) config.rows = 1;
    if (!config.clean) config.clean = { };

    return config;
}

// "Polyfill" Object.keys
function keysOfObject() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({
            toString: null
        }).propertyIsEnumerable('toString'),

        dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        dontEnumsLength = dontEnums.length;
    return function(obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
            throw new TypeError('Object.keys called on non-object');
        }
        var result = [],
            prop, i;
        for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
        }
        if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums)) {
                    result.push(dontEnums);
                }
            }
        }
        return result;
    };
};