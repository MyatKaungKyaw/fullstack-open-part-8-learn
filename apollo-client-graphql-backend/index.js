const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const express = require('express')
const bodyParser = require('body-parser-graphql')
const cors = require('cors')
const http = require('http')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

const mongoose = require('mongoose')

const Person = require('./models/Person')
const User = require('./models/User')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

mongoose.set('strictQuery', false)


const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const schema = makeExecutableSchema({typeDefs,resolvers,})
  const serverCleanup = useServer({schema},wsServer)
  
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({httpServer}),
      {
        async serverWillStart(){
          return {
            async drainSever(){
              await serverCleanup.dispose()
            }
          }
        }
      }
    ]
  })

  await server.start()

  app.use(
    '/',
    cors(),
    // bodyParser.graphql(),
    // bodyParser.text({type: 'application/graphql'}),
    express.json(),
    // express.text({type: 'application/graphql'}),
    expressMiddleware(server,{
      context: async ({ req, res }) => {   
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(     
            auth.substring(7), process.env.JWT_SECRET  
            )     
            const currentUser = await User 
            .findById(decodedToken.id).populate('friends')
            return { currentUser } 
          } 
        }
      })
  )

  const PORT = 4000
  httpServer.listen(PORT,() =>{
    console.log(`Server is now running on http://localhost:${PORT}`)
  })
}

start()


// const { ApolloServer } = require('@apollo/server')
// const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
// const { expressMiddleware } = require('@apollo/server/express4')
// const { makeExecutableSchema } = require('@graphql-tools/schema')

// const { WebSocketServer } = require('ws')
// const { useServer } = require('graphql-ws/lib/use/ws')

// const http = require('http')
// const express = require('express')
// const bodyParser = require('body-parser')
// const cors = require('cors')

// const jwt = require('jsonwebtoken')
// const mongoose = require('mongoose')
// mongoose.set('strictQuery', false)
// const Person = require('./models/Person')
// const User = require('./models/Person')

// const typeDefs = require('./schema')
// const resolvers = require('./resolvers')

// require('dotenv').config()

// const MONGODB_URI = process.env.MONGODB_URI

// console.log('connecting to', MONGODB_URI)

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     console.log('connected to MongoDB')
//   })
//   .catch((error) => {
//     console.log('error connection to MongoDB:', error.message)
//   })


// // setup is now within a function
// const start = async () => {
//   const app = express()
//   const httpServer = http.createServer(app)

//   const wsServer = new WebSocketServer({
//     server: httpServer,
//     path: '/',
//   })
  
//   const schema = makeExecutableSchema({ typeDefs, resolvers })
//   const serverCleanup = useServer({ schema }, wsServer);

//   const server = new ApolloServer({
//     schema,
//     plugins: [
//       ApolloServerPluginDrainHttpServer({ httpServer }),
//       {
//         async serverWillStart() {
//           return {
//             async drainServer() {
//               await serverCleanup.dispose();
//             },
//           };
//         },
//       },
//     ],
//   })

//   await server.start()

//   app.use(
//     '/',
//     cors(),
//     express.json(),
//     expressMiddleware(server, {
//       context: async ({ req }) => {
//         const auth = req ? req.headers.authorization : null
//         if (auth && auth.startsWith('Bearer ')) {
//           const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
//           const currentUser = await User.findById(decodedToken.id).populate(
//             'friends'
//           )
//           return { currentUser }
//         }
//       },
//     }),
//   )

//   const PORT = 4000

//   httpServer.listen(PORT, () =>
//     console.log(`Server is now running on http://localhost:${PORT}`)
//   )
// }

// start()