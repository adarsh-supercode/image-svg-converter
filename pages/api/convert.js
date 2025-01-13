import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import potrace from 'potrace';
import sharp from 'sharp';

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
      console.error('Form parse error:', err);  // Log error
      return res.status(500).json({ message: 'Error parsing form data', error: err });
    }

    console.log('Received files:', files);  // Log received files

    if (!files.image || files.image.length === 0) {
      return res.status(400).json({ message: 'No image file received' });
    }

    const inputImagePath = files.image[0].filepath;
    const outputSvgPath = path.join(process.cwd(), 'public', 'output.svg');

    sharp(inputImagePath)
      .resize(500)  // Resize the image to ensure consistent output
      .toBuffer()
      .then((buffer) => {
        potrace.trace(buffer, {
          threshold: 140,
          turnPolicy: potrace.TURNPOLICY_MINORITY,
          turdSize: 2,
          alphaMax: 1.0,
          optCurve: true,
          optTolerance: 1.2,
        }, (err, svg) => {
          if (err) {
            console.error('Potrace error:', err);  // Log potrace error
            return res.status(500).json({ message: 'Error converting image to SVG', error: err });
          }

          fs.writeFileSync(outputSvgPath, svg);  // Save the SVG file
          res.status(200).json({ message: 'SVG created', path: '/output.svg' });
        });
      })
      .catch((err) => {
        console.error('Sharp processing error:', err);  // Log sharp error
        res.status(500).json({ message: 'Error processing image with Sharp', error: err });
      });
  });
}
