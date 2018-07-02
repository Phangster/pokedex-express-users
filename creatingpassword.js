console.log("Starting the server :)");

/*
    *************************************************************
    *************************************************************
    *************************************************************

                    require libraries

    *************************************************************
    *************************************************************
    *************************************************************
    *************************************************************
*/


const cookieParser = require('cookie-parser')

const reactEngine = require('express-react-views').createEngine();

const jsonfile = require('jsonfile');

var methodOverride = require('method-override')

const pg = require('pg');

const sha256 = require('js-sha256');



/*
    *************************************************************
    *************************************************************
    *************************************************************

                    DB setup

    *************************************************************
    *************************************************************
    *************************************************************
    *************************************************************
*/

const configs = {
    user: 'drillaxholic',
    host: '127.0.0.1',
    database: 'user',
    port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

//pool.query(text, params, callback);



/*
    *************************************************************
    *************************************************************
    *************************************************************

                    express setup

    *************************************************************
    *************************************************************
    *************************************************************
    *************************************************************
*/

const express = require('express');

const app = express();

app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use(cookieParser());

// look in the views directory for all the templates
app.set('views', __dirname + '/views');

// use the react engine in express
app.engine('jsx', reactEngine);

// this line sets react to be the default view engine
app.set('view engine', 'jsx');

const bodyParser = require('body-parser');

// tell your app to use the module
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


/*
    *************************************************************
    *************************************************************
                  Adding user details to data base 
    *************************************************************
    ************************************************************* 
*/

app.post('/users/new', (req, res) => {
    let password = sha256(req.body.password);
    let queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING*';
    const values = [req.body.email, password];
    pool.query(queryText, values, (err, result) => {
        if (err) {
            res.send('db error: ' + err.message)
        } else {
            let user_id = result.rows[0].id;

            res.cookie('logged_in', 'true');
            res.cookie('user_id', user_id);

            // res.send("created user with id: " + user_id)
            res.send('created new user: ' + user_id)
        }

    });
});
/*
    *************************************************************
    *************************************************************
              Logining in exsisting users/ Home page
    *************************************************************
    ************************************************************* 
*/
app.get('/', (req, res) => {
    res.render('home');
});

/*
    *************************************************************
    *************************************************************
                    Signing up new users
    *************************************************************
    ************************************************************* 
*/

app.get('/new/signup', (req, res)=>{
  res.render('registration_form')
});

/*
    *************************************************************
    *************************************************************
                    User login checking
    *************************************************************
    ************************************************************* 
*/

app.post('/users/login',(req, res) =>{
  let queryText = 'SELECT * FROM users WHERE email = $1';
  const values = [req.body.email];
  pool.query(queryText, values, (err, queryResult)=>{
    if(err){
      res.send('deb error: ' + err.message);
    }else{
      // console.log('this is the:     ' + queryResult.rows[0].id);
      if(req.cookies['logged_in']==='true'){
        res.send('WELCOME user ' + queryResult.rows[0].id);
      }else{
        res.render('account_not_found');
      }

    };
  });




     //     const queryRows = queryResult.rows
     //     if(queryRows.length < 1){
     //       res.send(401);
     //     }else{
     //       let db_pass_hash = queryRows[0].password_hash;
     //       let req_password_hash = sha256(req.body.password);
     //       if(db_pass_hash === req_password_hash){
     //         res.send('got something : '+ queryRows.length);
     //       }else{
     //         res.render('account_not_found')
     //       };
     //     };
});


app.listen(3000, () => {
    console.log('tunning in to port 3000~~~~')
});