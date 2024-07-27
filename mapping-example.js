// Import photofoundry
$.evalFile(activeDocument.path.fullName + "/photofoundry.js");

// Create the images
photofoundry(data(), {
    columns: 2,
    rows: 1,
    clean: data()[0],
    mapping: mapping
})

// Define your JSON data
function data() {
    return flatten([
        times(1, {
            "title": "First",
            "desc": "This is a short description",
            "type": "A",
            "mods": [ "wood", "wood" ],
            "print": true
        }),
        times(1, {
            "title": "Second",
            "desc": "This is a long description that will use a different text element",
            "type": "B",
            "mods": [ "wealth" ],
            "print": true
        })
    ]);
}

function mapping(item) {
    var newItem = {
        toggles: [],
        text: {
            title: item.title ? item.title : ""
        },
        elements: {
        },
        print: !! item.print
    };

    if (item.desc && item.desc.length > 30) {
        newItem.text.long_desc = item.desc;
    } else if (item.desc) {
        newItem.text.short_desc = item.desc;
    }

    if (item.mods && item.mods.length === 1) {
        newItem.elements.mod_1_1 = item.mods[0];
    } else if (item.mods && item.mods.length === 2) {
        newItem.elements.mod_2_1 = item.mods[0];
        newItem.elements.mod_2_2 = item.mods[1];
    }

    if (item.type === "A") {
        newItem.toggles.push("parchment");
        newItem.toggles.push("stone_circle_left");
        newItem.toggles.push("stone_circle_right");
        newItem.toggles.push("title_background");
        newItem.toggles.push("pink_flowers");
        newItem.text.sub_title = "Type A";
    } else if (item.type === "B") {
        newItem.toggles.push("parchment");
        newItem.toggles.push("green_fields");
        newItem.text.sub_title = "Type B";
    }

    return newItem;
}
