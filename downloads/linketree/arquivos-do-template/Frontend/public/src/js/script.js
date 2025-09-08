const apiUrl = window.API_URL;

// Função de carregamento do perfil
async function carregarPerfil() {
  try {
    const res = await fetch(`${apiUrl}/api/perfil`);
    const perfil = await res.json();

    // Atualiza página pública
    if (document.getElementById("nomePerfil")) {
      document.getElementById("nomePerfil").textContent = perfil.name || "";
      document.getElementById("bioPerfil").textContent = perfil.bio || "";
      document.querySelector("footer").textContent = perfil.footer || "";
      document.title = `Links for - ${perfil.name || "Usuário"}`;

      const avatar = document.querySelector(".avatar img");
      if (avatar && perfil.imageUrl) avatar.src = perfil.imageUrl;
    }

    // Atualiza painel
    if (document.getElementById("form-perfil")) {
      document.getElementById("nome").value = perfil.name || "";
      document.getElementById("bio").value = perfil.bio || "";
      document.getElementById("footer").value = perfil.footer || "";
      const avatarEl = document.getElementById("imagemAtual");
      if (avatarEl) {
        if (perfil.imageUrl) {
          avatarEl.src = perfil.imageUrl;
          avatarEl.style.display = "block";
        } else {
          avatarEl.style.display = "none";
        }
      }
    }
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

// Função de carregar links (para página pública ou painel)
async function carregarLinks() {
  try {
    const res = await fetch(`${apiUrl}/api/links`);
    const links = await res.json();
    const container = document.getElementById("links");
    if (!container) return;

    container.innerHTML = "";
    links.forEach((link) => {
      const a = document.createElement("a");
      a.className = "link-item";
      a.href = link.url;
      a.textContent = link.title;
      a.target = "_blank";
      container.appendChild(a);
    });
  } catch (err) {
    console.error("Erro ao carregar links:", err);
  }
}

// Converte imagem para base64 e envia para API
async function uploadImage(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch(
    `${apiUrl}/api/upload-image`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64 }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao enviar imagem");
  return data.url;
}

// Inicia scripts após DOM carregado
document.addEventListener("DOMContentLoaded", () => {
  carregarPerfil();
  carregarLinks();

  // FORM PERFIL
  const formPerfil = document.getElementById("form-perfil");
  if (formPerfil) {
    formPerfil.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById("nome").value;
      const bio = document.getElementById("bio").value;
      const footer = document.getElementById("footer").value;

      await fetch(`${apiUrl}/api/perfil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, footer }),
      });

      alert("Perfil salvo!");
      carregarPerfil();
    };
  }

  // FORM AVATAR
  const formAvatar = document.getElementById("form-avatar");
  if (formAvatar) {
    formAvatar.onsubmit = async (e) => {
      e.preventDefault();
      const file = document.getElementById("avatarInput").files[0];
      if (!file) return alert("Selecione uma imagem.");

      const imageUrl = await uploadImage(file);
      const name = document.getElementById("nome").value;
      const bio = document.getElementById("bio").value;
      const footer = document.getElementById("footer").value;

      await fetch(`${apiUrl}/api/perfil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, footer, imageUrl }),
      });

      alert("Foto atualizada!");
      carregarPerfil();
    };
  }

  // EXCLUIR AVATAR
  const btnExcluir = document.getElementById("btnExcluirImagem");
  if (btnExcluir) {
    btnExcluir.onclick = async () => {
      const confirmar = confirm("Deseja remover a imagem?");
      if (!confirmar) return;

      const name = document.getElementById("nome").value;
      const bio = document.getElementById("bio").value;
      const footer = document.getElementById("footer").value;

      await fetch(`${apiUrl}/api/perfil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, footer, imageUrl: "" }),
      });

      alert("Imagem removida!");
      carregarPerfil();
    };
  }

  // FORM LINK (painel)
  const formLink = document.getElementById("form-link");
  if (formLink) {
    formLink.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const url = document.getElementById("url").value;
      const id = document.getElementById("linkId").value;

      if (id) {
        await fetch(`${apiUrl}/api/links/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url }),
        });
      } else {
        await fetch(`${apiUrl}/api/links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url }),
        });
      }

      formLink.reset();
      document.getElementById("linkId").value = "";
      carregarLinks();
    };

    // Renderizar botões de edição e exclusão
    setTimeout(async () => {
      const res = await fetch(
        `${apiUrl}/api/links`
      );
      const links = await res.json();
      const container = document.getElementById("links");

      container.innerHTML = "";
      links.forEach((link) => {
        const div = document.createElement("div");
        div.className = "link-item";

        const info = document.createElement("div");
        info.className = "link-info";
        info.innerHTML = `<strong>${link.title}</strong><br><a href="${link.url}" target="_blank">${link.url}</a>`;

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "✏️";
        btnEdit.onclick = () => {
          document.getElementById("title").value = link.title;
          document.getElementById("url").value = link.url;
          document.getElementById("linkId").value = link._id;
        };

        const btnDel = document.createElement("button");
        btnDel.textContent = "🗑️";
        btnDel.onclick = async () => {
          const confirmar = confirm("Confirma a exclusão?");
          if (!confirmar) return;
          await fetch(
            `${apiUrl}/api/links/${link._id}`,
            { method: "DELETE" }
          );
          carregarLinks();
        };

        div.appendChild(info);
        div.appendChild(btnEdit);
        div.appendChild(btnDel);
        container.appendChild(div);
      });
    }, 500);
  }
});