import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import './index.css'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <Header />
      <HomePage />
      <Footer />
    </div>
  )
}
