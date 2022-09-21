

const express = require('express')
var bodyParser = require('body-parser')
var firebase = require('firebase')
var admin = require('firebase-admin');
const app = express()
var port = process.env.PORT || 3000



var firebaseConfig = {
    apiKey: "AIzaSyDit-4pU2GU_m1wii6fRwlZJAaZLwj3vQU",
    authDomain: "todo-tomer.firebaseapp.com",
    databaseURL: "https://todo-tomer.firebaseio.com",
    projectId: "todo-tomer",
    storageBucket: "todo-tomer.appspot.com",
    messagingSenderId: "139032876037",
    appId: "1:139032876037:web:2c847fa4e68c20d162786c"
  };
  
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

const serviceAccount = {
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key,
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://todo-tomer.firebaseio.com"
});


app.use(bodyParser.urlencoded())

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', true)
  return next()
});


app.get('/getTodoData', function (req, res) {
  if (req.headers.authtoken) {
    admin.auth().verifyIdToken(req.headers.authtoken)
    .then(() => {
      var database = admin.database()
      var uid = req.query.uid
      database.ref('/users/' + uid).once('value')
      .then(function(snapshot) {
        var data = snapshot.val() ? snapshot.val() : {}
        res.status(200).send({ todo_list: data.todoData})
      }).catch(function(error) {
        res.status(500).json({ error: error})
      })
    }).catch(() => {
      res.status(403).send('Unauthorized')
    })
  } else {
    res.status(403).send('Unauthorized')
  }
})

app.get('/setTodoData', function(req,res) {
  var uid = req.query.uid
  var data = req.query.data

  if (!uid || !data) {
    res.status(500).send({message: "Failure Due to missing uid/data"})
  }

  if (req.headers.authtoken) {
    admin.auth().verifyIdToken(req.headers.authtoken)
    .then(() => {
      var database = admin.database()
      var uid = req.query.uid
      database.ref('/users/' + uid).set({
        todoData: data
      })
      res.status(200).send({message: "Success"})
    }).catch(() => {
      res.status(403).send('Unauthorized')
    })
  } else {
    res.status(403).send('Unauthorized')
  }
})

app.get('/removeAllTodoData', function(req,res) {

  if (req.headers.authtoken) {
    admin.auth().verifyIdToken(req.headers.authtoken)
    .then(() => {
      var database = admin.database()
      var uid = req.query.uid
      database.ref('/users/' + uid).remove()
      res.status(200).send({message: "Success"})
    }).catch(() => {
      res.status(403).send('Unauthorized')
    })
  } else {
    res.status(403).send('Unauthorized')
  }
})



app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))