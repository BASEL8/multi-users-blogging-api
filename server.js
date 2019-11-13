const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

//bring routes
const blogRoutes = require('./routes/blog')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const contactFormRoutes = require('./routes/form')
const tagRoutes = require('./routes/tag')
const app = express();

//db 
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => console.log('db connected'))
//middleware
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

//routes middleware 
app.use('/api', blogRoutes)
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', tagRoutes)
app.use('/api', contactFormRoutes)


//cors


//routes


//port
const port = process.env.PORT || 8000;


app.listen(port, () => {
  console.log(`server is running on port ${port} `)
})