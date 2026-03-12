CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL UNIQUE REFERENCES bookings(id),
  client_id       UUID NOT NULL REFERENCES profiles(id),
  contractor_id   UUID NOT NULL REFERENCES contractors(id),
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_contractor ON reviews (contractor_id);

-- Auto-update contractor rating on new review
CREATE OR REPLACE FUNCTION update_contractor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contractors SET
    rating_avg = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews WHERE contractor_id = NEW.contractor_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews WHERE contractor_id = NEW.contractor_id
    )
  WHERE id = NEW.contractor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_contractor_rating();
