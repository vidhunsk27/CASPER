const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
    initializeApp({ credential: cert(serviceAccount) });
} catch (error) {
    console.error("Firebase config error.");
}

const db = getFirestore();

async function fetchPageHtml(targetUrl) {
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const response = await fetch(targetUrl, { headers });
    return await response.text();
}

app.get('/api/ping', (req, res) => res.status(200).send('OK'));

// --- TRANSACTIONS ---
app.get('/api/get-transactions', async (req, res) => {
    try {
        const snapshot = await db.collection('transactions').get();
        res.status(200).json(snapshot.docs.map(doc => doc.data()));
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/add-transaction', async (req, res) => {
    try {
        await db.collection('transactions').doc(String(req.body.id)).set(req.body);
        res.status(201).json({ message: 'Added' });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/delete-transaction/:id', async (req, res) => {
    try {
        await db.collection('transactions').doc(String(req.params.id)).delete();
        res.status(200).json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.put('/api/edit-transaction/:id', async (req, res) => {
    try {
        await db.collection('transactions').doc(String(req.params.id)).update(req.body);
        res.status(200).json({ message: 'Updated' });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// --- AI INTELLIGENCE ---
app.post('/api/jarvis-advice', async (req, res) => {
    try {
        const { transactions, monthlyBudget } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are C.A.S.P.E.R. Analyze these transactions: ${JSON.stringify(transactions)}. Budget: ₹${monthlyBudget}. Speak directly to Vidhun in a concise, cool tone. NO markdown formatting. 3 sentences max.`;
        const result = await model.generateContent(prompt);
        res.status(200).json({ advice: result.response.text() });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/jarvis-predict', async (req, res) => {
    try {
        const { currentMonthData, previousMonthData, currentBudget } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const prompt = `You are C.A.S.P.E.R. for Vidhun. Correlate Prev Month: ${JSON.stringify(previousMonthData)}, Current Month: ${JSON.stringify(currentMonthData)}, Budget: ₹${currentBudget}. Write a hyper-focused HTML forecast. Do NOT wrap in \`\`\`html. Use Tailwind classes.`;
        const result = await model.generateContent(prompt);
        res.status(200).json({ report: result.response.text().replace(/```html/gi, '').replace(/```/g, '').trim() });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/jarvis-report', async (req, res) => {
    try {
        const { compiledMonths, monthlyBudget, selectedMonth } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are C.A.S.P.E.R. for Vidhun. Data: ${JSON.stringify(compiledMonths)}. Selected: ${selectedMonth}. Budget: ₹${monthlyBudget}. Create HTML financial report without \`\`\`html wrapper.`;
        const result = await model.generateContent(prompt);
        res.status(200).json({ report: result.response.text().replace(/```html/gi, '').replace(/```/g, '').trim() });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// --- WORKSPACE & WISHLIST SCRAPERS ---
app.post('/api/save-workspace', async (req, res) => {
    try { await db.collection('settings').doc('workspaceData').set(req.body); res.status(200).json({ message: 'Saved' }); } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.get('/api/get-workspace', async (req, res) => {
    try { const doc = await db.collection('settings').doc('workspaceData').get(); res.status(200).json(doc.exists ? doc.data() : { notes: '', whiteboard: '' }); } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/receipt-ocr', upload.single('receipt'), async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const receiptImageBufferPart = { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } };
        const prompt = `Extract Grand Total amount paid. Return strictly JSON: { "total": number }.`;
        const result = await model.generateContent([prompt, receiptImageBufferPart]);
        let cleanText = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
        res.status(200).json(JSON.parse(cleanText));
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));