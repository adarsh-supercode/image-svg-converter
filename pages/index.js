import { useState } from 'react';

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [svg, setSvg] = useState(null);  // To display the returned SVG
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload an image!");
      return;
    }

    setIsLoading(true);  // Set loading state to true

    const formData = new FormData();
    formData.append('image', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // Use the environment variable for API URL

    try {
      const response = await fetch(`${apiUrl}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSvg(data.path);  // Set the path of the SVG to be displayed
      } else {
        console.error('Error:', data.message);
        alert("Error converting image. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Error during request. Please try again.");
    } finally {
      setIsLoading(false);  // Set loading state to false after request completes
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Image to SVG Converter</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Converting...' : 'Convert to SVG'}
        </button>
      </form>

      {svg && (
        <div style={{ marginTop: '20px' }}>
          <h3>Converted SVG:</h3>
          <object type="image/svg+xml" data={svg} width="100%" height="400px"></object>
        </div>
      )}
    </div>
  );
}
