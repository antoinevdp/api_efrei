import axios from 'axios';

const RANDOMMER_API_KEY = 'b4a95ecc867f4c6496b36e35bb43e654'; // Remplace par ta clé

async function fetchRandomUser() {
  const res = await axios.get('https://randomuser.me/api/?nat=fr');
  const data = res.data.results[0];
  return {
    name: `${data.name.first} ${data.name.last}`,
    email: data.email,
    gender: data.gender,
    location: `${data.location.city}, ${data.location.country}`,
    picture: data.picture.large
  };
}

async function fetchRandommerPhone() {
  const res = await axios.get('https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1', {
    headers: { 'X-Api-Key': RANDOMMER_API_KEY }
  });
  return res.data[0];
}

async function fetchRandommerIban() {
  const res = await axios.get('https://randommer.io/api/Finance/Iban/FR', {
    headers: { 'X-Api-Key': RANDOMMER_API_KEY }
  });
  return res.data;
}

async function fetchCreditCard() {
  const res = await axios.get('https://randommer.io/api/Card', {
    headers: { 'X-Api-Key': RANDOMMER_API_KEY }
  });
  const card = res.data;
  return {
    card_number: card.cardNumber,
    card_type: card.type,
    expiration_date: card.date,
    cvv: card.cvv
  };
}

async function fetchRandommerName() {
  const res = await axios.get('https://randommer.io/api/Name?nameType=firstname&quantity=1', {
    headers: { 'X-Api-Key': RANDOMMER_API_KEY }
  });
  return res.data[0];
}

async function fetchQuote() {
  const res = await axios.get('https://api.quotable.io/random');
  return {
    content: res.data.content,
    author: res.data.author
  };
}

async function fetchJoke() {
  const res = await axios.get('https://v2.jokeapi.dev/joke/Programming?type=single');
  return {
    type: res.data.category,
    content: res.data.joke
  };
}

async function createFullProfile() {
  try {
    const user = await fetchRandomUser();
    const phone = await fetchRandommerPhone();
    const iban = await fetchRandommerIban();
    const creditCard = await fetchCreditCard();
    const name = await fetchRandommerName();
    const joke = await fetchJoke();

    const profile = {
      user,
      phone_number: phone,
      iban,
      credit_card: creditCard,
      name,q
      joke
    };

    console.log(JSON.stringify(profile, null, 2));
  } catch (err) {
    console.error('❌ Erreur lors de la génération du profil :', err.message);
  }
}

createFullProfile();
