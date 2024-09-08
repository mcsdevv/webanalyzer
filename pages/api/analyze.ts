import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeWebsite } from '../../src/utils/analyzeWebsite';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the request method and body for debugging
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      const result = await analyzeWebsite(url, { rejectUnauthorized: false });
      return res.status(200).json(result);
    } catch (error) {
      console.error(`Error analyzing website:`, error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  } else if (req.method === 'GET') {
    // Handle GET requests for testing
    return res.status(200).json({ message: 'GET request received' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}