const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path')


const app = express();

//Connect database
connectDB();

app.use(bodyParser.json());



//Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profiles', require('./routes/api/profiles'));

//Serve static asset in production
if (process.env.NODE_ENV === production) {
    app.use(express.static('client/build'))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", " "))
    })
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));