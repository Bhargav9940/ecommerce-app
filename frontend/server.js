const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config();
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(cookieParser());

app.get('/config.js', (req, res) => {
  res.type("application/javascript");
  res.send(`window.CONFIG = { BACKEND_BASE_URL: "${process.env.BACKEND_BASE_URL}",
                              FRONTEND_BASE_URL: "${process.env.FRONTEND_BASE_URL}",
                              PORT: "${process.env.PORT}"};`);
});

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/navbar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'navbar.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/user/login', (req, res) => {
  res.sendFile(path.join(__dirname,'login.html'));
});

app.get('/user/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/user/logout', async (req, res) => {
  try {
    const token = req.cookies.token;
    if(!token) {
      return res.redirect("/home");
    }

    const logOutRes = await fetch(`${process.env.BACKEND_BASE_URL}/user/logout`, {
      method: 'POST',             // Ensure method matches backend
      headers: {
        'Cookie': `token=${token}`
      },
      credentials: 'include',      // Include cookies in the request
    });

    if (logOutRes.status === 200) {
      res.clearCookie('token');
      return res.redirect('/home'); // Redirect to home page after successful logout
    } else {
      const errorData = await logOutRes.json();
      return res.send(`
        <h2>Status Code: ${logOutRes.status}</h2>
        <h3>Error: ${errorData.message}</h3>
      `);
    }
  } catch (error) {
    console.error('Error logging out:', error);
    return res.status(500).send('Internal server error');
  }
});

app.get('/product/all', (req, res) => {
  res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/product/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, `product.html`));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, `cart.html`));
});

app.get('/cart/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
})

app.get('/my-orders', (req, res) => {
  res.sendFile(path.join(__dirname, `myorders.html`));
})

app.get('/my-order/details', (req, res) => {
  res.sendFile(path.join(__dirname, `myOrderDetail.html`));
});

app.get('/my-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'myProfile.html'));
});
app.get('/my-profile/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'editProfile.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
