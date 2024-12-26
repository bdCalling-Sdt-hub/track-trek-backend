const createPaymentIntent = async (payload) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(dollars * 100),
    currency: "usd",
    payment_method_types: ["card"],
  });

  console.log(paymentIntent);
};

const stripeService = { createPaymentIntent };

module.exports = { stripeService };
