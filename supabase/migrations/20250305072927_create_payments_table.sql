CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Unique payment ID
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- Reference to the users table (cascade deletes if user is deleted)
    stripe_payment_intent_id text,  -- Stripe payment intent ID (used to track payments on Stripe)
    amount integer NOT NULL,  -- Amount for the payment (in cents or smallest currency unit)
    status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),  -- Payment status with possible values
    payment_date timestamp DEFAULT current_timestamp,  -- Date of payment (defaults to current time)
    created_at timestamp DEFAULT current_timestamp,  -- Time when the payment record was created
    updated_at timestamp DEFAULT current_timestamp,  -- Time when the payment record was last updated
    UNIQUE(user_id, stripe_payment_intent_id)  -- Ensure each user can only have one unique payment intent ID at a time
);

-- To ensure that the updated_at field is automatically updated when the row is updated
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
