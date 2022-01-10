const ImagePreview = require('../dist/img-previewer')
try {
    new ImagePreview('body')
} catch (error) {
    if (error instanceof Error) {
        console.log(error);
    }
}