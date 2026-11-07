const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL || '').split(','),
]
  .map(url => url.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Middleware
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
}
app.use(logger);


function validateNote(req, res, next) {
  const { title, content } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  req.body = {
    title: title.trim(),
    content: typeof content === 'string' ? content : '',
  };
  next();
}


function findNote(req, res, next) {
  const note = notes.find(
    n => n.id === Number(req.params.id)
  );

  if (!note) {
    return res.status(404).json({
      error: "Note not found"
    });
  }

  req.note = note;

  next();
}

// Data
let notes = [
  { id: 1, title: 'First note', content: 'Hello Express' },
  { id: 2, title: 'Second note', content: 'Hello Express' },
  { id: 3, title: 'Third note', content: 'Hello Express' }
];
let nextId = 4;

// Routes
app.get('/notes', (req, res) => {
  res.json(notes);
});

app.post('/notes', validateNote, (req, res) => {
  const { title, content } = req.body;
  const note = { id: nextId++, title, content };
  notes.push(note);
  res.status(201).json(note);
});

app.get('/notes/:id', findNote, (req, res) => {
  res.json(req.note);
});

app.put('/notes/:id', findNote, validateNote, (req, res) => {
  req.note.title = req.body.title;
  req.note.content = req.body.content;
  res.json(req.note);
});

app.delete('/notes/:id', findNote, (req, res) => {
  notes = notes.filter(n => n.id !== req.note.id);
  res.json({ message: 'Note deleted' });
});

// 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler (always last)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Something went wrong' : err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
}); 