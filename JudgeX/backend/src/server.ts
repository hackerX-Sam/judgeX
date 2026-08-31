import 'dotenv/config';
import app from './app';
import { intelligenceWorker } from './queue/intelligence.queue';

// Keep a reference so it doesn't get garbage collected, though BullMQ handles it
console.log(`Intelligence Worker initialized: ${intelligenceWorker.name}`);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
