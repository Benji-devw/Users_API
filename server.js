//Définition des modules
let express = require("express"),
     mongoose = require("mongoose"),
     bodyParser = require("body-parser"),
     cors = require('cors');
     usersRouter = require('./controllers/userController');


//Connexion à la base de donnée
mongoose.Promise = global.Promise;
mongoose
.connect("mongodb://localhost:27017/vallena", { useNewUrlParser: true, useUnifiedTopology: true })
     // .connect("mongodb+srv://mode_dev:Benben1337@vallena.aw6sr.mongodb.net/vallena?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() => {
          console.log("Connected to mongoDB");
     })
     .catch((e) => {
          console.log("Error while DB connecting");
          console.log(e);
     });

//On définit notre objet express nommé app
const app = express();

//Body Parser
const urlencodedParser = bodyParser.urlencoded({  extended: true });
app.use(urlencodedParser);
app.use(bodyParser.json());

// CORS (système de sécurité) || app.use(cors());
app.use(cors());

//Définition du routeur
// const router = express.Router();
// app.use("/user", router);
app.use('/user', usersRouter)

// require(__dirname + "/controllers/userController")(router);

//Définition et mise en place du port d'écoute
const port = 8805;
app.listen(port, () => console.log(`Listening on port ${port}`));
