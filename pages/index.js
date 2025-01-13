import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [svgPath, setSvgPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected File:', selectedFile);
    setFile(selectedFile);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!file) {
      alert('Please select a file');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', file);
  
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/convert`, {
        method: 'POST',
        body: formData,
      });
  
      // Log response status and body
      console.log('Response Status:', response.status);
      const data = await response.json();
      console.log('Response Data:', data);
  
      if (!response.ok) {
        // Log error details for better debugging
        throw new Error(`Error creating SVG: ${data.message || response.statusText}`);
      }
  
      if (data.path) {
        setSvgPath(data.path);
      } else {
        setError('Unexpected response from the server.');
      }
    } catch (err) {
      console.error('Error in fetch request:', err);
      setError('Error uploading the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = () => {
    window.location.reload()  };


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
          <a href={svgPath} download="output.svg" onClick={handleDownload}>
            Download SVG
          </a>
          <br />
          <img src={svgPath} alt="Converted SVG" />
        </div>
      )}
    </div>
  );
}
