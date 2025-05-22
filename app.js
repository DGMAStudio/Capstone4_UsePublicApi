//All needed packages
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

//Set port and app values
const app = express();
const port = 3000;

//Set static folder and body-parser values
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

//Set all static const values needed in this app
//To get your ApiKey go to the documentation here: http://www.omdbapi.com //
const yourApiKey = "";
const API_URL = "http://www.omdbapi.com/?apikey=" + yourApiKey;
const movies = [];

//Set year for footer
var date = new Date();
var year = date.getFullYear();

//Home Screen 
app.get('/',async (req,res)=>{
    try {
        res.render('home.ejs',{
            y:year
        });
    } catch(err) {
        res.status(500).render('error.ejs', { error: err.message });

    }
})


//View Movies
app.get("/movies",async (req,res)=>{
    try {
        res.render('movies.ejs',{movies:movies, y:year});
    } catch(err) {
        res.status(500).render('error.ejs', { error: err.message });
    }
})

//Add New Movie
app.post("/movies", async (req,res)=>{
    const yourTitle = req.body.yourTitle;
    try {

        
    //CHECK IF THE MOVIE IS ALREADY INSIDE THE ARRAY
     const existingMovie = movies.find(movie => movie.title.toLowerCase() === yourTitle.toLowerCase());

     if (existingMovie) {
        return res.redirect('/movies');
      } 
    //Make the object
    const result = await axios.get(API_URL + "&t=" + yourTitle);
    const yourMovie = {
            title:result.data.Title,
            plot:result.data.Plot,
            poster:result.data.Poster,
            year:result.data.Year,
            director:result.data.Director,
            actors:result.data.Actors,
            rating:result.data.imdbRating,
            duration:result.data.Runtime,
            genre:result.data.Genre,
            yourRating:req.body.yourRating
    }
    movies.push(yourMovie);
    console.log(movies);


        res.render('movies.ejs', {
                y:year,
                movies:movies
        })
    } catch (err) {
        res.status(500).render('error.ejs', { error: err.message });
    }
})


//SHOWCASE A SINGLE MOVIE THAT THE RATING HAS ALREADY BEEN ADDED
app.get('/showmovie', async (req,res)=>{
    const yourTitle = req.query.yourTitle;
  try {
  const movie = movies.find(m => m.title === yourTitle);

  if (movie) {
    res.render('showmovie.ejs', {
      title: movie.title,
      plot: movie.plot,
      director: movie.director,
      actors: movie.actors,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      year: movie.year,
      poster: movie.poster,
      yourRating:movie.yourRating,
      y:year
    });
  } else {
    res.send('Movie not found.');
  }

  } catch (err) {
      res.status(500).render('error.ejs', { error: err.message });
  }
})


//SEARCH MOVIE
app.post('/searchmovie',async (req,res)=>{
    const search = req.body.search;
    try {

    const result = await axios.get(API_URL + "&t=" + search);
    //Information I need for the movie
    const title = result.data.Title;
    const plot = result.data.Plot;
    const poster = result.data.Poster;
    const year = result.data.Year;
    const director = result.data.Director;
    const actors = result.data.Actors;
    const rating = result.data.imdbRating;
    const duration = result.data.Runtime;
    const genre = result.data.Genre;

        res.render('searchmovie.ejs', {
            title:title,
            plot:plot,
            poster:poster,
            year:year,
            director:director,
            actors:actors,
            rating:rating,
            duration:duration,
            genre:genre,
            y:year
        })
    } catch (err) {
        res.status(500).render('error.ejs', { error: err.message });
    }
})

//UPDATE RATING
app.get('/update', (req, res) => {
  const yourTitle = req.query.yourTitle;

  const movie = movies.find(m => m.title.toLowerCase() === yourTitle.toLowerCase());
  if (movie) {
    res.render('updaterating.ejs', { movie:movie, y:year });
  } else {
    res.status(404).send('Movie not found.');
  }
});


app.post('/update', (req, res) => {
  const { yourTitle, updateRating } = req.body;

  try {
    const index = movies.findIndex(m => m.title.toLowerCase() === yourTitle.toLowerCase());
    if (index !== -1) {
      movies[index].yourRating = parseFloat(updateRating);
      res.redirect('/movies');
    } else {
      res.status(404).send('Movie not found.');
    } 
  } catch (err) {
    res.status(500).render('error.ejs', { error: err.message });
  }
});


//DELETE MOVIE FROM LIST
app.post('/delete', (req, res) => {
  const yourTitle = req.body.yourTitle;

  try {
    const index = movies.findIndex(m => m.title.toLowerCase() === yourTitle.toLowerCase());
    if (index !== -1) {
      movies.splice(index, 1);
      res.redirect('/movies');
    } else {
      res.send('Movie not found.');
    } 
  } catch (err) {
    res.status(500).render('error.ejs', { error: err.message });
  }
});

//APP STARTUP MESSAGE
app.listen(port,()=>{
    console.log(`Server is listening on port: ${port}`);
})
