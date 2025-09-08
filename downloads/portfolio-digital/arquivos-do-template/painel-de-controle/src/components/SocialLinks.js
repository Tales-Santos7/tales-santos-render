import React, { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

function SocialLinks() {
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/social-links`)
      .then((response) => setSocialLinks(response.data))
      .catch((error) => console.error("Erro ao buscar redes sociais:", error));
  }, []);

  return (
    <div className="rodape-col-4">
      <h3>Redes Sociais</h3>
      <ul>
        {socialLinks.map((link) => (
          <li key={link._id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SocialLinks;
