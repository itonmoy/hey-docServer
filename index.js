

const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// doctors-portal--firebase-adminsdk.json\



// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.evzcc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//console.log(uri); checking the database user and password is working or not
async function run(){
    try{
        await client.connect();
        // checking the database connected or not 
        // console.log('database connected successfully');
        const database = client.db('doctors_portal');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');
        
        app.get('/appointments', async (req, res) => {
          const email = req.query.email;
          const date = new Date(req.query.date).toLocaleDateString();
     
          const query = { email: email, date: date }

          const cursor = appointmentsCollection.find(query);
          const appointments = await cursor.toArray();
          res.json(appointments);
      })

        app.post('/appointments', async(req, res) => {
          const appointment = req.body;
          const result = await appointmentsCollection.insertOne(appointment);
     
          res.json(result)
        });

        app.get('/users/:email', async (req, res) => {
          const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        app.post('/users', async(req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result)
          res.json(result)
        });
        app.put('/users',async (req, res)=>{
           const user = req.body;
           const filter ={email: user.email};
           const options = { upsert: true }; // if it is exist on database just igonore it otherwise insert it. 
           const updateDoc = {$set: user};
           const result = await usersCollection.updateOne(filter, updateDoc, options );
           res.json(result);
        });

        app.put('/users/admin', async(req, res) =>{
          const user= req.body;
          console.log('put', req.headers.authorization);
          const filter ={email: user.email};
          const updateDoc= {$set: {role: 'admin'}}
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        });
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello from doctors server')
})

app.listen(port, () => {
  console.log(`listening ${port}`);
})