const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

app.use(express.json());

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!');
    }

    var db = client.db(databaseName);

    app.post('/authors',(req, res, next)=>{
        db.collection('authors').insertOne({
            author:"pink",
            awards:6,
            year:1996,
            bookSold:40,
            price: 100,
            DOB: new Date('1996-08-31'),
            book:"ABCDE"
        }).then(value=>{
            res.send(value);
        }).catch(err=>{
            return next(err)
        })
    })

    app.get('/authors/:count',(req, res, next)=>{
        db.collection('authors').find({awards:{$gte:parseInt(req.params.count)}}).toArray((err, data)=>{
            if(err){
                return next(err);
            }
            res.send(data)
        })
    })

    app.get('/authors/year/:year',(req, res, next)=>{
        db.collection('authors').find({year:{$gte:parseInt(req.params.year)}}).toArray((err, data)=>{
            if(err){
                return next(err);
            }
            res.send(data);
        })
    })

    app.get('/books',(req, res, next)=>{
        db.collection('authors').aggregate([
            {$group:{_id:"$author",
                    totalBooksSold:{$sum:"$bookSold"},
                    totalProfit:{"$sum":{"$multiply":["$bookSold","$price"]}}
                }   
            }
        ]).toArray((err, data)=>{
            if(err){
                return next(err);
            }
            res.send(data)
        })
    })

    app.get('/authors/:date/:total',(req, res, next)=>{
        db.collection('authors').aggregate([
            {$match:{DOB:{$gte:new Date(req.params.date)}}},
            {
                $group:{
                    _id:"$author",
                    total:{"$sum":{"$multiply":["$bookSold","$price"]}}
                }
            },{
                $project:{
                    author:1,
                    total:"$total",
                    cond:{
                        $gte:["$total",parseInt(req.params.total)]
                    }
                }
            },
            {$match:
                {"cond":true}
            }
        ]).toArray((err, data)=>{
            if(err){
                return next(err);
            }
            res.send(data);
        })
    })
    
    
});

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})