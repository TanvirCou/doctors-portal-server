const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxtb46d.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  

async function run() {
  try {
    await client.connect();
    const database = client.db("doctorsPortal");
    const appointmentCollection = database.collection("appointments");
    const doctorCollection = database.collection("doctors");
    const prescriptionCollection = database.collection("prescriptions");
    const reviewCollection = database.collection("reviews");

    app.post('/addAppointment', async(req,res) => {
        const appointment = req.body;
        const result = await appointmentCollection.insertOne(appointment);
        res.send(result);
    })

    app.post('/appointmentsByDate', async(req,res) => {
      const date = req.body;
      const email = req.body.email;
      const queryOne = {email: email};
      const cursorOne = doctorCollection.find(queryOne);
      const doctorsDoc = await cursorOne.toArray();
      const queryTwo = {date: date.date};
      if(doctorsDoc.length === 0){
        queryTwo.email = email;
      }
      const cursorTwo = appointmentCollection.find(queryTwo);
      const documents = await cursorTwo.toArray();
      res.send(documents);
  })

    app.get('/appointments', async(req,res) => {
    const query = {};
    const cursor = appointmentCollection.find(query);
    const documents = await cursor.toArray();
    res.send(documents);
  })

  app.post('/addADoctor',(req,res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }
    const query = {name, phone, email, image};
    const result =  doctorCollection.insertOne(query);
    res.send(result);
  })
  

  app.get('/doctors', async(req,res) => {
    const query = {};
    const cursor = doctorCollection.find(query);
    const documents = await cursor.toArray();
    res.send(documents);
  })

  app.post('/isDoctor', async(req,res) => {
    const email = req.body.email;
    const query = {email: email};
    const cursor = doctorCollection.find(query);
    const doctorsDoc = await cursor.toArray();
    res.send(doctorsDoc.length > 0);
})

app.post('/addPrescription', async(req,res) => {
  const prescription = req.body;
  const result = await prescriptionCollection.insertOne(prescription);
  res.send(result);
})


app.get('/prescriptions', async(req,res) => {
  const query = {};
  const cursor = prescriptionCollection.find(query);
  const documents = await cursor.toArray();
  res.send(documents);
})

app.post('/appointmentsByEmail', async(req,res) => {
    const email = req.body.email;
    const query = {email: email};
    const cursor = appointmentCollection.find(query);
    const documents = await cursor.toArray();
    res.send(documents);
})

app.post('/addReview', async(req,res) => {
  const review = req.body;
  const result = await reviewCollection.insertOne(review);
  res.send(result);
})

app.get('/reviews', async(req,res) => {
  const query = {};
  const cursor = reviewCollection.find(query);
  const documents = await cursor.toArray();
  res.send(documents);
})


  } finally {
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(process.env.PORT || port);