import formidable from 'formidable';
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
      // Convert the image to a raw pixel buffer
      const { data, info } = await sharp(inputImagePath)
        .raw()
        .ensureAlpha() 
        .toBuffer({ resolveWithObject: true });

      const { width, height } = info;

      // Generate SVG
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">\n`;

      // Loop through pixels and create <rect> for each
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4; // RGBA channels
          const [r, g, b, a] = data.slice(idx, idx + 4);

          // Skip fully transparent pixels
          if (a === 0) continue;

          // Convert RGBA to hex
          const color = `rgba(${r},${g},${b},${a / 255})`;

          // Add a rectangle for this pixel
          svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />\n`;
        }
      }

      svg += `</svg>`;

      // Send the generated SVG
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(svg);
    } catch (err) {
      console.error('Error processing image:', err);
      res.status(500).json({ message: 'Error processing image', error: err });
    }
  });
}
