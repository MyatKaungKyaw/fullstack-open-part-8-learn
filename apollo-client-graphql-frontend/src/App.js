import { useState } from 'react'
import { useQuery, useApolloClient, useSubscription } from '@apollo/client'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import PhoneForm from './components/PhoneForm'
import LoginForm from './components/LoginForm'
import { ALL_PERSONS, PERSON_ADDED } from './queries'

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()

  useSubscription(PERSON_ADDED,{
    onData:({data})=>{
      console.log(data)
    }
  })

  const notify = message => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <>
        <Notify message={errorMessage} />
        <LoginForm
          setToken={setToken}
          setError={notify}
        />
      </>
    )
  }

  if (result.loading) {
    return <div>loading data</div>
  }

  return (
    <>
      <Notify message={errorMessage} />
      <button onClick={logout}>logout</button>
      <Persons persons={result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </>
  )
}

const Notify = ({ message }) => {
  if (!message) {
    return null
  }

  return (
    <div style={{ color: 'red' }}>{message}</div>
  )
}

export default App