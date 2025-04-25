// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Connect to SQLite database
const db = new sqlite3.Database("todos.db", (err) => {
  if (err) {
    return console.error("Error opening database:", err.message);
  }
  console.log("Connected to the Todo database.");
});

// Create the todos table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT DEFAULT 'low',
    isComplete TEXT DEFAULT 'false',
    isFun TEXT DEFAULT 'true'
  )
`, (err) => {
  if (err) {
    return console.error("Error creating table:", err.message);
  }
  console.log("Todos table ensured.");
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET all todos
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(rows);
  });
});

// GET a specific todo by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (!row) return res.status(404).json({ message: 'Todo item not found' });
    res.json(row);
  });
});

// POST a new todo
app.post('/todos', (req, res) => {
  const { name, priority = 'low', isFun = 'true', isComplete = 'false'} = req.body;

  db.run(
    'INSERT INTO todos (name, priority, isFun, isComplete) VALUES (?, ?, ?, ?)',
    [name, priority, isFun, isComplete],
    function (err) {
      if (err) return res.status(500).json({ message: 'Insert failed', error: err });

      db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ message: 'Retrieval failed', error: err });
        res.status(201).json(row);
      });
    }
  );
});

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ message: 'Delete failed', error: err });

    if (this.changes > 0) {
      res.json({ message: `Todo item ${id} deleted.` });
    } else {
      res.status(404).json({ message: 'Todo item not found' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



// // server.js
// // A simple Express.js backend for a Todo list API

// const express = require('express');
// const path = require('path')
// const app = express();
// const PORT = 3000;

// // Middleware to parse JSON requests
// app.use(express.json());

// // TODO ➡️  Middleware to inlcude static content from 'public' folder
// // app.use(express.static('public')) // <- this works too
// app.use(express.static(path.join(__dirname,'public'))) // const forget the const

// // In-memory array to store todo items
// let todos = [];
// let nextId = 1;

// // TODO ➡️ serve index.html from 'public' at the '/' path
// app.get('/', (req,res) => {
//     res.sendFile('index.html')
// })


// // TODO ➡️ GET all todo items at the '/todos' path
// app.get('/todos', (req,res) => {
//     res.json(todos);
// })



// // GET a specific todo item by ID
// app.get('/todos/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   const todo = todos.find(item => item.id === id);
//   if (todo) {
//     res.json(todo);
//   } 
//   else {
//     // TODO ➡️ handle 404 status with a message of { message: 'Todo item not found' }
//         res.status(404).json({ message: 'Todo item not found' });
//     }
// });

// // POST a new todo item
// app.post('/todos', (req, res) => {
//   const { name, priority = 'low', isFun } = req.body;

//   if (!name) {
//     return res.status(400).json({ message: 'Name is required' });
//   }

//   const newTodo = {
//     id: nextId++,
//     name,
//     priority,
//     isComplete: false,
//     isFun
//   };
  
//   todos.push(newTodo);

//   // TODO ➡️ Log every incoming TODO item in a 'todo.log' file @ the root of the project
//   // In your HW, you'd INSERT a row in your db table instead of writing to file or push to array!

//   res.status(201).json(newTodo);
// });

// // DELETE a todo item by ID
// app.delete('/todos/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   const index = todos.findIndex(item => item.id === id);

//   if (index !== -1) {
//     todos.splice(index, 1);
//     res.json({ message: `Todo item ${id} deleted.` });
//   } else {
//     res.status(404).json({ message: 'Todo item not found' });
//   }
// });

// // TODO ➡️ Start the server by listening on the specified PORT

// app.listen(PORT, () => {
//     console.log('I am listening now 🚀');
//   });