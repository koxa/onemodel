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
    genre: {value: 'comedy', options: ['action', 'drama', 'western', 'horror', 'thriller', 'comedy']},
    decade: ['1980', '1990', '2000', '2010', '2020'],
    qualities: {options: ['remux-2160p', 'bluray-2160p', 'web-2160p', 'hdtv-2160p'], multiple: true},
    rating: {type: Number, min: 0, max: 10, value: 5},
    year: 1990
  }
});

app.get('/', (req, res) => {
  let html = '<p>New Movie Form</p>'
  res.send(html + generateForm(new Movie()));
});

app.post('/', (req, res) => {
  console.log('body', req.body);
  res.send(generateForm(new Movie(req.body)));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

