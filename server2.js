// app.js
import bodyParser from 'body-parser';
import express from 'express';
import {MongoClient} from "mongodb";


// const articlesInfo = {
//     'learn-react':{
//         upvotes:0,
//         comments: [],
//     },
//     'learn-node':{
//         upvotes:0,
//         comments: [],
//     },
//     'my-thoughts-on-resumes':{
//         upvotes:0,
//         comments: [],
//     },
// }
// Create Express app
const app = express();

//use body parser
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const withDB = async(operations, res) => {
    try {
        // connect to your cluster
        const client = await MongoClient.connect('mongodb://127.0.0.1:27017',{
            useNewUrlParser: true, 
            useUnifiedTopology: true,

        });
        // specify the DB's name
        const db = client.db('blogdb');
        // execute find query
        await operations(db);
        // close connection
        client.close();
        } catch (error) {
        res.status(500).json('Error connecting to db',error);

        }

}

app.get('/api/articles/:name', async(req,res) => {
 withDB(async(db) =>
 {
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({name: articleName});
    res.status(200).json(articleInfo);
    
 },res);
   
})
app.post('/api/articles/:name/upvote', async(req,res) =>{
    withDB(async(db) =>
 {
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({name: articleName});
    await db.collection('articles').updateOne({name: articleName},
      {
        '$set':{
            upvotes: articleInfo.upvotes + 1,
        },
      }  );

      const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});

      res.status(200).json(updatedArticleInfo);
     
        
    }, res );
})

app.post('/api/articles/:name/add-comment', (req,res) =>{
    const {username, text} = req.body;
    const articleName = req.params.name;
    withDB(async(db) => {
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName},{
            '$set': {
                comments: articleInfo.comments.concat({username, text}),
            },
        });
        const updatedArticleInfo = db.collection('articles').findOne({name :articleName});
        res.status(200).json(updatedArticleInfo);
    },res);
})

// Start the Express server
app.listen(8000, () => console.log('Server running on port 8000!'))