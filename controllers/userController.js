const express = require('express');
const router = express.Router();
const User = require('../models/userModel'); // Assure-toi que le chemin est correct
const jwt = require('jwt-simple');
const passwordHash = require('password-hash'); // Ou la librairie que tu utilises
const crypto = require('crypto'); // Pour générer un mot de passe aléatoire

// Clé secrète pour JWT - À METTRE DANS UNE VARIABLE D'ENVIRONNEMENT EN PRODUCTION
const JWT_SECRET = process.env.JWT_SECRET || 'TON_SUPER_SECRET_JWT_A_CHANGER';

// Fonction utilitaire pour générer un username unique
async function generateUniqueUsername(firstName, lastName) {
  let username = (`${firstName}${lastName}`).toLowerCase().replace(/\s+/g, '');
  let counter = 0;
  let tempUsername = username;
  while (await User.findOne({ username: tempUsername })) {
    counter++;
    tempUsername = `${username}${counter}`;
  }
  return tempUsername;
}

// POST /user/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    // Vérifie le mot de passe
    // Si tu utilises password-hash, il a une méthode verify.
    // Si tu utilises bcrypt, ce serait bcrypt.compareSync(password, user.password)
    const isMatch = passwordHash.verify(password, user.password); 
    // OU si tu as une méthode sur ton modèle User: const isMatch = user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    // L'utilisateur est authentifié, génère un token JWT
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // issued at
      // exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // expire dans 24h (optionnel)
    };

    const token = jwt.encode(payload, JWT_SECRET);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Connexion réussie.'
    });

  } catch (error) {
    console.error('Login server error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

// POST /user/register
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, username } = req.body;

  if (!email || !password || !firstName || !lastName || !username) {
    return res.status(400).json({ 
      message: 'Tous les champs obligatoires doivent être fournis (username, email, password, firstName, lastName).' 
    });
  }

  try {
    // Vérifier si l'email ou le username existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
      }
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password: passwordHash.generate(password),
      firstName,
      lastName,
      role: 'user' // Rôle par défaut modifié pour correspondre à l'enum
    });

    const savedUser = await newUser.save();

    // Générer le token JWT
    const payload = {
      sub: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      iat: Math.floor(Date.now() / 1000)
    };
    const token = jwt.encode(payload, JWT_SECRET);

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      token,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error('Register server error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erreur de validation', errors: error.errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
});

// POST /user/google-login
router.post('/google-login', async (req, res) => {
  console.log(req.body);
  const { email, name, googleId, picture } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ message: 'Email et googleId sont requis.' });
  }

  try {
    let user = await User.findOne({ googleId });

    if (!user) {
      // Essayer de trouver par email si aucun utilisateur avec googleId n'est trouvé
      user = await User.findOne({ email });
      if (user) {
        // L'utilisateur existe par email, lions le compte Google
        user.googleId = googleId;
        user.picture = picture || user.picture; // Met à jour l'image si fournie
        // Si le nom de Google est plus complet, on pourrait le mettre à jour ici aussi
        // user.firstName = ... (extraire de 'name')
        // user.lastName = ... (extraire de 'name')
      } else {
        // Nouvel utilisateur via Google
        const nameParts = name ? name.split(' ') : ['Utilisateur', 'Google'];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName; // Gère les noms simples
        
        const username = await generateUniqueUsername(firstName, lastName);

        // Générer un mot de passe aléatoire car le schéma l'exigeait (maintenant optionnel, mais si on veut le peupler)
        // Ou laisser vide si passwordHash.generate accepte null/undefined et que le schéma password n'est plus requis.
        // Puisque password est required: false maintenant, on peut ne pas le définir.
        // let randomPassword = crypto.randomBytes(16).toString('hex');
        // let hashedPassword = passwordHash.generate(randomPassword);

        user = new User({
          googleId,
          email,
          firstName,
          lastName,
          username,
          picture,
          // password: hashedPassword, // Seulement si vous voulez le peupler malgré tout
          role: 'user' // Rôle par défaut
        });
      }
    } else {
      // L'utilisateur trouvé par googleId, mettre à jour l'image si elle a changé
      if (picture && user.picture !== picture) {
        user.picture = picture;
      }
      // On pourrait aussi vérifier si le nom/prénom a changé et mettre à jour
    }

    await user.save();

    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      picture: user.picture,
      iat: Math.floor(Date.now() / 1000)
    };
    const token = jwt.encode(payload, JWT_SECRET);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        picture: user.picture
      },
      message: 'Connexion Google réussie.'
    });

  } catch (error) {
    console.error('Google login server error:', error);
    if (error.code === 11000) { // Erreur de duplicité (par ex. username)
        return res.status(409).json({ message: 'Erreur de conflit de données, potentiellement username ou email déjà pris différemment.', details: error.keyValue });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la connexion Google.' });
  }
});

// TODO: Ajouter d'autres routes (register, getProfile, etc.)

module.exports = router;