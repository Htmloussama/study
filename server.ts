import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// API Routes
app.post('/api/process', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Simulate creating the output file
    const outputPath = path.join(__dirname, 'guided_writing_bac_sciences.pdf');
    if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, 'DUMMY PDF CONTENT');
    }
    
    res.json({
        message: 'PDF received. Ready for processing.',
        filename: req.file.originalname,
        task: 'BAC English Writing Section Extraction'
    });
});

app.get('/api/download', (req, res) => {
    const filePath = path.join(__dirname, 'guided_writing_bac_sciences.pdf');
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', 'attachment; filename="guided_writing_bac_sciences.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
        // If it's a real PDF we'd pipe it
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Vite Middleware
if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    });
    app.use(vite.middlewares);
} else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
