var express= require('express');

var app= express();
var dotenv=require('dotenv');
var mongo=require('mongodb');
var MongoClient=mongo.MongoClient;
dotenv.config();

var MongoUrl="mongodb+srv://test:test@cluster0.rmuzh.mongodb.net/eduintern?retryWrites=true&w=majority";
var cors=require('cors')
var bodyParser=require('body-parser');
var port= process.env.PORT || 8100;

//to save the datbase connection
var db;
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

var location=[
    {
      "location_id": 1,
      "location_name": "Ashok Vihar Phase 3, New Delhi",
      "state_id": 1,
      "state": "Delhi",
      "country_name": "India"
    },
    {
      "location_id": 4,
      "location_name": "Bibvewadi, Pune",
      "state_id": 2,
      "state": "Maharashtra",
      "country_name": "India"
    },
    {
      "location_id": 8,
      "location_name": "Jeevan Bhima Nagar, Bangalore",
      "state_id": 3,
      "state": "Karnataka",
      "country_name": "India"
    },
    {
      "location_id": 13,
      "location_name": "Sector 40, Chandigarh",
      "state_id": 4,
      "state": "Punjab",
      "country_name": "India"
    }
  ]

//this is a default route

app.get('/',(req,res)=>{
    res.send("Hii from express");
})

app.get('/location',(req,res)=>{
  db.collection('location').find().toArray((err,result)=>{
    if (err) throw err
    res.send(result)
  })
})

//return all the meal type
app.get('/mealType',(req,res)=>{
  db.collection('mealtype').find().toArray((err,result)=>{
    if(err) throw err
    res.send(result)
  })
})

/*
//return all the restaurants 
app.get('/restaurants',(req,res)=>{
  db.collection('restaurants').find().toArray((err,result)=>{
    if(err) throw err
    res.send(result)
  })
})
*/

//restaurant wrt to id
app.get('/restaurants/:id',(req,res)=>{
  var id=parseInt(req.params.id);
  db.collection('restaurants').find({"restaurant_id":id}).toArray((err,result)=>{
    if(err) throw err
    res.send(result)
  })
})

//query param example wrt to city
app.get('/restaurants',(req,res)=>{

  var query={};
  if(req.query.city){
    query={state_id:Number(req.query.city)}
  }
  db.collection('restaurants').find(query).toArray((err,result)=>{
    if (err) throw err
    res.send(result)
  })

})

//restaurant wrt to mealId and cusine

app.get('/filters/:mealId',(req,res)=>{
  var id=parseInt(req.params.mealId);
  var query={"mealTypes.mealtype_id":id}
  var sort={cost:1}

  if(req.query.cuisine && req.query.lcost && req.query.hcost){
    let lcost=Number(req.query.lcost);
    let hcost=Number(req.query.hcost);
    query={$and:[{cost:{$gt:lcost,$lt:hcost}}],
          "cuisines.cuisine_id":Number(req.query.cuisine),
          "mealTypes.mealtype_id":id}
  }

  if(req.query.cuisine){
    query={"mealTypes.mealtype_id":id,"cuisines.cuisine_id":Number(req.query.cuisine)}
    // query={"mealTypes.mealtype_id":id,"cuisines.cuisine_id":{$in:[2,5]}}
  }else if(req.query.lcost && req.query.hcost){
    let lcost=Number(req.query.lcost);
    let hcost=Number(req.query.hcost);
    query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id}
  }
  db.collection('restaurants').find(query).sort(sort).toArray((err,result)=>{
    if(err) throw err
    res.send(result)
  })
})

//return all the menu
app.get('/menu/:restid',(req,res)=>{
  var restid=Number(req.params.restid)
  db.collection('menu').find({restaurant_id:restid}).toArray((err,result)=>{
    if(err) throw err
    res.send(result)
  })
})

app.post('/menuItem',(req,res)=>{
  console.log(req.body)
  db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result)=>{
    if(err) throw err;
    res.send(result)
  })
})

app.put('/updateStatus/:id',(req,res)=>{
  var id=Number(req.params.id);
  var status=req.body.status?req.body.status:"pending"
  db.collection('orders').updateOne(
    {id:id},
    {
      $set:{
        "date":req.body.date,
        "bank_status":req.body.bank_status,
        "bank":req.body.bank,
        "status":status
      }
    }

  )
    res.send('data updated')
})

//return all the orders
app.get('/orders',(req,res)=>{
  db.collection('orders').find().toArray((err,result)=>{
    if(err) throw err
    res.send(result)
  })
})

app.post('/placeOrder',(req,res)=>{
  console.log(req.body);
  db.collection('orders').insert(req.body,(err,result)=>{
    if(err) throw err;
    res.send("order Placed")
  })
})

app.delete('/deleteOrder',(req,res)=>{
  db.collection('orders').remove({},(err,result)=>{
    if(err) throw err
    res.send(result)
  })
})


//Connecting with mongodb
MongoClient.connect(MongoUrl,(err,client) =>{
  if(err) console.log("error while connecting")
  db=client.db('eduintern')
})

app.listen(port,()=>{
    console.log(`listen on ${port}`)
})