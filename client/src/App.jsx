import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './utils/stripe';
import AppRouter from './router/AppRouter';
import './index.css';

function App() {
  return (
    <Elements stripe={stripePromise}>
      <AppRouter />
    </Elements>
  );
}

export default App;