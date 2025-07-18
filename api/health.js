// Simple health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is running (proxied to Render)',
    timestamp: new Date().toISOString()
  });
}