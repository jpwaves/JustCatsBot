// Importing modules
const fs = require('fs');
const path = require('path');
const mv = require('mv');

// Constants
const primaryImgPath = './images';

const Helpers = {
};

// Gets an array of the file names of all the images in the 'ready to send' folder
Helpers.pullImgFileNames = function(targetFolderName) {
	const imgFolderPath = path.join(primaryImgPath, targetFolderName);
	const imgFileNames = fs.readdirSync(imgFolderPath);

	// For troubleshooting purposes:
	// console.log(`File names in ${targetFolderName} folder: ${imgFileNames}`);

	return imgFileNames;
};

// Pulls random file name from array of file names generated from pullImgFileNames()
Helpers.selectRandImg = function(arrImgs) {
	const numOfImgs = arrImgs.length;
	const randIdx = Math.floor(Math.random() * numOfImgs);
	const selectedImgFileName = arrImgs[randIdx];

	// For troubleshooting purposes:
	console.log(`Selected file name: ${selectedImgFileName}`);

	return selectedImgFileName;
};

// Given an image file name, moves that image from the 'ready to send' folder to the 'sent' folder
Helpers.moveImg = function(fileName, srcDir, targetDir) {
	const currentPath = path.join(primaryImgPath, srcDir, fileName);
	const destinationPath = path.join(primaryImgPath, targetDir, fileName);

	mv(currentPath, destinationPath, function(err) {
		if (err) {
			console.log(err);
			throw err;
		}
		else {
			console.log(`Succesfully moved ${fileName} from ${path.join(primaryImgPath, srcDir)} to ${path.join(primaryImgPath, targetDir)}`);
		}
	});
};

// Moves all the images in the 'sent' folder back to the 'ready to send' folder to reset all images to be available to be sent again
Helpers.resetAllImgs = function() {
	const sentImgFolderPath = path.join(primaryImgPath, 'sent');
	const sentImgs = fs.readdirSync(sentImgFolderPath);
	sentImgs.forEach(img => {
		try {
			const currDir = 'sent';
			const destinationDir = 'ready to send';
			this.moveImg(img, currDir, destinationDir);
		}
		catch(error) {
			console.log(error);
		}
	});
};

// Exporting Helper object with all helper methods
module.exports = Helpers;