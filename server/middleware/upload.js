
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      "Only JPG, PNG, WEBP and AVIF images are allowed."
    );

    error.status = 400;
    return callback(error);
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 12,
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadProductImages = (req, res, next) => {
  upload.array("images", 12)(req, res, (error) => {
    if (error) {
      error.status = 400;
      return next(error);
    }

    try {
      const existingImages =
        req.body.existingImages ?? req.body.images;

      if (existingImages !== undefined) {
        const parsed =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;

        if (!Array.isArray(parsed)) {
          throw new Error(
            "Existing images must be an array."
          );
        }

        req.body.images = parsed;
      }

      // Do not assign an empty array here.
      // The controller will preserve existing database images.

      next();
    } catch (parseError) {
      parseError.status = 400;
      parseError.message =
        "Invalid existing images data. Send a JSON array of image URLs.";

      next(parseError);
    }
  });
};

module.exports = uploadProductImages;
