const express=require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt=require('jsonwebtoken')
const {verifyToken}=require('./verifyToken')
const objectId=require('mongodb').ObjectId
const cors=require('cors')
require('dotenv').config()
const app=express()
const port=process.env.PORT||5000
//require('crypto').randomBytes(64).toString('hex')
app.use(express.json())
app.use(cors({origin:true}))

//4VfSnoLuAJtj4bNd
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zif2l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log('DB connected')
//   client.close();
// });

const run=async()=>{
    try{
        await client.connect()
        const database=client.db('carserices')
        const collection=database.collection('services')
        
        //token generate
        app.post('/login',async(req,res)=>{
            const email=req.body.email
            const token=jwt.sign({email:email},process.env.ACCESS_SECRET,{expiresIn:'2d'})
            res.send(token)

        })
        //all services
        app.get('/services',async(req,res)=>{
            const services= await collection.find({}).toArray()
            res.send(services)
            
        })
        //single service
        app.get('/service/:id',async(req,res)=>{
            const serviceId=req.params.id
            const service= await collection.findOne({_id:objectId(serviceId)})
            res.send(service)

        })

        //add a service
        app.post('/service',async(req,res)=>{
            const service=req.body
            const result=await collection.insertOne(service)
            console.log(service)
            res.send(result)

        })
        //update a service
        app.put('/service/:id',async(req,res)=>{
            const serviceId=req.params.id
            const service=req.body
            const newService={
                name:service.name,
                price:service.price,
                img:service.img,
                description:service.description

            }
            const result= await collection.updateOne({_id:objectId(serviceId)},{$set:newService})
            res.send(result)
        })
        //delete a service
        app.delete('/service/:id',async(req,res)=>{
            const serviceId=req.params.id
            const result= await collection.deleteOne({_id:objectId(serviceId)})
            res.send(result)
            console.log(serviceId)

        })

        //order place

        const orderCollection=database.collection('orders')
        app.post('/order',async(req,res)=>{
            const order=req.body
            const result= await orderCollection.insertOne(order)
            res.send(result)
        })

        //get orders
        app.get('/orders',verifyToken,async(req,res)=>{
            const email=req.query.email
            const authEmail=req.decoded.email
            if(email===authEmail){
                const orders= await orderCollection.find({email:email}).toArray()
                res.send(orders)
            }else{
                res.status(403).send({message:'Forbidden access'})
            }
            
            // console.log(res.decoded)
        })
    }finally{

    }
}

run().catch(console.dir)


app.get('/',(req,res)=>{
    res.send('Welcome')
})
app.listen(port,()=>{
    console.log('Listening on:',port)
})