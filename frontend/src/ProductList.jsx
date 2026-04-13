import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, STORAGE_URL } from "./api";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Liste des produits</h1>

      <div style={styles.grid}>
        {products.map((product) => {
          const mainImage = product.images.find((img) => img.is_main) || product.images[0];

          return (
            <div key={product.id} style={styles.card}>
              {mainImage && (
                <img
                  src={`${STORAGE_URL}/${mainImage.image_path}`}
                  alt={product.name}
                  style={styles.image}
                />
              )}

              <h2>{product.name}</h2>
              <p><strong>Prix :</strong> {product.price} DH</p>
              <p><strong>Categorie :</strong> {product.category}</p>
              <p><strong>Couleur :</strong> {product.color}</p>
              <p><strong>Taille :</strong> {product.size}</p>
              <p><strong>Stock :</strong> {product.stock}</p>

              {product.stock === 0 ? (
                <p style={{ color: "red", fontWeight: "bold" }}>Rupture de stock</p>
              ) : product.stock <= 3 ? (
                <p style={{ color: "orange", fontWeight: "bold" }}>
                  Dernieres pieces : {product.stock}
                </p>
              ) : (
                <p style={{ color: "green", fontWeight: "bold" }}>En stock</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};
