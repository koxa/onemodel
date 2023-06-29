import { OneModel, OneStore } from "../src/index.js";
import express from 'express';
import generateForm from "../src/helpers/html-form-helper.js";
import generateTable from "../src/helpers/html-table-helper.js";
const port = 3000;
const app = express();
app.use(express.urlencoded());
class Movie extends OneModel {}
class MovieStore extends OneStore {
  static modelClass = Movie;
}

Movie.configure({
  props: {
    title: "Movie",
    director: "Director",
    genre: {value: 'comedy', options: ['action', 'drama', 'western', 'horror', 'thriller', 'comedy']},
    decade: ['1980', '1990', '2000', '2010', '2020'],
    qualities: {options: ['remux-2160p', 'bluray-2160p', 'web-2160p', 'hdtv-2160p'], multiple: true},
    rating: {type: Number, min: 0, max: 10, value: 5},
    year: 1990
  }
});

const myMovie = new Movie();
const myMovieStore = new MovieStore();

function getHomePage() {
  let html = '<p>New Movie Form</p>'
  html += generateForm(myMovie);
  html += generateTable(myMovieStore);
  return html;
}

app.get('/', (req, res) => {
  res.send(getHomePage());
});

app.post('/', (req, res) => {
  console.log('body', req.body);
  myMovieStore.push(req.body);
  res.send(getHomePage());
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

