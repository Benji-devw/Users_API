import User from "../../schema/schemaUser.js";
import passwordHash from "password-hash";

async function signup(req, res) {
    console.log("req.body", req.body);

    const { password, email, username } = req.body;
    if (!email || !password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        return res.code(400).send({
            text: "Requête invalide",
        });
    }
    // Création d'un objet user, dans lequel on hash le mot de passe
    const user = {
        username,
        email,
        password: passwordHash.generate(password),
    };
    // On check en base si l'utilisateur existe déjà
    try {
        const findUser = await User.findOne({
            username,
            email,
        });
        if (findUser) {
            return res.code(400).send({
                text: "L'utilisateur existe déjà",
            });
        }
    } catch (error) {
        console.error("Error checking existing user in signup:", error);
        return res.code(500).send({ error: "Erreur serveur lors de la vérification de l'utilisateur." });
    }
    try {
        // Sauvegarde de l'utilisateur en base
        const userData = new User(user);
        const userObject = await userData.save();
        return res.code(200).send({
            text: "Succès",
            token: userObject.getToken(),
        });
    } catch (error) {
        console.error("Error saving user in signup:", error);
        return res.code(500).send({ error: "Erreur serveur lors de la sauvegarde de l'utilisateur." });
    }
}

async function login(req, res) {
    console.log("req.body", req.body);
    const { password, email } = req.body;
    if (!email || !password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        return res.code(400).send({
            text: "Input incorrect",
        });
    }
    try {
        // On check si l'utilisateur existe en base
        const findUser = await User.findOne({ email });
        if (!findUser)
            return res.code(401).send({
                text: "User not found",
            });
        if (!findUser.authenticate(password))
            return res.code(401).send({
                text: "Password not found", // Typo: Pssword -> Password
            });
        return res.code(200).send({
            token: findUser.getToken(),
            text: "Authentification réussi",
            user: findUser,
        });
    } catch (error) {
        console.error("Error in login:", error);
        return res.code(500).send({
            error: "Erreur serveur lors de la connexion.",
        });
    }
}

async function deleteUser(req, res) {
    try {
        // On s'attend à ce que l'id de l'utilisateur soit passé dans les paramètres de la route, par exemple /api/user/:id
        // Ou si c'est par username dans le body, s'assurer que la route est configurée pour ça.
        // Pour l'exemple, je vais supposer que req.body.username est correct.
        const usernameToDelete = req.body.username; 
        if (!usernameToDelete) {
            return res.code(400).send({ success: false, message: "Nom d'utilisateur manquant pour la suppression." });
        }

        const result = await User.findOneAndDelete({ username: usernameToDelete });

        if (!result) {
            return res.code(404).send({ success: false, message: "Utilisateur non trouvé." });
        }
        console.log("User deleted:", result);
        return res.code(200).send({ success: true, data: result, message: "Utilisateur supprimé avec succès." });

    } catch (err) {
        console.error("Error in deleteUser:", err);
        return res.code(500).send({ success: false, error: "Erreur serveur lors de la suppression de l'utilisateur." });
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.find({});
        return res.code(200).send({ success: true, data: users });
    } catch (error) {
        console.error("Error in getUsers:", error); // Pour le débogage côté serveur
        return res.code(500).send({ // Correction ici aussi pour .send()
            success: false,
            message: "Erreur lors de la récupération des utilisateurs."
        });
    }
}

export default { login, signup, getUsers, deleteUser };
