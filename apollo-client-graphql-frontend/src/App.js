import { useQuery } from '@apollo/client'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import {ALL_PERSONS} from './queries'

const App = () => {
  const result = useQuery(ALL_PERSONS)

  if (result.loading) {
    return <div>loading data</div>
  }

  return (
    <>
      <PersonForm />
      <Persons persons={result.data.allPersons} />
    </>
  )
}

export default App