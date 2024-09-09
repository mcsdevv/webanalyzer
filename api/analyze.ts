import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeWebsite } from '../src/utils/analyzeWebsite';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST request
  if (req.method === 'POST') {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    console.log('Analyzing URL:', url);
    let result;
    try {
      result = await analyzeWebsite(url, { rejectUnauthorized: false });
      console.log('Analysis result:', result);
    } catch (analysisError: any) {
      console.error('Error analyzing website:', analysisError);
      throw new Error(`Error analyzing website: ${analysisError.message}`);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  }
  

  // Handle unsupported HTTP methods
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}