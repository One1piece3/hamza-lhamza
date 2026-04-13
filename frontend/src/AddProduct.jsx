import { useState } from "react";
import axios from "axios";
import { API_URL } from "./api";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    size: "",
    color: "",
    is_featured: false,
  });

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);
    data.append("size", formData.size);
    data.append("color", formData.color);
    data.append("is_featured", formData.is_featured ? 1 : 0);

    for (let i = 0; i < images.length; i++) {
      data.append("images[]", images[i]);
    }

    try {
      const response = await axios.post(
        `${API_URL}/products`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        size: "",
        color: "",
        is_featured: false,
      });

      setImages([]);
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'ajout du produit");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Ajouter un produit</h1>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Nom du produit"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Prix"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Categorie"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="size"
          placeholder="Taille"
          value={formData.size}
          onChange={handleChange}
        />

        <input
          type="text"
          name="color"
          placeholder="Couleur"
          value={formData.color}
          onChange={handleChange}
        />

        <label>
          <input
            type="checkbox"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
          />
          Produit mis en avant
        </label>

        <input
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
          required
        />

        <button type="submit">Ajouter le produit</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
};

