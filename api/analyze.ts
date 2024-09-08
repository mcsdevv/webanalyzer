const { analyzeWebsite } = require('../src/utils/analyzeWebsite');

module.exports = async (req, res) => {
  console.log('Request received:', req.method, req.url);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      if (!url) {
        console.log('Error: URL is required');
        return res.status(400).json({ error: 'URL is required' });
      }
      console.log('Analyzing URL:', url);
      const result = await analyzeWebsite(url, { rejectUnauthorized: false });
      console.log('Analysis result:', result);
      return res.status(200).json(result);
    } catch (error) {
      console.error(`Error analyzing website:`, error);
      return res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
  } else {
    console.log(`Method ${req.method} not allowed`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};