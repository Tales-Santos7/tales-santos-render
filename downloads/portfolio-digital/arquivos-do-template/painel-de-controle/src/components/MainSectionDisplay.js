import React, { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const MainSectionDisplay = () => {
  const [mainSection, setMainSection] = useState(null);

  useEffect(() => {
    // Carregar a seção principal
    const fetchMainSection = async () => {
      try {
        const response = await axios.get(`${apiUrl}/content/mainSection`);
        setMainSection(response.data);
      } catch (error) {
        console.error("Erro ao carregar a seção principal:", error);
      }
    };

    fetchMainSection();
  }, []);

  if (!mainSection) {
    return <p> </p>;
  }
};
export default MainSectionDisplay;
