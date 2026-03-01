//DOM elements
const passwordInput = document.getElementById("senha");
const passwordToggle = document.getElementById("password-toggle");
const usernameInput = document.getElementById("usuario");
const loginButton = document.querySelector(".btn-entrar");

// Funcionalidade para mostrar/ocultar senha
if (passwordToggle) {
  passwordToggle.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Alterna o ícone do olho
    const eyeIcon = this.querySelector(".eye-icon");
    if (type === "text") {
      eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
    } else {
      eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
    }
  });
}

// Função para mostrar mensagem de erro
function showError(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.classList.add("show");

  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    errorElement.classList.remove("show");
  }, 5000);
}

// Função para mostrar mensagem de sucesso
function showSuccess(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.style.color = "#00b12c";
  errorElement.style.backgroundColor = "rgba(0, 177, 44, 0.1)";
  errorElement.style.borderColor = "rgba(0, 177, 44, 0.3)";
  errorElement.classList.add("show");

  // Remove a mensagem após 3 segundos
  setTimeout(() => {
    errorElement.classList.remove("show");
    errorElement.style.color = "#ff4444";
    errorElement.style.backgroundColor = "rgba(255, 68, 68, 0.1)";
    errorElement.style.borderColor = "rgba(255, 68, 68, 0.3)";
  }, 3000);
}

// Função para mostrar loading
function showLoading(show = true) {
  const loadingElement = document.getElementById("loading");
  const submitButton = document.querySelector(".btn-entrar");

  if (show) {
    loadingElement.style.display = "flex";
    submitButton.disabled = true;
    submitButton.style.opacity = "0.7";
  } else {
    loadingElement.style.display = "none";
    submitButton.disabled = false;
    submitButton.style.opacity = "1";
  }
}

// Validação de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação em tempo real dos inputs
document.getElementById("usuario").addEventListener("input", function () {
  const value = this.value.trim();
  const wrapper = this.closest(".input-wrapper");

  if (value.length > 0) {
    if (value.includes("@") && !isValidEmail(value)) {
      wrapper.style.borderColor = "#ff4444";
    } else {
      wrapper.style.borderColor = "var(--cor3)";
    }
  } else {
    wrapper.style.borderColor = "transparent";
  }
});

document.getElementById("senha").addEventListener("input", function () {
  const value = this.value;
  const wrapper = this.closest(".input-wrapper");

  if (value.length > 0) {
    if (value.length < 6) {
      wrapper.style.borderColor = "#ff9800";
    } else {
      wrapper.style.borderColor = "var(--cor3)";
    }
  } else {
    wrapper.style.borderColor = "transparent";
  }
});

// Animação de entrada dos elementos
document.addEventListener("DOMContentLoaded", function () {
  const inputGroups = document.querySelectorAll(".input-group");
  const formOptions = document.querySelector(".form-options");
  const submitButton = document.querySelector(".btn-entrar");

  // Anima os inputs com delay
  inputGroups.forEach((group, index) => {
    group.style.opacity = "0";
    group.style.transform = "translateY(20px)";

    setTimeout(() => {
      group.style.transition = "all 0.5s ease";
      group.style.opacity = "1";
      group.style.transform = "translateY(0)";
    }, 200 + index * 100);
  });

  // Anima as opções do formulário
  setTimeout(() => {
    formOptions.style.opacity = "0";
    formOptions.style.transform = "translateY(20px)";
    formOptions.style.transition = "all 0.5s ease";
    formOptions.style.opacity = "1";
    formOptions.style.transform = "translateY(0)";
  }, 500);

  // Anima o botão
  setTimeout(() => {
    submitButton.style.opacity = "0";
    submitButton.style.transform = "translateY(20px)";
    submitButton.style.transition = "all 0.5s ease";
    submitButton.style.opacity = "1";
    submitButton.style.transform = "translateY(0)";
  }, 600);
});

// Lembrar usuário
function saveUserData() {
  const rememberCheckbox = document.getElementById("remember");
  const usuario = document.getElementById("usuario").value;

  if (rememberCheckbox.checked && usuario) {
    localStorage.setItem("rememberedUser", usuario);
  } else {
    localStorage.removeItem("rememberedUser");
  }
}

// Carregar dados salvos
function loadSavedData() {
  const savedUser = localStorage.getItem("rememberedUser");
  if (savedUser) {
    document.getElementById("usuario").value = savedUser;
    document.getElementById("remember").checked = true;
  }
}

function hideLoading() {
  showLoading(false);
}

// Carrega dados salvos ao inicializar
loadSavedData();

document.getElementById("form-login").addEventListener("submit", function (e) {
  e.preventDefault();

  const errorMessageElement = document.getElementById("error-message");
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Limpa mensagens de erro anteriores
  errorMessageElement.classList.remove("show");

  // Validações básicas
  if (!username) {
    showError("Por favor, digite seu usuário ou e-mail");
    return;
  }

  if (!password) {
    showError("Por favor, digite sua senha");
    return;
  }

  if (password.length < 3) {
    showError("A senha deve ter pelo menos 3 caracteres");
    return;
  }

  if (username.includes("@") && !isValidEmail(username)) {
    showError("Por favor, digite um e-mail válido");
    return;
  }

  // Salva dados se "lembrar-me" estiver marcado
  saveUserData();

  // Mostra loading
  showLoading(true);

  // Simula chamada para o servidor
  fetch("./back/login/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `usuario=${encodeURIComponent(username)}&senha=${encodeURIComponent(
      password
    )}`,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      hideLoading();

      if (data.success) {
        showSuccess(data.message || "Login realizado com sucesso!");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        showError(data.message || "Erro no Login. Tente novamente.");
      }
    })
    .catch((error) => {
      hideLoading();
      console.log("Erro no fetch:", error);
      showError(
        "Erro na comunicação com o servidor. Tente novamente mais tarde."
      );
    });
});
