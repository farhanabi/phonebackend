require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
var morgan = require('morgan')
const Person = require('./models/person')

const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

console.log(`connecting to ${url}`)

mongoose.connect(url, { useNewUrlParser: true })
	.then(result => {
		console.log('Connected to MongoDB')
	})
	.catch((error) => {
		console.log(`Error connecting to MongoDB: ${error.message}`)
	})
	
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

app.use(cors())
app.use(express.static('build'))

app.use(bodyParser.json())
morgan.token('object', function(req, res) {
	return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :object'))

// let persons = [
// 	{ 
// 	  "name": "Arto Hellas", 
// 	  "number": "040-123456",
// 	  "id": 1
// 	},
// 	{ 
// 	  "name": "Ada Lovelace", 
// 	  "number": "39-44-5323523",
// 	  "id": 2
// 	},
// 	{ 
// 	  "name": "Dan Abramov", 
// 	  "number": "12-43-234345",
// 	  "id": 3
// 	},
// 	{ 
// 	  "name": "Mary Poppendieck", 
// 	  "number": "39-23-6423122",
// 	  "id": 4
// 	}
// ]

app.get('/info', (req, res) => {
	const num = persons.length

	const content = `<p>Phonebook has info for ${num} people</p>
		<p>${new Date()}</p>`

	res.send(content)
})

app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons => {
		res.json(persons.map(person => person.toJSON()))
	})
})

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	const person = persons.find(p => p.id === id)
	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}
})

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	persons = persons.filter(p => p.id !== id)
	res.status(204).end()
})

app.post('/api/persons', (req, res) => {
	const body = req.body

	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'name or number is missing'
		})
	} else if (persons.find(p => p.name === body.name)) {
		return res.status(400).json({
			error: 'name must be unique'
		})
	}

	const person = {
		name: body.name,
		number: body.number,
		id: Math.round(Math.random()*100000)
	}

	persons = persons.concat(person)
	res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})