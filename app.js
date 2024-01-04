//jshint esversion:6
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import punycode from 'punycode';
// import encrypt from 'mongoose-encryption';
import md5 from 'md5';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

console.log(process.env.API_KEY);

// mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model('User', userSchema);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      // password: req.body.password,
      // password: md5(req.body.password),
      password: hash,
    });

    try {
      await newUser.save();
      res.render('secrets');
    } catch (err) {
      console.error(err);
    }
  });
});

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // const password = md5(req.body.password);

  // User.findOne({ email: username }, function (err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       if (foundUser.password === password) {
  //         res.render('secrets');
  //       }
  //     }
  //   }
  // });

  // try {
  //   const foundUser = await User.findOne({ email: username });

  //   if (foundUser && foundUser.password === password) {
  //     res.render('secrets');
  //   } else {
  //     res.render('login');
  //   }
  // } catch (err) {
  //   console.error(err);
  // }

  try {
    const foundUser = await User.findOne({ email: username });

    if (foundUser) {
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (result) {
          res.render('secrets');
        } else {
          res.render('login');
        }
      });
    } else {
      res.render('login');
    }
  } catch (err) {
    console.error(err);
    res.render('login');
  }
});
