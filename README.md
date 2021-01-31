# Photofoundry
With Photofoundry you can use build images from JSON. It is a Photoshop script that requires a specifically formatted Photoshop file. This script is provided with an array of JSON data that manipualtes that file and saves an image for each item in the array.

### Use case
Photofoundry is great when you need lots of slight variations to the same basic template. My original use case for building this tool was to create cards for a game. I needed to be able to create hundreds of cards with slight variations. I also needed to be able to quickly make changes to lots of cards, and then reprint the new versions. This automates all of that otherwise tedius work.

### Limitations
Some limitations of Photofoundry are that it only saves to JPG (although this could be easily enhanced) and that the template file must be of a certain size. Each image it produces will have the same dimensions.

### The provided template
It comes with a Photoshop template to start from. If you open the `template.psd` file and run the `example.js` script, it will generate the following files:

* item-1.jpg
* item-2.jpg
* item-3.jpg
* item-4.jpg
* sheet-1.jpg

The first four files represent the three items from the JSON array. The fourth file is the same three images combined into a "sheet". By default the script will not produce sheets, but can be configured to combine the images into sheets with how many columns and rows you want. One reason to do this would be to combine your images into printable sheets so that you could then cut out the each image.

## Getting started
To get started read this README thoroughly. Then look at the provided PSD template and the example.js file. Once you understand what is going on, start updating the JSON in the `data` method, using the different features of Photofoundry to generate new images. When you are ready, you can resize the template PSD file to be the dimensions you need, and you can start adding your own elements, text, and toggles. Finally, you can write your own JSON in the example.js file to generate your images.

## How to use Photofoundry
To use Photofoundry, you first need to update the provided template PSD file. In this file you will see the following folders:

- elements
- copied_elements
- text
- locations
- toggles

### Elements
The elements folder contains a set of layers that the script can automatically copy, move, and resize. Think of these as the primary "pieces" that the script will put together in order to make your image. You could put in here icons, banners, images, etc. These layers should be large. Since the script will resize them, they should be larger that their final size.

### Copied elements
This folder is for the script to place the temporary layers that it creates based on your JSON (which will be explained more below). You can leave this alone for now.

### Text
This folder contains text areas that you want the script to have access to. Each text area needs a predefined area, font size, and text effects. The script will be able to update the text based on the provided JSON. The name of each layer is how the script will know which layer to update. Any layer that is not provided a string in the JSON will be hidden.

### Locations
This folder contains layers that represent locations on the file that the elements will get copied to. The element will be resized to fit into the location (while maintaining the aspect ratio of the original element).

### Toggles
This folder is the most simple. This is just a set of layers that the JSON can hide and show.

### Crafting JSON to create images
Now that you know what the different pieces of the PSD file are for and how to update them for your purpose, let's look at actually using it to generate some images. Let's take a sample JSON:

```
{
    toggles: [ "green_fields" ],
    text: {
        "title": "Hello world"
    },
    elements: {
        "mod_2_1": "wealth"
    },
    print: true
}
```

Let's look at each of these in turn. Starting with the toggles, which are the easiest to understand. `toggles: [ "green_fields" ]` will simply look for the `green_fields` layer under the `toggles` folder and reveal that layer. All the other layers under the `toggles` folder will be automatically hidden.

The `text: { "title": "Hello world" }` is also quite simple. This will look for the `title` layer under the `text` folder, reveal that layer and update the text to be `Hello world`. All the other layers under the `text` folder will be hidden.

The `elements: { "mod_2_1": "wealth" }` is a bit more complicated. It will look for the `wealth` layer under the `elements` folder and copy it into the `copied_elementes` folder. This new copied layer will be rasterized. Then it will be resized to fit into the size of the dimensions of the `mod_1_1` layer, which was found under the `locations` folder. Finally, it moves the copied layer to be centered with respect to the `mod_1_1` layer. The layers under `locations` and `elements` are never shown. Only the layers under `copied_elements` are shown, which are then removed after the script is done.

Finally, the `print: true` just tells the script to print this item of the JSON array. This is helpful to turn on and off the various items in the JSON array without having to delete the JSON. In this example only one toggle, text, and element was shown, but it could contain much more.

### Configuration
The first parameter to the `photofoundry` method is the array of JSON objects that you want to generate images for. The second parameter to the `photofoundry` method is a configuration with the following properties:

 *  folder: The folder path that you want to save the files to. Default is the location of the photoshop files.
 *  columns: If you want to combine the items into "sheets" this is the number of columns per sheet. Default is 1.
 *  rows: If you want to combine the items into "sheets" this is the number of rows per sheet. Default is 1.
 *  clean: A default item to 'reset' the photoshop file to. This object should be configured as described in the 'items' parameter.
 *  alert: If true the script will alert you of errors as it runs. The default is false.

### Mapping
TODO

### Provided helpers
Photofoundry provides two methods to make creating the JSON easier. The first is the `times` method which will make an array of the JSON objects that you provide to the method. This allows you to create multiple copies of the same image. The `flatten` method flattens nested arrays before passing it to Photofoundry.

### File placement
The PSD file your JS file that you run, and the photofoundry.js file need to be in the same directory, which is the default setup. The images it generates will be created in the same directory. This git project has item- and sheet- files ignored so that the images you generate do not get added to git.

## The power is yours
This tool is incredible flexible and powerful. The text and toggles are one thing, but the flexibility of the element / location system is truly powerful. It is incredible easy to update the PSD file by replacing a few of the elements with new versions or changing their layer effects, and then rebuilding hundreds of cards automatically with the new layer effects applied to every use of that element on every image.

On the other side, it is super quick to update the JSON with new locations, elements, text, and toggles, adding, removing, and chaning items in the JSON array, and then generate new versions of the images. This can be an iterative process, allowing you to see the end result, and then go back and tweak the JSON again until the images are what you want.
