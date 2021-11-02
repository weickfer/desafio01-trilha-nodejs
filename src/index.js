const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({
      error: 'User not exists!'
    })
  }

  request.user = user

  return next()
}

// Ok!
app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({
      error: 'Already exists user with this username!'
    })
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  }

  users.push(user)

  return response.json(user)
});


// Ok!
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

// Ok!
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

// Ok!
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find(todo => todo.id === id)

  
  if (!todo) {
    return response.status(404).json({
      error: 'Todo not exists!'
    })
  }
  
  todo.title = title
  todo.deadline = new Date(deadline)
  
  return response.json(todo)
});

// Ok!
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  
  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not exists!'
    })
  }

  todo.done = true

  return response.json(todo)
});

// Ok!
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  
  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not exists!'
    })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;
