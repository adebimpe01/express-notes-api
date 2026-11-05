const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

let notes = [
  { id: 1, title: 'First note', content: 'Hello Express' },
  { id: 2, title: 'Second note', content: 'Hello Express' },
  { id: 3, title: 'Third note', content: 'Hello Express' }
];
let nextId = 4;

// Get all notes
app.get('/notes', (req, res) => {
  res.json(notes);
});

// Get one note
app.get('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});


app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const note = { id: nextId++, title, content: content || '' };
  notes.push(note);
  res.status(201).json(note);
});

// Update a note
app.put('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });

  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  note.title = title;
  note.content = content || '';
  res.json(note);
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });

  notes = notes.filter(n => n.id !== Number(req.params.id));
  res.json({ message: 'Note deleted' });
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
