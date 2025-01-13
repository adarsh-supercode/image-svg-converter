import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import potrace from 'potrace';
import sharp from 'sharp';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data', error: err });
    }

    const inputImagePath = files.image[0].filepath; // Assuming single file upload
    const outputSvgPath = path.join(process.cwd(), 'public', 'output.svg'); // Save in the 'public' folder

    sharp(inputImagePath)
      .resize(500) // Resize image to a smaller size before processing
      .toBuffer()
      .then((buffer) => {
        potrace.trace(buffer, {
          threshold: 128,
          turnPolicy: potrace.TURNPOLICY_MINORITY,
          turdSize: 2,
          alphaMax: 1.0,
          optCurve: true,
          optTolerance: 0.2,
        }, (err, svg) => {
          if (err) {
            return res.status(500).json({ message: 'Error converting image', error: err });
          }
          fs.writeFileSync(outputSvgPath, svg);
          res.status(200).json({ message: 'SVG created', path: '/output.svg' });
        });
      })
      .catch((err) => {
        res.status(500).json({ message: 'Error processing image', error: err });
      });
  });
}
