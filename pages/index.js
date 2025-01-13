import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [svgPath, setSvgPath] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('SVG created successfully!');
        setSvgPath(result.path); // Display the SVG path for download
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setMessage('An error occurred.');
    }
  };

  return (
    <div>
      <h1>Image to SVG Converter</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="file" name="image" accept="image/*" required />
        <button type="submit">Convert</button>
      </form>
      {message && <p>{message}</p>}
      {svgPath && (
        <p>
          <a href={svgPath} download="output.svg">Download SVG</a>
        </p>
        
      )}
    </div>
  );
}
