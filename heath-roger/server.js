'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';

// Mac:
const conString = 'postgres://localhost:5432';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();

// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // this is 2 receiving the request and then 5 is sending the response back to the view. nothing is in article.js. it is being called when you type in the corresponding URL. this is the READ part of crud and its the URL that is enacting it.
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // its 3 and 4. 3 is requesting the /articles and then 4 is sending the data back. the fetchAll() is starting this. this is the READ part of crud, it is getting data to be displayed on the view.
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // Its 2, 3, and 4. the method is insertRecord() is doing a .post which is part of the app.post on the sever.js side. this is the 'c' part which is the craete of crud.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PUT YOUR RESPONSE HERE
  // this is 3 and 4. 3 is the update to a article that we select with the :id and then we get a 4 with the .then for the response.send() or the catch(). this is being called on the updateRecord(). this is the update part of CRUD since the file already Exist in the database.
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is 3 and 4, 3 is the request to delete the article, 4 is the response as to wether or not it was sucessfull. The method deleteRecord is the one that is interacting with it. This is the D for delete in CRUD.
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is 3 and 4, 3 is the request to delete the article, 4 is the response as to wether or not it was sucessfull. This is interacting with truncateTable method in article.js. This is the D for DELETE in CRUD.
  client.query(
    'DELETE FROM articles;'
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
//This is creating the DB if it does not exits, on our local machine.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // 3 and 4. this is quering the model to find out if there is data in the table, if not it loads the articles into DB. This is READ and CREATE. This is not interacting directly with article.js.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
              [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            )
          })
        })
      }
    })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // 3 and 4. This is not interacting with article.js. This is the CREATE in CRUD.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
