const apiUrl = window.API_URL;

// COR DO SITE
fetch(`${apiUrl}/content/theme`)
  .then((res) => res.json())
  .then((data) => {
    if (data.color) {
      document.documentElement.style.setProperty("--primary-color", data.color);
    }
  });

// Nome do site (titulo + rodapé)
fetch(`${apiUrl}/content/site-name`)
  .then((res) => {
    if (!res.ok) throw res;
    return res.json();
  })
  .then((data) => {
    document.title = data.title;
    const footerAnchor = document.querySelector("p.direitos a");
    if (footerAnchor) footerAnchor.textContent = data.title;
  })
  .catch((err) => {
    if (err.status !== 404) console.error("Erro site-name", err);
  });

// ÍCONES DO NAV E MENU MOBILE
document.addEventListener("DOMContentLoaded", () => {
  fetch(`${apiUrl}/social-links`)
    .then((res) => res.json())
    .then((links) => {
      const top = document.getElementById("social-icons-top");
      const bottom = document.getElementById("social-icons-bottom");

      if (!top || !bottom) return;

      top.innerHTML = "";
      bottom.innerHTML = "";

      links.forEach((link) => {
        const iconName = link.name.toLowerCase();
        const iconClass = `ri-${iconName}-fill`;

        const li = document.createElement("li");
        li.innerHTML = `<a href="${link.url}" target="_blank"><i class="${iconClass} social"></i></a>`;
        top.appendChild(li);

        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.className = "fim-drop";
        a.innerHTML = `<i class="${iconClass}"></i>`;
        bottom.appendChild(a);
      });
    })
    .catch((error) => console.error("Erro ao carregar redes sociais:", error));
});

// LOGO TEXTO DO NAV
fetch(`${apiUrl}/content/logo`)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("logo-container");
    const title = data.title || "USER";
    const description = data.description || "Lifestyle - Beauty - Study";
    container.innerHTML = `<span>${title}</span><br><small>${description}</small>`;
  })
  .catch((error) => console.error("Erro ao carregar logo:", error));

// FAVICON
document.addEventListener("DOMContentLoaded", () => {
  fetch(`${apiUrl}/content/favicon`)
    .then((res) => res.json())
    .then((data) => {
      if (data.images && data.images.length > 0) {
        const faviconUrl = data.images[0] + "?t=" + Date.now();

        let favicon = document.querySelector("link[rel='icon']");
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }

        favicon.type = "image/png";
        favicon.href = faviconUrl;
      }
    })
    .catch((err) => console.warn("Erro ao carregar favicon:", err));
});

// LOGO-IMAGEM DO RODAPÉ
window.addEventListener("DOMContentLoaded", () => {
  fetch(`${apiUrl}/content/footer-logo`)
    .then((res) => res.json())
    .then((data) => {
      const logoImg = document.getElementById("footer-logo");
      if (logoImg && data.images?.length > 0) {
        logoImg.src = data.images[0];
      }
    })
    .catch((err) => console.error("Erro ao carregar logo:", err));
});

// HERO IMAGE + SEÇÃO PRINCIPAL
fetch(`${apiUrl}/content/hero`)
  .then((res) => res.json())
  .then((data) => {
    const heroImage = document.getElementById("hero-photo");
    const heroImageDropdown = document.getElementById("hero-photo-dropdown"); // NOVO

    if (data.images && data.images.length > 0) {
      const imageUrl = data.images[0];

      if (heroImage) {
        heroImage.src = imageUrl;
        heroImage.style.display = "block";
      }

      if (heroImageDropdown) {
        heroImageDropdown.src = imageUrl;
        heroImageDropdown.style.display = "block";
      }
    }
  })
  .catch((error) => console.error("Erro ao carregar imagem da hero:", error));

fetch(`${apiUrl}/content/mainSection`)
  .then((response) => {
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    document.querySelector("h1").innerText = data.title;
    document.querySelector("p").innerText = data.description;
  })
  .catch((error) => console.error("Erro ao carregar conteúdo:", error));

// GALERIA
fetch(`${apiUrl}/content/gallery`)
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("galeria-container");
    data.images.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Imagem da galeria";
      img.classList.add("imagem-galeria");
      container.appendChild(img);
    });
  })
  .catch((error) => console.error("Erro ao carregar galeria:", error));

// SOBRE MIM
fetch(`${apiUrl}/content/about`)
  .then((response) => response.json())
  .then((data) => {
    document.querySelector("#about-title").innerText = data.title;
    document.querySelector("#about-description").innerText = data.description;
  })
  .catch((error) => console.error('Erro ao carregar "Sobre Mim":', error));

// BLOG
const postsPerPage = 8;
let currentPage = 1;
let allPosts = [];

function renderPosts() {
  const container = document.getElementById("blog-posts-container");
  container.innerHTML = "";
  const endIndex = postsPerPage * currentPage;
  const visiblePosts = allPosts.slice(0, endIndex);

  visiblePosts.forEach((post) => {
    const postDate = new Date(post.createdAt);
    const formattedDate = isNaN(postDate)
      ? "Data inválida"
      : postDate.toLocaleDateString("pt-BR");
    const postElement = document.createElement("div");
    postElement.classList.add("post");
    postElement.innerHTML = `
      <img src="${post.imageUrl}" alt="${post.title}" class="post-image">
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <p class="post-date">Publicado em: ${formattedDate}</p>
      <a href="post.html?id=${post._id}" class="btn-post">Leia Mais</a>
    `;
    container.appendChild(postElement);
  });

  document.getElementById("load-more").style.display =
    endIndex < allPosts.length ? "inline-block" : "none";
  document.getElementById("show-less").style.display =
    currentPage > 1 ? "inline-block" : "none";
}

fetch(`${apiUrl}/blog`)
  .then((response) => response.json())
  .then((posts) => {
    allPosts = posts;
    renderPosts();
  })
  .catch((error) => console.error("Erro ao carregar os posts do blog:", error));

document.getElementById("load-more").addEventListener("click", () => {
  currentPage++;
  renderPosts();
});

document.getElementById("show-less").addEventListener("click", () => {
  currentPage = 1;
  renderPosts();
  window.scrollTo({
    top: document.getElementById("blog").offsetTop,
    behavior: "smooth",
  });
});

// RODAPÉ - REDES SOCIAIS
fetch(`${apiUrl}/social-links`)
  .then((response) => response.json())
  .then((links) => {
    const socialList = document.querySelector(".rodape-col-4 ul");
    if (!socialList) return;
    socialList.innerHTML = "";

    links.forEach((link) => {
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.textContent = link.name;
      anchor.target = "_blank";
      listItem.appendChild(anchor);
      socialList.appendChild(listItem);
    });
  })
  .catch((error) => console.error("Erro ao carregar redes sociais:", error));
