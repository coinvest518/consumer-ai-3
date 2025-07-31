import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;
const RENDER_API_URL = 'https://consumer-ai-render.onrender.com';

// Universal request logger middleware
app.use((req, res, next) => {
  console.log(`[PROXY] Received ${req.method} request for ${req.url}`);
  next();
});

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory if needed
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies (but not for file uploads)
app.use('/api/pdf-upload', (req, res, next) => {
  next();
});
app.use(express.json());

console.log('🚀 ConsumerAI API Proxy initializing...');
console.log('🔄 Forwarding all API requests to:', RENDER_API_URL);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running on port 3001' });
});

// PDF Upload endpoint
app.post('/api/pdf-upload', async (req, res) => {
  console.log('PDF upload request received');
  
  if (req.headers['content-type']?.includes('application/json')) {
    return res.json({ 
      success: false, 
      message: 'Test endpoint - send multipart/form-data with PDF file',
      received: req.body 
    });
  }

  try {
    const formidable = await import('formidable');
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const form = formidable.default({
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    let userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

    if (!file || !userId) {
      return res.status(400).json({ error: 'File and userId required' });
    }

    // Always use existing user UUID from Supabase dashboard for development
    userId = 'a10efa0d-2878-4e4c-b418-7f4720f6f2d6';
    console.log(`Using existing user UUID for development: ${userId}`);

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files supported' });
    }

    console.log(`Using user ID: ${userId}`);

    // Parse PDF
    const pdfBuffer = fs.readFileSync(file.filepath);
    const require = createRequire(import.meta.url);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('PDF parsing results:');
    console.log('- Pages:', pdfData.numpages);
    console.log('- Text length:', pdfData.text?.length || 0);
    
    // Handle PDFs with minimal text (likely scanned documents)
    const textContent = pdfData.text?.trim() || '';
    if (textContent.length < 10) {
      console.log('Attempting OCR processing for scanned PDF...');
      
      try {
        // Use Google Cloud Vision with service account
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
          keyFile: './google-service-account.json',
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const accessToken = await auth.getAccessToken();
        const visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate';
        
        // Check PDF size (Vision API has limits)
        const pdfSizeMB = pdfBuffer.length / (1024 * 1024);
        console.log(`PDF size: ${pdfSizeMB.toFixed(2)} MB`);
        
        if (pdfSizeMB > 20) {
          throw new Error('PDF too large for Vision API (>20MB)');
        }
        
        const requestBody = {
          requests: [{
            image: {
              content: pdfBuffer.toString('base64')
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              },
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }]
        };

        const visionResponse = await fetch(visionApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!visionResponse.ok) {
          const errorText = await visionResponse.text();
          console.log('Vision API error details:', errorText);
          throw new Error(`Vision API error: ${visionResponse.status} - ${errorText}`);
        }

        const visionData = await visionResponse.json();
        console.log('Vision API response:', JSON.stringify(visionData, null, 2));
        
        const ocrText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';
        console.log('OCR extracted', ocrText.length, 'characters');
        
        // Check for errors in the response
        if (visionData.responses?.[0]?.error) {
          console.log('Vision API error in response:', visionData.responses[0].error);
          throw new Error(`Vision API processing error: ${visionData.responses[0].error.message}`);
        }
        
        if (ocrText.length > 50) {
          const chunkSize = 1500;
          const chunks = [];
          for (let i = 0; i < ocrText.length; i += chunkSize) {
            chunks.push(ocrText.slice(i, i + chunkSize));
          }

          const processedDocs = [];
          for (let i = 0; i < chunks.length; i++) {
            const content = chunks[i];
            
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: content,
                model: 'text-embedding-ada-002',
              }),
            });
            
            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;
            
            const { data, error } = await supabase
              .from('document_embeddings')
              .insert({
                user_id: userId,
                content: content,
                embedding: embedding,
                metadata: {
                  filename: file.originalFilename,
                  chunk_index: i,
                  total_chunks: chunks.length,
                  ocr_processed: true,
                  pages: pdfData.numpages,
                },
              })
              .select()
              .single();

            if (error) throw error;
            processedDocs.push(data);
          }

          fs.unlinkSync(file.filepath);
          
          return res.json({
            success: true,
            message: `OCR processed ${chunks.length} chunks from ${pdfData.numpages}-page PDF`,
            docs: processedDocs,
          });
        }
      } catch (ocrError) {
        console.log('OCR failed, falling back to basic document entry:', ocrError.message);
      }
      
      // Fallback: Create a basic document entry for scanned PDFs
      const { data, error } = await supabase
        .from('document_embeddings')
        .insert({
          user_id: userId,
          content: `Scanned PDF Document: ${file.originalFilename} (${pdfData.numpages} pages). This appears to be an image-based PDF.`,
          embedding: null,
          metadata: {
            filename: file.originalFilename,
            pages: pdfData.numpages,
            type: 'scanned_pdf',
            pdf_info: pdfData.info,
            text_length: textContent.length,
          },
        })
        .select()
        .single();

      if (error) throw error;

      fs.unlinkSync(file.filepath);
      
      return res.json({
        success: true,
        message: `Stored scanned PDF: ${file.originalFilename}`,
        docs: [data],
      });
    }

    // Process text-based PDF
    const chunkSize = 1500;
    const chunks = [];
    for (let i = 0; i < textContent.length; i += chunkSize) {
      chunks.push(textContent.slice(i, i + chunkSize));
    }

    const processedDocs = [];
    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: content,
          model: 'text-embedding-ada-002',
        }),
      });
      
      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;
      
      const { data, error } = await supabase
        .from('document_embeddings')
        .insert({
          user_id: userId,
          content: content,
          embedding: embedding,
          metadata: {
            filename: file.originalFilename,
            chunk_index: i,
            total_chunks: chunks.length,
            pages: pdfData.numpages,
          },
        })
        .select()
        .single();

      if (error) throw error;
      processedDocs.push(data);
    }

    fs.unlinkSync(file.filepath);
    
    res.json({
      success: true,
      message: `Processed ${chunks.length} chunks from ${pdfData.numpages}-page PDF`,
      docs: processedDocs,
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF',
      details: error.message 
    });
  }
});

// Embed and store endpoint
app.post('/api/embed-and-store', async (req, res) => {
  const { docs, userId, fileName } = req.body;

  if (!docs || !userId || !fileName) {
    return res.status(400).json({ error: 'Missing required fields: docs, userId, fileName' });
  }

  try {
    const processedDocs = [];
    
    for (const doc of docs) {
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: doc.pageContent || doc.content,
          model: 'text-embedding-ada-002',
        }),
      });
      
      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;
      
      processedDocs.push({
        content: doc.pageContent || doc.content,
        embedding,
        metadata: {
          ...doc.metadata,
          userId,
          fileName,
        },
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Documents embedded successfully.',
      processedCount: processedDocs.length
    });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: 'Failed to embed documents.', details: error.message });
  }
});

app.post('/api/conversations', async (req, res) => {
  const { conversation_name, conversational_context, properties, persona_id, replica_id } = req.body;
  const apiKey = process.env.VITE_TAVUS_API_KEY;
  const apiUrl = process.env.VITE_TAVUS_API_URL;
  const personaId = persona_id || process.env.VITE_TAVUS_PERSONA_ID;
  const replicaId = replica_id || process.env.VITE_TAVUS_REPLICA_ID;

  try {
    const response = await fetch(`${apiUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name,
        conversational_context,
        properties,
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', async (req, res, next) => {
  if (req.path === '/pdf-upload' || req.path === '/embed-and-store' || req.path === '/conversations') {
    return next();
  }
  
  const targetUrl = `${RENDER_API_URL}${req.url}`;
  console.log(`[PROXY] Forwarding ${req.method} request to: ${targetUrl}`);

  try {
    const headers = {
      ...req.headers,
      'user-id': req.headers['user-id'] || '',
      'Authorization': req.headers['authorization'] || '',
    };
    delete headers['host'];

    const fetchOptions = {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body && typeof req.body === 'object' ? JSON.stringify(req.body) : req.body : undefined,
    };

    const response = await fetch(targetUrl, fetchOptions);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    res.status(response.status);
    const headersToForward = ['content-type', 'cache-control', 'etag'];
    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.set(header, value);
      }
    });
    res.send(data);
  } catch (error) {
    console.error(`[PROXY] Error forwarding request to ${targetUrl}:`, error);
    res.status(500).json({
      error: {
        message: 'Failed to forward request to Render API',
        details: error.message
      }
    });
  }
});

// Start HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  socket.on('join', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 API proxy + Socket.IO running on http://localhost:${PORT}`);
  console.log(`🔄 Forwarding all API requests to ${RENDER_API_URL}`);
});