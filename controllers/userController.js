
import User from '../schema/schemaUser'; // Assure-toi que le chemin est correct
import jwt from 'jwt-simple';
import bcrypt from 'bcryptjs';
// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'TON_SUPER_SECRET_JWT_A_CHANGER';

// Function to generate a unique username
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

// Router POST /login
const login = async (req, res) => {
    console.log("req.body", req.body);
    const { password, email } = req.body;
    if (!email || !password) {
        //Case where the email or password is not submitted or null
        return res.code(400).send({
            text: "Input incorrect",
        });
    }
    try {
        // Check if user exists in the database
        const findUser = await User.findOne({ email });
        if (!findUser)
            return res.code(401).send({
                text: "User not found",
            });
        const isMatch = await bcrypt.compare(password, findUser.password);
        if (!isMatch)
            return res.code(401).send({
                text: "Password not found",
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

// Router POST /register
const register = async (req, res) => {
  const { email, password, firstName, lastName, username, avatar, phone, country, bio, role, postalCode, city, address } = req.body;

  console.log("req.body", req.body);

  if (!email || !password || !firstName || !lastName || !username) {
    return res.code(400).send({ 
      message: 'Tous les champs obligatoires doivent être fournis (username, email, password, firstName, lastName).' 
    });
  } 

  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.code(409).send({ message: 'Un utilisateur avec cet email existe déjà.' });
      }
      if (existingUser.username === username) {
        return res.code(409).send({ message: 'Ce nom d\'utilisateur est déjà pris.' });
      }
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password: bcrypt.hashSync(password),
      firstName,
      lastName,
      role,
      avatar,
      phone,
      postalCode,
      city,
      address,
      country,
      bio,
    });
    console.log("newUser", newUser);
    const savedUser = await newUser.save();
    console.log("savedUser", savedUser);
    // Generate JWT token
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

    res.code(201).send({
      message: 'Utilisateur créé avec succès.',
      token,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        username: savedUser.username,
        avatar: savedUser.avatar,
        bio: savedUser.bio,
        role: savedUser.role,
        phone: savedUser.phone,
        address: savedUser.address,
        city: savedUser.city,
        postalCode: savedUser.postalCode,
        country: savedUser.country,
      }
    });

  } catch (error) {
    console.error('Register server error:', error);
    if (error.name === 'ValidationError') {
      return res.code(400).send({ message: 'Erreur de validation', errors: error.errors });
    }
    res.code(500).send({ message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// Router POST /google-login
const googleLogin = async (req, res) => {
  const { email, googleId, username, firstName, lastName, picture, phone, country, bio, role, postalCode, city, address } = req.body;
  console.log("req.body", req.body);
  if (!email || !googleId) {
    return res.code(400).send({ message: 'Email et googleId sont requis.' });
  }
  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  console.log("user", user);
  if (!user) {
    user = new User({
      email,
      googleId,
      username,
      firstName,
      lastName,
      picture,
      phone,
      country,
      bio,
      role,
      postalCode,
      city,
      address,
    });
    console.log("user", user);
    try {
      await user.save();
    } catch (error) {
      console.error("Error saving user:", error);
      return res.code(500).send({ message: 'Erreur serveur lors de l\'inscription.' });
    }
  } else if (!user.googleId) {
    // Associate the googleId if the account existed by email
    user.googleId = googleId;
    await user.save();
  }
  // Generate a token if needed
  const token = user.getToken ? user.getToken() : null;
  console.log("token", token);
  res.send({
    token,
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      picture: user.picture,
      roles: user.roles || ['user'],
      phone: user.phone,
      postalCode: user.postalCode,
      city: user.city,
      address: user.address,
    },
    message: 'Connexion Google réussie.',
  });
};

export default {
  login,
  register,
  googleLogin,
};

