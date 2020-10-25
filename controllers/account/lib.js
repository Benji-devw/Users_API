const User = require("../../schema/schemaUser.js");
const passwordHash = require("password-hash");

async function signup(req, res) {
     const { password, email, username } = req.body;
     if (!email || !password) {
          //Le cas où l'email ou bien le password ne serait pas soumit ou nul
          return res.status(400).json({
               text: "Requête invalide"
          });
     }
     // Création d'un objet user, dans lequel on hash le mot de passe
     const user = {
          username,
          email,
          password: passwordHash.generate(password)
     };
     // On check en base si l'utilisateur existe déjà
     try {
          const findUser = await User.findOne({
               username,
               email
          });
          if (findUser) {
               return res.status(400).json({
                    text: "L'utilisateur existe déjà"
               });
          }
     } catch (error) {
          return res.status(500).json({ error });
     }
     try {
          // Sauvegarde de l'utilisateur en base
          const userData = new User(user);
          const userObject = await userData.save();
          return res.status(200).json({
               text: "Succès",
               token: userObject.getToken()
          });
     } catch (error) {
          return res.status(500).json({ error });
     }
}

async function login(req, res) {
     const { password, email } = req.body;
     if (!email || !password) {
          //Le cas où l'email ou bien le password ne serait pas soumit ou nul
          return res.status(400).json({
               text: "Input incorrect"
          });
     }
     try {
          // On check si l'utilisateur existe en base
          const findUser = await User.findOne({ email });
          if (!findUser)
               return res.status(401).json({
                    text: "User not found"
               });
          if (!findUser.authenticate(password))
               return res.status(401).json({
                    text: "Pssword not found"
               });
          return res.status(200).json({
               token: findUser.getToken(),
               text: "Authentification réussi"
          });
     } catch (error) {
          return res.status(500).json({
               error
          });
     }
}

async function deleteUser(req, res) {
     User.findOneAndDelete({ username: req.body.username }, (err, result) => {
          console.log('result', result)
          if (err) {
               return res.status(400).json({ success: false, error: err })
          }
          return res.status(200).json({ success: true, data: result })
     })
}

async function getUsers(req, res) {
     User.find({}, function (err, users) {
          // console.log('users', users)
          if (err){
               return res.status(401).json({
               success: false, 
               error: 'Users Not found'
          })}

          return res.status(200).send({ success: true, data: users })
     });
}

exports.login = login;
exports.signup = signup;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
