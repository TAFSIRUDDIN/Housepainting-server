const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const  ObjectId  = require('mongodb').ObjectId;
require('dotenv').config()

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h4k9o.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufh5b.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());
const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection err', err)
    console.log('Database connected')
    const productCollection = client.db("paintingServices").collection("services");
    const bookedServiceCollection = client.db("paintingServices").collection("bookedServiceCollection");
    const adminCollection = client.db("paintingServices").collection("adminCollection");
    const reviewCollection = client.db("paintingServices").collection("reviewCollection");

    app.post('/addReview', (req, res)=>{
      const newReview = req.body;
     reviewCollection.insertOne(newReview)
        .then(result => {
          console.log(result)
          res.send(result.insertedCount > 0);
        })
  
    })

    app.post('/addService', (req, res)=>{
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        // console.log(name, description);
        
            const newImg = file.data;
            const encImg = newImg.toString('base64');
//make image 
            var image = {
                contentType: file.mimetype,
                size: file.size,
                img: Buffer.from(encImg, 'base64')
            }

            productCollection.insertOne({name, description, image})
                .then(result => {
                    
                        res.send(result.insertedCount > 0)
                })
    })


    app.get('/services', (req, res) => {
        productCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/allReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addOrder', (req, res) => {
        const newBooking = req.body;
        console.log(newBooking);
        bookedServiceCollection.insertOne(newBooking)
        .then(result => {
          console.log(result)
          res.send(result.insertedCount > 0);
        })
  
      })

    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        console.log(newAdmin);
        adminCollection.insertOne(newAdmin)
        .then(result => {
          console.log(result)
          res.send(result.insertedCount > 0);
        })
  
      })

      app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        console.log(email)
        adminCollection.find({ email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })

    app.get('/orders', (req, res) => {
        // console.log(req.query.email);
  
  
        bookedServiceCollection.find({email: req.query.email})
        .toArray((err, documents) => {
          res.send(documents);
        })
      })

    app.get('/adminOrders', (req, res) => {
        bookedServiceCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        })
      })

    // app.get('/bookedService/:id', (req, res) => {
    //   bookedServiceCollection.find({_id: ObjectId(req.params.id)})
    //   .toArray((err, documents) => {
    //     res.send(documents[0]);
    //   })
    // })

    app.patch('/updateService/:id', (req, res) => {
      // const to = req.body.name;
      bookedServiceCollection.updateOne({_id: ObjectId(req.params.id)},
      {
        $set: { status: req.body}
      })
      .then(result => {
        console.log(result)
      })
    })

    app.delete(`/delete/:id`, (req, res) => {
      console.log(req.params.id);
      productCollection.deleteOne({_id: ObjectId(req.params.id)})
      .then((documents) =>{
        console.log(documents);
      })


    })


});


app.listen(process.env.PORT || port)