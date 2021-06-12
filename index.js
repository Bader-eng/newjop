'use strict';

require('dotenv').config();

const express= require('express');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
//const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );
//const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );
const methodOverride = require('method-override');

const superagent= require ('superagent');

const PORT=process.env.PORT || 3000;

const server = express();
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));

server.set('view engine','ejs');


//ROOT//
server.get('/',homepage)

server.get('/sea',(req,res)=>{
    res.render('SearchPage')
})
server.post('/search',searchFUNCTION)
server.post('/done',addfunction)
server.get('/mylist',mylisthandler)
server.get('/details/:id',detailshandler)
server.put('/data/:id',updatehandler)
server.delete('/ss/:id',delethandler)

function homepage(req,res){
    let url=`https://jobs.github.com/positions.json?location=usa`
    superagent.get(url)
    .then(jop=>{
    let data=jop.body
    let newdata=data.map((val)=>{
        return new JOPS(val)
    })
    res.render('HomePage',{job:newdata})
    })
    }

function searchFUNCTION(req,res){
    let des=req.body.description
    let url =`https://jobs.github.com/positions.json?description=${des}`

    superagent.get(url)
    .then(val=>{
        let data = val.body
        let s=data.map((val)=>{
            return new JOPS(val)
        })
res.render('Resultspage',{data:s})
    })
}


 
function addfunction (req,res){

    let SQL = `INSERT INTO jop (title,company,location,url) VALUES ($1,$2,$3,$4) RETURNING *;`
    let safevalue=[req.body.title,req.body.company,req.body.location,req.body.url]
    client.query(SQL,safevalue)
    .then(val=>{
        //console.log(val)
        res.redirect('/mylist')
    })
}

function mylisthandler(req,res){
let sql =`SELECT * FROM jop`
console.log(sql)
client.query(sql)
.then(val=>{
    res.render('MyList',{data:val.rows})
})
}
function JOPS(jops){

    this.title=jops.title
    this.company=jops.company
    this.location=jops.location
    this.url=jops.url
}

function detailshandler (req,res){
    let sql = `SELECT * FROM jop WHERE id=$1`
    let safevaleu=[req.params.id]
    client.query(sql,safevaleu)
    .then(val=>{
        res.render('detials',{data:val.rows[0]})
    })
}

function updatehandler (req,res) {
    let sql =`UPDATE jop SET title=$1,company=$2,location=$3,url=$4 WHERE id=$5;`
    let safevalue=[req.body.title,req.body.company,req.body.location,req.body.url,req.params.id]
    client.query(sql,safevalue)
    .then(val=>{
        res.redirect(`/details/${req.params.id}`)
    })
}

function delethandler (req,res){
let sql=`DELETE FROM jop WHERE id=$1;`;
let safevaleu=[req.params.id]
client.query(sql,safevaleu)
.then(val=>{
res.redirect('/')
})
}

client.connect()
.then(() =>{
server.listen(PORT,() => console.log(`LESNING TO THE ${PORT}`));
})