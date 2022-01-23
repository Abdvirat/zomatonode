var express=require('express');
var app=express();
var dotenv=require('dotenv');
dotenv.config();
var mongo=require('mongodb');
var MongoClient=mongo.MongoClient;

const mongoUrl=process.env.MongoLiveUrl;
var cors=require('cors')
const bodyParser=require('body-parser')
var port=process.env.PORT || 8124;


//save the database connection
var db;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

//first default route

app.get('/',(req,res)=>{
    res.send("Hii from express")
})

//It will return all the location
app.get('/location',(req,res)=>{
    db.collection('location').find().toArray((err,result)=>{
        if(err) throw err;
        
        res.send(result)

    })
})

//It will return all the mealtype
app.get('/mealType',(req,res)=>{
    db.collection('mealType').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

/*
//it will return all the restaurants
app.get('/restaurants',(req,res)=>{
    db.collection('restaurants').find().toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})
*/


//restaurants wrt to id
app.get('/restaurants/:id',(req,res)=>{
    var id=parseInt(req.params.id);
    db.collection('restaurants').find({"restaurant_id":id}).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})


//query params example wrt to city_id

app.get('/restaurants',(req,res)=>{
    var query={};
    if(req.query.city){
        query={state_id:Number(req.query.city)}
    }
    db.collection('restaurants').find(query).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

//restaurants wrt to mealId
app.get('/filter/:mealId',(req,res)=>{
    var id=parseInt(req.params.mealId);
    var sort={cost:1}
    var query={"mealTypes.mealtype_id":id}

    if(req.query.sortkey){
        var sortkey=req.query.sortkey;
        if(sortkey>1 || sortkey<-1 || sortkey==0){
            sortkey=1
        }
        sort={cost:Number(sortkey)}
    }


    if(req.query.cuisine && req.query.lcost && req.query.hcost){
        var lcost=Number(req.query.lcost);
        var hcost=Number(req.query.hcost);
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"cuisines.cuisine_id":Number(req.query.cuisine),"mealTypes.mealtype_id":id}
    }

    else if(req.query.cuisine){
        query={"mealTypes.mealtype_id":id,"cuisines.cuisine_id":Number(req.query.cuisine)}
       // query={"mealTypes.mealtype_id":id,"cuisines.cuisine_id":{$in:[2,5]}}
    }else if(req.query.lcost && req.query.hcost){
        var lcost=Number(req.query.lcost);
        var hcost=Number(req.query.hcost);
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id}
    }

    db.collection('restaurants').find({"mealTypes.mealtype_id":id}).sort(sort).toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

//it will return all the menu
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
        if(err) throw err
        res.send(result)
    })
})


//It will update the order that is update query
app.put('/updateStatus/:id',(req,res)=>{
    var id=Number(req.params.id)
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
    res.send("data updated")
})



//It will return all the orders
app.get('/orders',(req,res)=>{
    db.collection('orders').find().toArray((err,result)=>{
        if(err) throw err
        res.send(result)
    })
})

//Post call from postman
app.post('/placeOrder',(req,res)=>{
    console.log(req.body)
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err
        res.send("Order Placed")
    })
    
})

//delete call from postman
app.delete('/deleteOrders',(req,res)=>{
    console.log(req.body)
    db.collection('orders').remove({},(err,result)=>{
        if(err) throw err
        res.send("order deleted")
    })
})

//connect with database 
MongoClient.connect(mongoUrl,(err,client)=>{
    if(err) console.log("Error while connecting")
    db=client.db('agustintern')
    app.listen(port,()=>{
        console.log(`listening on port ${port}`)
    })
})

