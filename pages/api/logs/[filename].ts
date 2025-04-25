import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (typeof filename !== 'string') {
    return res.status(400).send('Invalid filename');
  }

  const filePath = path.join(process.cwd(), 'logs', filename);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return res.status(404).send('Log file not found');
    }

    // Remove non-ASCII characters
    const filteredData = removeNonAsciiCharacters(data);

    // Send the modified content as a plain text response
    res.setHeader('Content-Type', 'text/plain');
    res.send(filteredData);
  });
}

function removeNonAsciiCharacters(data: string): string {
  return data.replace(
    /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]+/g,
    '',
  );
}
