import formidable from 'formidable';
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
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ message: 'Error parsing form data', error: err });
    }

    if (!files.image || files.image.length === 0) {
      return res.status(400).json({ message: 'No image file received' });
    }

    const inputImagePath = files.image[0].filepath;

    try {
      const buffer = await sharp(inputImagePath).resize(500).toBuffer();

      potrace.trace(buffer, {
        threshold: 140,
        turnPolicy: potrace.TURNPOLICY_MINORITY,
        turdSize: 2,
        alphaMax: 1.0,
        optCurve: true,
        optTolerance: 1.2,
      }, (err, svg) => {
        if (err) {
          console.error('Potrace error:', err);
          return res.status(500).json({ message: 'Error converting image to SVG', error: err });
        }
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.status(200).send(svg);  
      });
    } catch (sharpErr) {
      console.error('Sharp processing error:', sharpErr);
      res.status(500).json({ message: 'Error processing image with Sharp', error: sharpErr });
    }
  });
}
