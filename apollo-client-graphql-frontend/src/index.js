import ReactDOM from 'react-dom/client'
import App from './App'

import { 
  ApolloClient, ApolloProvider, InMemoryCache, gql, createHttpLink, 
  split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import {getMainDefinition} from "@apollo/client/utilities"
import {GraphQLWsLink} from "@apollo/client/link/subscriptions"
import {createClient} from "graphql-ws"

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonenumbers-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null
    }
  }
})

const httpLink = createHttpLink({
  uri: 'https://fullstack-open-part-8-learn.myatkaungkyaw.repl.co',
})

const wsLink = new GraphQLWsLink(
  createClient({url:'ws://localhost:4000'})
)

const splitLink = split(
  ({query}) => {
    const definiton = getMainDefinition(query)
    return(
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

const query = gql`
  query {
    allPersons  {
      name,
      phone,
      address {
        street,
        city
      }
      id
    }  
  }
`

client.query({ query })
  .then((response) => {
    console.log(response.data)
  })


ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)