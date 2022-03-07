const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const serviceAccount = require("./cloud-gql-firebase-adminsdk-d7urn-e61849b63f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cloud-gql.firebaseio.com",
});

const db = admin.firestore();
const catsDb = db.collection("cats");

const typeDefs = gql`
  type Cat {
    name: String!
    lifespan: String!
  }

  type Query {
    cats: [Cat]
  }
`;

const resolvers = {
  Query: {
    cats: async () => {
      const cats = await db.collection("cats").get();
      return cats.docs.map((cat: any) => cat.data()) as any[];
    },
  },
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.start().then((res: Response) => {
  server.applyMiddleware({ app, path: "/", cors: true });
});

exports.graphql = functions.https.onRequest(app);
