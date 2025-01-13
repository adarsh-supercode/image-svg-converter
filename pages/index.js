import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [svgPath, setSvgPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('image', file); // Append the image file to the form data

    setLoading(true); // Show loading state
    setError(''); // Reset error state

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error creating SVG');
      }

      const data = await response.json();
      if (data.path) {
        setSvgPath(data.path); // Set the path to the SVG
      }
    } catch (err) {
      setError('Error uploading the image. Please try again.');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div>
      <h1>Image to SVG Converter</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Converting...' : 'Convert to SVG'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {svgPath && (
        <div>
          <h3>SVG Created!</h3>
          <a href={svgPath} download="output.svg">
            Download SVG
          </a>
          <br />
          <img src={svgPath} alt="Converted SVG" />
        </div>
      )}
    </div>
  );
}
