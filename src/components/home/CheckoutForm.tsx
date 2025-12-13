
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm = ({ clientSecret, onSuccess, onCancel }: CheckoutFormProps) => {
  const options = { 
    clientSecret,
    onComplete: () => {
      // This is called when the checkout is successfully completed
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;
