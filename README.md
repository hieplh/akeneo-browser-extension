# akeneo-browser-extension
Tools on extension browser to support some features is not supported or hardly to use for Akeneo. For UI only

# Development
Using command: `npm run build` to compile and build typescript to javascript to folder dist

# Testing
Navigates to *Manage extensions* on browser then choose *Load unpacked* and locates to folder dist which has been created at Development step

Tested work on Microsoft Edge and Google Chrome

# Release
Using command: `npm run release` to compile, build and compress all files in dist folder to a file zip at folder release