import { OneModel, OneModelServer } from "../src";
import express from 'express';
import generateForm from "../src/helpers/html-form-helper.js";
const port = 3000;
const app = express();
app.use(express.urlencoded());

class Movie extends OneModel {}

Movie.configure({
  props: {
    title: "Movie",
    director: "Director",
    genre: {index: 2, options: ['action', 'drama', 'western', 'horror', 'thriller', 'comedy']},
    decade: ['1980', '1990', '2000', '2010', '2020'],
    qualities: {options: ['remux-2160p', 'bluray-2160p', 'web-2160p', 'hdtv-2160p'], multiple: true},
    rating: {type: Number, min: 0, max: 10},
    year: 1990
  }
});

app.get('/', (req, res) => {
  let html = ''
  res.send(generateForm(new Movie()));
});

app.post('/', (req, res) => {
  res.send(generateForm(new Movie(req.body)));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

