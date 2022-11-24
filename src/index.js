const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const id = uuidv4();


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "User not found" })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists) {
    response.status(400).json({ error: "username already exists!"});
  }


  const user = {
    name, 
	  username,
    id: uuidv4(),
    todos: [],
  }

  users.push(user);

return response.status(201).json(user).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const id = uuidv4();

  const todo = {
  id: uuidv4(),
	title,
	done: false, 
	deadline: new Date(deadline), 
	created_at: new Date(),
  }

  user.todos.push(todo)
  
  return response.status(201).json(todo);

});  



app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params; 
  

  const todo = user.todos.find(todo => todo.id === id)
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  
  if (todoIndex < 0) {
    return response.json({ error: "Todo not found."})
  }

  todo.title = title;
  todo.deadline = deadline;


  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  
  if (todoIndex < 0) {
    return response.json({ error: "Todo not found."})
  }
 
  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id);
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  
  if (todoIndex < 0) {
    return response.json({ error: "Todo not found."})
  }

  user.todos.splice(todo, 1);

  return response.json(user.todos)

});

module.exports = app;