// Import photofoundry. Since this is a Photoshop script, we have to use old school JS methods of importing scripts.
$.evalFile(activeDocument.path.fullName + "/photofoundry.js");

// Create the images
photofoundry(data(), {
    columns: 2,
    rows: 2,
    clean: data()[0] // This will reset the PSD file based on the first image specified in the JSON.
})

// Define your JSON data.
function data() {
    return flatten([
        times(1, {
            toggles: [ "small_lower_parchment", "stone_circle_left", "stone_circle_right", "title_background", "green_fields" ],
            text: {
                "title": "Hello world",
                "desc": "Lorem ipsum dolor sit amet, consectetur."
            },
            elements: {
            },
            print: true
        }),
        times(1, {
            toggles: [ "parchment", "stone_circle_left", "stone_circle_right", "title_background", "pink_flowers" ],
            text: {
                "title": "Hello world",
                "sub_title": "We are working",
                "desc": "Lorem ipsum dolor sit amet, consectetur."
            },
            elements: {
                "mod_2_1": "wealth",
                "mod_2_2": "victory_point",
            },
            print: true
        }),
        times(2, {
            toggles: [ "small_upper_parchment", "pink_flowers" ],
            text: {
            },
            elements: {
                "mod_3_1": "food",
                "mod_3_2": "wood",
                "mod_3_3": "iron"
            },
            print: true
        })
    ]));
}
