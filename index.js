const express = require('express');
const axios = require('axios');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HUBSPOT_ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS;
const HUBSPOT_API_URL = "https://api.hubapi.com";

console.log(
  'Token loaded:',
  HUBSPOT_ACCESS_TOKEN ? `YES (length ${HUBSPOT_ACCESS_TOKEN.length})` : 'NO'
);

// -------------------------------------------
// ROUTE 1 — Homepage (list contacts)
// -------------------------------------------
app.get('/', async (req, res) => {
  const contactsUrl = `${HUBSPOT_API_URL}/crm/v3/objects/contacts`;

  try {
    const response = await axios.get(contactsUrl, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const contacts = response.data.results || [];

    res.render('homepage', {
      title: 'Contacts | HubSpot',
      contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error.response?.data || error.message);
    res.status(500).send('Error fetching contacts');
  }
});

// -------------------------------------------
// ROUTE 2 — Show form to create/update a contact
// -------------------------------------------
app.get('/edit-contact', (req, res) => {
  res.render('updateForm', {
    title: 'Create or Update Contact',
  });
});

// -------------------------------------------
// ROUTE 3 — Create new contact in HubSpot
// -------------------------------------------
app.post('/save-contact', async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;

  const contactData = {
    properties: {
      firstname,
      lastname,
      email,
      phone,
    },
  };

  try {
    const response = await axios.post(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
      contactData,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Contact created:', response.data);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating contact:', error.response?.data || error.message);
    res.status(500).send('Error creating contact');
  }
});

// -------------------------------------------
// SERVER
// -------------------------------------------
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
