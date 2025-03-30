const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch('../data/users.json');
      const users = await res.json();

      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'compte.html';
      } else {
        errorMsg.textContent = "Email ou mot de passe incorrect.";
      }

    } catch (err) {
      errorMsg.textContent = "Erreur de chargement des utilisateurs.";
      console.error(err);
    }
  });
}

