const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken')

//Maskdata
const MaskData = require('maskdata');
const emailMask2Options = {
  maskWith: "*", 
  unmaskedStartCharactersBeforeAt: 3,
  unmaskedEndCharactersAfterAt: 2,
  maskAtTheRate: false
};

const passwordValidator = require('password-validator');
// Create a schema
var schema = new passwordValidator();
// Add properties to it
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces

exports.signup = (req, res, next) => {
  if (!schema.validate(req.body.password)) {
    res.status(400).json({ message: 'Mot de passe invalide !' })
  }else{
    bcrypt.hash(req.body.password, 10)
    .then(hash => {

      const email = req.body.email;
      const maskedEmail = MaskData.maskEmail2(email, emailMask2Options);
      console.log(maskedEmail);

      const user = new User({
        email: maskedEmail,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  }
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const maskedEmail = MaskData.maskEmail2(email, emailMask2Options);
  User.findOne({ email: maskedEmail })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' })
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};