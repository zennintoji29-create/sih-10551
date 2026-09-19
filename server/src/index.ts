import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', apiRouter);

// Root greeting
app.get('/', (_req, res) => {
  res.json({
    name: 'AegisRisk AI - Cyber Risk Quantification Engine',
    version: '2.4.0',
    status: 'ACTIVE',
    standards: ['OpenFAIR (ISO/IEC 27005)', 'Monte Carlo (10,000 runs)', 'SEC Rule 106', 'DORA']
  });
});

app.listen(PORT, () => {
  console.log(`[AegisRisk AI] Server running on http://localhost:${PORT}`);
  console.log(`[AegisRisk AI] OpenFAIR & Monte Carlo engine initialized.`);
});
