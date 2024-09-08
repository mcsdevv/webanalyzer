import { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeWebsite } from '../../src/utils/analyzeWebsite';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      const result = await analyzeWebsite(url, { rejectUnauthorized: false });
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error analyzing website: ${req.body.url}`, error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}