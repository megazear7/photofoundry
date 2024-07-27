var mainDocument = app.activeDocument;
var elements = activeDocument.layerSets["elements"];
var copiedElements = activeDocument.layerSets["copied_elements"];
var text = activeDocument.layerSets["text"];
var locations = activeDocument.layerSets["locations"];
var toggles = activeDocument.layerSets["toggles"];

Object.keys = objKeysPolyfill();

/**
 * 
 * @param array items An array of object, each object containing the following format:
 * {
 *   toggles: [ "string" ]
 *   text: {
 *     "loc_name": "text of the text block indicated by loc_name"
 *   },
 *   elements: {
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
 *  alert: If true the script will alert you of errors as it runs. The default is false.
 *  filetype: 'pdf' or 'jpg'. The default is 'jpg'.
 * }
 */
function photofoundry(items, config) {
    var mappedItems = [];
    var config = initConfig(items, config);
    var printSheet = printer(config.columns, config.rows, config.filetype, config.folder, config.deleteItems);
    var itemsPerSheet = config.columns * config.rows;
    var sheetIndex = 1;
    var cardPathIndex = 1;
    var cardPaths = [];

    for (var i = 0; i < items.length; i++) {
        mappedItems[i] = config.mapping(items[i]);
    }

    for (var i = 0; i < mappedItems.length; i++) {
        var item = mappedItems[i];
        if (item.print) {
            setup();

            if (itemsPerSheet > 1 && (cardPathIndex-1) >= itemsPerSheet) {
                printSheet(sheetIndex, cardPaths);
                sheetIndex = sheetIndex + 1;
                cardPathIndex = 1;
                cardPaths = [];
            }

            prep(item, config);
            cardPaths = make(cardPathIndex, cardPaths, config.folder);
            cardPathIndex = cardPathIndex + 1;
        }
    }

    if (itemsPerSheet > 1) {
        printSheet(sheetIndex, cardPaths);
    }

    setup();
    prep(config.clean, config);
    mainDocument.save();
    alert("Creation complete");
}

function prep(item, config) {
    forEach(item.text ? item.text : [], function(location, content) {
        updateText(location, content, config);
    });

    forEach(item.elements ? item.elements : [], function(location, iconName) {
        updateElement(location, iconName, config);
    });

    forEach(item.toggles ? item.toggles : [], function(toggleName) {
        updateToggle(toggleName, config);
    });
}

function updateText(location, content, config) {
    if (config.alert && ! doesLayerExist(text.layers, location)) {
        alert("No text found with name " + location);
    } else {
        var layer = text.layers[location];
        layer.visible = true;
        layer.textItem.contents = content;
    }
}

function updateElement(location, iconName, config) {
    if (config.alert && ! doesLayerExist(locations.layers, location)) {
        alert("No element found with name " + location);
    } else {
        copyToReference(iconName, locations.layers[location]);
    }
}

function updateToggle(location, config) {
    if (config.alert && ! doesLayerExist(toggles.layers, location)) {
        alert("No toggle found with name " + location);
    } else {
        var layer = toggles.layers[location];
        layer.visible = true;
    }
}

function setup() {
    copiedElements.visible = true;
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

    deleteLayers(copiedElements.layers);

    elements.visible = false;
}

function deleteLayers(layers) {
    // Cannto use the forEach method here because remove a layer messes up the indexing.
    var layersToRemove = [];
    for (var i = 0; i < layers.length; i++) {
        layersToRemove.push(layers[i]);
    }
    for (var i = 0; i < layersToRemove.length; i++) {
        layersToRemove[i].remove();
    }
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
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            func(keys[i], obj[keys[i]]);
        }
    }
}

function make(index, cardPaths, folder) {
    var fileName = "item-" + index;

    cardPaths[index-1] = mainDocument.path.fullName + "/" + (folder ? folder + "/" : "") + fileName + ".jpg";
    var fileRef = new File(cardPaths[index-1]);
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = 12;
    mainDocument.saveAs(fileRef, jpegOptions, true);

    return cardPaths;
}

function printer(columns, rows, filetype, folder, deleteItems) {
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
                    moveLayer(newLayer, i+1, columns);
                }
                if (deleteItems) {
                    fileObj.remove();
                }
            }
        }

        if (filetype === "pdf") {
            savePdf(sheetDoc, sheetName, folder);
        } else {
            saveJpg(sheetDoc, sheetName, folder);
        }
        app.activeDocument = mainDocument;
    };
}

function saveJpg(sheetDoc, sheetName, folder) {
    var fileRef = new File(mainDocument.path.fullName + "/" + (folder ? folder + "/" : "") + sheetName + ".jpg");
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = 12;
    sheetDoc.saveAs(fileRef, jpegOptions, true);
    sheetDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function savePdf(sheetName, folder) {
    var fileRef = new File(mainDocument.path.fullName + "/" + (folder ? folder + "/" : "") + sheetName + ".pdf");
    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = "Acrobat 5 (PDF 1.4)";
    pdfOptions.generateThumbnails = true;
    pdfOptions.preserveEditability = false;
    pdfOptions.preset = "[High Quality Print]";
    app.activeDocument.saveAs(fileRef, pdfOptions);
}

function copyToReference(elementName, locRef) {
    var elementRef = elements.layers[elementName];
    var copiedElement = elementRef.duplicate(copiedElements, ElementPlacement.PLACEATEND);
    groupLayer(copiedElement);
    var rasterizedElement = mergeGroup();
    resizeByRef(rasterizedElement, locRef);
    moveToReference(rasterizedElement, locRef);
    rasterizedElement.visible = true;
    locRef.visible = false;
}

function doesLayerExist(layers, name) {
    for (i=0; i<layers.length; i++) {
        if (layers[i].name==name) {
            return true;
        }
    }
    return false;
}

function groupLayer(layer){
    var oldActiveLayer = app.activeDocument.activeLayer;
    app.activeDocument.activeLayer = layer;
    var idGrp = stringIDToTypeID( "groupLayersEvent" );
    var descGrp = new ActionDescriptor();
    var refGrp = new ActionReference();
    refGrp.putEnumerated(charIDToTypeID( "Lyr " ),charIDToTypeID( "Ordn" ),charIDToTypeID( "Trgt" ));
    descGrp.putReference(charIDToTypeID( "null" ), refGrp );
    executeAction( idGrp, descGrp, DialogModes.NO );
    app.activeDocument.activeLayer = oldActiveLayer;
}

function moveToReference(copiedElement, locRef) {
    var refBounds = locRef.bounds;
    var copiedBounds = copiedElement.bounds;
    var elementRefWidth = refBounds[2] - refBounds[0];
    var elementRefHeight = refBounds[3] - refBounds[1];
    var copiedElementWidth = copiedBounds[2] - copiedBounds[0];
    var copiedElementHeight = copiedBounds[3] - copiedBounds[1];
    var xOffset = 0;
    var yOffset = 0;

    if (copiedElementWidth < elementRefWidth) {
        xOffset = (elementRefWidth - copiedElementWidth) / 2;
    }
    if (copiedElementHeight < elementRefHeight) {
        yOffset = (elementRefHeight - copiedElementHeight) / 2;
    }

    copiedElement.translate(refBounds[0] - copiedBounds[0] + xOffset, refBounds[1] - copiedBounds[1] + yOffset);
}

function resizeByRef(copiedElement, locRef) {
    var refBounds = locRef.bounds;
    var copiedBounds = copiedElement.bounds;
    var elementRefWidth = refBounds[2] - refBounds[0];
    var elementRefHeight = refBounds[3] - refBounds[1];
    var copiedElementWidth = copiedBounds[2] - copiedBounds[0];
    var copiedElementHeight = copiedBounds[3] - copiedBounds[1];
    var percentWidth = (elementRefWidth / copiedElementWidth) * 100;
    var percentHeight = (elementRefHeight / copiedElementHeight) * 100;
    var percentChange = percentWidth < percentHeight ? percentWidth : percentHeight;
    var startRulerUnits = app.preferences.rulerUnits;
    copiedElement.rasterize(RasterizeType.ENTIRELAYER);
    app.preferences.rulerUnits = Units.PERCENT;
    copiedElement.resize(percentChange, percentChange, AnchorPosition.MIDDLECENTER);
    app.preferences.rulerUnits = startRulerUnits;
}

function mergeGroup() {
    var newGroup = copiedElements.layerSets["Group 1"];
    newGroup.merge();
    var newLayer = copiedElements.layers["Group 1"];
    app.activeDocument.activeLayer = newLayer;
    newLayer.name = "merged_group";
    return newLayer;
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

function moveLayer(layer, cardPos, columns) {
    var position = layer.bounds;
    var cardXPos = (cardPos-1) % columns;
    var cardYPos = Math.floor((cardPos-1) / columns);
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

function initConfig(items, config) {
    if (!config) config = {};
    if (!config.folder) config.folder = undefined;
    if (!config.columns) config.columns = 1;
    if (!config.rows) config.rows = 1;
    if (!config.alert) config.alert = false;
    if (!config.deleteItems) config.deleteItems = false;
    if (!config.filetype) config.filetype = "jpg";

    if (!config.mapping) {
        config.mapping = function(item) {
            return item;
        };
    }

    if (config.clean) {
        config.clean = config.mapping(config.clean);
    } else if (!config.clean && items.length >= 1) {
        config.clean = config.mapping(items[0]);
    } else {
        config.clean = { };
    }

    return config;
}

// "Polyfill" Object.keys
function objKeysPolyfill() {
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
}

function times(count, card) {
    var cards = [];
    for (var i = 0; i < count; i++) {
        cards = cards.concat(card);
    }
    return cards;
}

function flatten(cardsToAdd) {
    var cards = [];

    for (var i = 0; i < cardsToAdd.length; i++) {
        if (cardsToAdd[i].length && cardsToAdd[i].length > 0) {
            for (var j = 0; j < cardsToAdd[i].length; j++) {
                cards = cards.concat(cardsToAdd[i][j]);
            }
        } else {
            cards = cards.concat(cardsToAdd[i]);
        }
    }

    return cards;
}
