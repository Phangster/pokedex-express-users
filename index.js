/**
 * To-do for homework on 28 Jun 2018
 * =================================
 * 1. Create the relevant tables.sql file
 * 2. New routes for user-creation
 * 3. Change the pokemon form to add an input for user id such that the pokemon belongs to the user with that id
 * 4. (FURTHER) Add a drop-down menu of all users on the pokemon form
 * 5. (FURTHER) Add a types table and a pokemon-types table in your database, and create a seed.sql file inserting relevant data for these 2 tables. Note that a pokemon can have many types, and a type can have many pokemons.
 */

const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');
const sha256 = require('js-sha256');
const cookieParser = require('cookie-parser')

// Initialise postgres client
const config = {
  user: 'drillaxholic',
  host: '127.0.0.1',
  database: 'pokemon-go',
  port: 5432,
};

const pool = new pg.Pool(config);

pool.on('error', function (err) {
  console.log('Idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Route Handler Functions
 * ===================================
 */

 const getRoot = (request, response) => {

  const queryString = 'SELECT * from pokemon;';
  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('Query error:', err.stack);
    } else {
      // console.log('Done');

      // redirect to home page
      response.render( 'home', {pokemon: result.rows} );
    }
  });
}

const getNew = (request, response) => {
  response.render('new');
}

const getPokemon = (request, response) => {
  let id = request.params['id'];
  const queryString = 'SELECT * FROM pokemon WHERE id = ' + id + ';';
  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('Query error:', err.stack);
    } else {
      console.log('Done');

      // redirect to home page
      response.render( 'pokemon', {pokemon: result.rows[0]} );
    }
  });
}

const postPokemon = (request, response) => {
  let params = request.body;
  
  const queryString = 'INSERT INTO pokemon(name, height) VALUES($1, $2);';
  const values = [params.name, params.height];

  pool.query(queryString, values, (err, result) => {
    if (err) {
      console.log('query error:', err.stack);
    } else {
      console.log('Done');

      // redirect to home page
      response.redirect('/pokemon');
    }
  });
};

const editPokemonForm = (request, response) => {
  let id = request.params['id'];
  const queryString = 'SELECT * FROM pokemon WHERE id = ' + id + ';';
  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('Query error:', err.stack);
    } else {
      console.log('Query result:');

      // redirect to home page
      response.render( 'Edit', {pokemon: result.rows[0]} );
    }
  });
}

const updatePokemon = (request, response) => {
  let id = request.params['id'];
  let pokemon = request.body;
  const queryString = 'UPDATE "pokemon" SET "num"=($1), "name"=($2), "img"=($3), "height"=($4), "weight"=($5) WHERE "id"=($6)';
  const values = [pokemon.num, pokemon.name, pokemon.img, pokemon.height, pokemon.weight, id];
  pool.query(queryString, values, (err, result) => {
    if (err) {
      console.error('Query error:', err.stack);
    } else {
      console.log('Query result:');

      // redirect to home page
      response.redirect('/pokemon');
    }
  });
}

const deletePokemonForm = (request, response) => {
  response.send("COMPLETE ME");
}

const deletePokemon = (request, response) => {
  let id = request.params['id']; 
  const queryString = 'DELETE FROM pokemon WHERE id =' + id + ';';
  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('Query error:', err.stack);
    } else {
      console.log('Query result:');

      // redirect to home page
      response.redirect('/pokemon');
    }
  })
}

const newUser = (req, res) => {
    let password = sha256(req.body.password);
    let queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
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
};

const loginPage = (req, res) => {
    res.render('password_home');
};

const signUp = (req, res)=>{
  res.render('password_registration')
}

const loginCheck = (req, res) =>{
  let queryText = 'SELECT password, id FROM users WHERE email = $1';
  const enterPassHash = sha256(req.body.password);
  const values = [req.body.email];
  pool.query(queryText, values, (err, queryResult)=>{
    if(err){
      res.send('deb error: ' + err.message);
    }else{
      // console.log('this is the row', queryResult.rows[0])
      // console.log('this is the length', queryResult.rows.length)
      if(queryResult.rows.length>0){
        if(enterPassHash === queryResult.rows[0].password){
          let user_id = queryResult.rows[0].id;
            res.cookie('logged_in', 'true');
            res.cookie('user_id', user_id);
            res.redirect('/pokemon');
        }else{
          res.redirect('/');
        }
      }
    }
  })
}

const addPokemon2User = (req, res)=>{
  let queryText ='INSERT INTO pokemon_user (pokemon_id, user_id) VALUES ($1, $2) RETURNING *'
  const values = [req.params.id, req.cookies['user_id']]
  pool.query(queryText, values, (err, queryResult)=>{
    if(err){
      res.send('deb error: ' + err.message);
    }else{
      res.redirect('/pokemon')
    }

  })
}

const displayUserPokemon = (req, res)=>{
let user_id = req.cookies['user_id'];
let queryText ='SELECT * FROM pokemon_user JOIN pokemon ON pokemon.id = pokemon_user.pokemon_id WHERE user_id=' + user_id
  pool.query(queryText, (err, queryResult)=>{
    if(err){
      res.send('deb error: ' + err.message);
    }else{
      // console.log(queryResult.rows[0].id)
      console.log(queryResult.rows)
      res.render('mypokelist', {pokemon: queryResult.rows})
    }
  })
}


/**
 * ===================================
 * Routes
 * ===================================
 */

app.get('/pokemon', getRoot);

app.get('/pokemon/:id/edit', editPokemonForm);
app.get('/pokemon/new', getNew);
app.get('/pokemon/:id', getPokemon);
app.get('/pokemon/:id/delete', deletePokemonForm);

app.post('/pokemon', postPokemon);

app.put('/pokemon/:id', updatePokemon);

app.delete('/pokemon/:id', deletePokemon);

/* Creating user login and password */

app.get('/', loginPage);

app.get('/users/create', signUp);

app.post('/users/new', newUser);

app.post('/users/exist', loginCheck);

/*adding pokemon to specific user*/

app.post('/pokemon/add/:id', addPokemon2User);

app.get('/mypokelist', displayUserPokemon);

// TODO: New routes for creating users


/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */


const server = app.listen(3000, () => console.log('~~~ Ahoy we go from the port of 3000!!!'));



// Handles CTRL-C shutdown
function shutDown() {
  console.log('Recalling all ships to harbour...');
  server.close(() => {
    console.log('... all ships returned...');
    pool.end(() => {
      console.log('... all loot turned in!');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);


