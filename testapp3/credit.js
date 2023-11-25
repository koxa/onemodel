import BaseModel from "../src/common/model/BaseModel.js";
import BaseStore from "../src/common/store/BaseStore.js";

import express from "express";
import generateForm from "../src/helpers/html-form-helper.js";
import generateTable from "../src/helpers/html-table-helper.js";
import ValidatableModelMixin from "../src/common/model/mixins/ValidatableModelMixin.js";
import MySQLServerStoreAdaptor from "../src/server/store/adaptors/MySQLServerStoreAdaptor.js";

const port = 3000;
const app = express();
app.use(express.urlencoded());

class MyModel extends BaseModel {

}

class MyStore extends BaseStore {
  // static config = {
  //   db: {
  //     host: 'localhost',
  //     user: 'root',
  //     password: '01223oa',
  //     database: 'koxa'
  //   }
  // }
}

MyModel.addMixins(ValidatableModelMixin);
MyStore.addMixins(MySQLServerStoreAdaptor);

MyStore.setConfig({
  mysql: {
    host: "localhost",
    user: "root",
    password: "root",
    database: "test"
  }
});

await MyStore.connect();


class Category extends MyModel {
  static config = {
    ...super.config,
    props: {
      id: { type: Number, primaryKey: true }, // primaryKey means type: Number, unique: true, autoIncrement: true, NOT NULL. MANDATORY FOR MYSQL
      name: { type: String, options: ["all", "travel", "dining", "groceries", "gas", "flights", "hotels"] }
    }
  };
}

const categories = new MyStore({ config: { modelClass: Category, collectionName: "categories" } });

class Card extends MyModel {
  static config = {
    ...super.config,
    props: {
      id: { type: Number, primaryKey: true },
      hash: { type: String, unique: true, required: true, validator: val => val.indexOf(" ") < 0 }, //todo: regexp for 'val-val' format
      name: { type: String, required: true },
      issuer: { type: String, options: ["chase", "amex", "citi"] },
      paymentSystem: { type: String, options: ["visa", "mastercard", "amex"] },
      country: { type: String, options: ["USA"] },
      //releaseDate: Date,
      rewardType: { type: String, options: ["points", "cashback"] }
      //category: { type: String, options: categories, valueProp: "id", textProp: "name", required: true }
    }
  };
}

const cards = new MyStore({ config: { modelClass: Card } });


class CardCategory extends MyModel {
  static config = {
    ...super.config,
    props: {
      id: { type: Number, primaryKey: true }, // todo: support composite keys
      cardID: { type: String, options: cards, required: true, valueProp: "id", textProp: "hash" }, //todo: use primaryKey from options as default valueProp, use next or same prop as textProp
      categoryID: { type: String, options: categories, valueProp: "id", textProp: "name", required: true },
      value: { type: Number, min: 1, max: 10, required: true, value: 1 }
    }
  };
}

const cardCategories = new MyStore({ config: { modelClass: CardCategory } });


function getHomePage(errors = {}, categoryErrors = {}, cardCategoryErrors = {}) {
  let html = "<p>New Card Form</p>";
  html += generateForm(Card, errors);
  html += generateTable(cards);
  html += "<p>New Category Form</p>";
  html += generateForm(Category, categoryErrors);
  html += generateTable(categories);
  html += "<p>CardCategory Form</p>";
  html += generateForm(CardCategory, cardCategoryErrors);
  html += generateTable(cardCategories);
  html += `<script>window.cards = ${JSON.stringify(cards)}; console.log(window.cards)</script>`;
  return html;
}

app.get("/", async (req, res) => {
  await categories.fetch();
  res.send(getHomePage());
});

app.post("/card", (req, res) => {
  try {
    cards.push(req.body);
    res.send(getHomePage());
  } catch (err) {
    console.log("Caught card creation error:", err);
    res.send(getHomePage(err.props));
  }
});

app.post("/category", async (req, res) => {
  try {
    categories.push(req.body);
    await categories.save();
    res.send(getHomePage());
  } catch (err) {
    console.log("Caught categories creation error:", err);
    res.send(getHomePage({}, err.props));
  }
});

app.post("/cardCategory", (req, res) => {
  try {
    cardCategories.push(req.body);
    res.send(getHomePage());
  } catch (err) {
    console.log("Caught cardCategory creation error:", err);
    res.send(getHomePage({}, {}, err.props));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

