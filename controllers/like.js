const Sauce = require('../models/sauce');

exports.likeSauce = (req, res, next) => {
  
  const userId = req.body.userId;
  const likes = req.body.like;
 
  console.log(likes);
  
  Sauce.findOne({_id: req.params.id})
  .then(() => {

      switch(likes) {
        case 1:
            Sauce.updateOne(
                { _id: req.params.id },
                {$push: {usersLiked: userId}, 
                $inc: {likes: 1}}
            )
            .then(() => res.status(200).json({ message: 'Like ajouté !'}))
            .catch(error => res.status(400).json({ error }));
        break;

        case 0:
            Sauce.findOne({_id: req.params.id})
                .then((sauce) => {

                    if (sauce.usersLiked.includes(userId)) {
                        console.log('Je suis un like')
                        Sauce.updateOne(
                            { _id: req.params.id },
                            {$pull: {usersLiked: userId},
                            $inc: {likes: -1}}
                        )
                        .then(() => res.status(200).json({ message: 'Like retiré !'}))
                        .catch(error => res.status(400).json({ error }));
                    }

                    if (sauce.usersDisliked.includes(userId)) {
                        console.log('Je suis un dislike')
                        Sauce.updateOne(
                            { _id: req.params.id }, 
                            {$pull: { usersDisliked: userId}, 
                            $inc: { dislikes: -1} }
                            
                        )
                        .then(() => res.status(200).json({ message: 'Dislike retiré !'}))
                        .catch(error => res.status(400).json({ error }));
                    } 
                })
                break;

        case -1:
            Sauce.updateOne(
                { _id: req.params.id }, 
                {$push: {usersDisliked: userId},
                $inc: {dislikes: 1}}
            )
            .then(() => res.status(200).json({ message: 'Like ajouté !'}))
            .catch(error => res.status(400).json({ error }));
        break;
      }
  });
  
}




  