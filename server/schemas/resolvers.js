const { User } = require('../models');
const { signToken } = require('../utils/auth');

// TODO: #2 AFTER typeDefs
const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {// if there's logged in user with context, login
                const user = await User.findOne({ _id: context.user._id })
                return user;
            }
            throw new Error('Not logged in!');
        }
    },
    Mutation: {
        addUser: async (parent, args) => { // if user is not logged in, there's no need for context
            const user = await User.create(args); // args holds all the info from the front end
            const token = signToken(user);

            return { user, token };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('This email address does not exist');
            }
            const correctPassword = await user.isCorrectPassword(password);
            if(!correctPassword) {
                throw new Error('User info is not correct, please try again dummy');
            }

            const token = signToken(user);

            return { user, token };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData }},
                    { new: true }
                )
                return user;
            }
            throw new Error('You need to be logged in!');
        },
        removeBook: async(parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId }},
                    { new: true }
                )
                return user;
            }
            throw new Error('You need to be logged in!');
        }
    }
};




module.exports = resolvers;