import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Package,
  Star,
  Trash2,
  Pencil,
  Eye,
  ShoppingBag,
  ImagePlus,
  LayoutDashboard,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  LogOut,
  ClipboardList,
  CheckCircle2,
  Truck,
  Phone,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAdminAuthHeaders } from "./adminSession";
import { API_URL, STORAGE_URL, getApiErrorMessage } from "./api";

const PRODUCTS_API_URL = `${API_URL}/products`;
const ORDERS_API_URL = `${API_URL}/orders`;
const ORDER_STATS_API_URL = `${API_URL}/orders/stats`;

export default function AdminPanel({ onLogout, onGoToShop, onSessionExpired }) {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    revenue_total: 0,
    orders_today: 0,
    average_order_value: 0,
    top_products: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageMainIndex, setImageMainIndex] = useState(0);

  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [overviewImageIndexes, setOverviewImageIndexes] = useState({});
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    size: "",
    color: "",
    featured: false,
    images: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchDashboardStats();
  }, []);

  const handleAdminUnauthorized = (error, fallbackMessage = "") => {
    if (error?.response?.status === 401) {
      onSessionExpired?.({
        reason: "session_expired",
        message: "Session admin expiree. Merci de vous reconnecter.",
      });
      return true;
    }

    if (fallbackMessage) {
      setMessage(fallbackMessage);
    }

    return false;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setProductError("");
      const response = await axios.get(PRODUCTS_API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Erreur chargement produits :", error);
      const nextMessage = getApiErrorMessage(error, "Erreur lors du chargement des produits");
      setProductError(nextMessage);
      handleAdminUnauthorized(error, nextMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");
      const response = await axios.get(ORDERS_API_URL, {
        headers: getAdminAuthHeaders(),
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Erreur chargement commandes :", error);
      const nextMessage = getApiErrorMessage(error, "Erreur lors du chargement des commandes");
      setOrdersError(nextMessage);
      handleAdminUnauthorized(error, nextMessage);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(ORDER_STATS_API_URL, {
        headers: getAdminAuthHeaders(),
      });
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Erreur chargement stats admin :", error);
      handleAdminUnauthorized(error);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    result = result.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );

    if (category !== "all") {
      result = result.filter((product) => product.category === category);
    }

    if (stockFilter === "in_stock") {
      result = result.filter((product) => product.stock > 3);
    }

    if (stockFilter === "low_stock") {
      result = result.filter((product) => product.stock > 0 && product.stock <= 3);
    }

    if (stockFilter === "out_of_stock") {
      result = result.filter((product) => product.stock === 0);
    }

    if (featuredFilter === "featured") {
      result = result.filter((product) => product.is_featured);
    }

    if (featuredFilter === "not_featured") {
      result = result.filter((product) => !product.is_featured);
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "stock_asc") {
      result.sort((a, b) => Number(a.stock) - Number(b.stock));
    }

    if (sortBy === "stock_desc") {
      result.sort((a, b) => Number(b.stock) - Number(a.stock));
    }

    if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortBy === "latest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, search, category, stockFilter, featuredFilter, sortBy]);

  const categories = [
    "all",
    ...new Set(
      products
        .map((p) => p.category)
        .filter((value) => value && value.trim() !== "")
    ),
  ];

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 3).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    featured: products.filter((p) => p.is_featured).length,
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = !orderSearch.trim() || [
        order.reference,
        order.customer_name,
        order.customer_phone,
        order.customer_email,
      ].filter(Boolean).some((value) => value.toLowerCase().includes(orderSearch.toLowerCase()));

      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      const orderDate = new Date(order.created_at);
      const matchesFrom = !orderDateFrom || orderDate >= new Date(orderDateFrom);
      const matchesTo = !orderDateTo || orderDate <= new Date(`${orderDateTo}T23:59:59`);

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [orders, orderSearch, orderStatusFilter, orderDateFrom, orderDateTo]);

  const orderStats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter((order) => order.status === "pending").length,
    confirmed: filteredOrders.filter((order) => order.status === "confirmed").length,
    shipping: filteredOrders.filter((order) => order.status === "shipping").length,
    delivered: filteredOrders.filter((order) => order.status === "delivered").length,
  };

  const getOrderStatusLabel = (status) => {
    if (status === "confirmed") return "Confirmee";
    if (status === "shipping") return "En livraison";
    if (status === "delivered") return "Livree";
    if (status === "cancelled") return "Annulee";
    return "En attente";
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
      return;
    }

    if (type === "file") {
      const nextFiles = Array.from(files || []);

      if (nextFiles.length > 6) {
        setFormErrors((prev) => ({ ...prev, images: "Maximum 6 images par produit." }));
        return;
      }

      if (nextFiles.some((file) => file.size > 2 * 1024 * 1024)) {
        setFormErrors((prev) => ({ ...prev, images: "Chaque image doit faire moins de 2 Mo." }));
        return;
      }

      setImageMainIndex(0);
      setFormErrors((prev) => ({ ...prev, images: "" }));
      setForm({ ...form, images: nextFiles });
      return;
    }

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setForm({ ...form, [name]: value });
  };

  const removeSelectedImage = (indexToRemove) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, index) => index !== indexToRemove);
      return { ...prev, images: nextImages };
    });

    setImageMainIndex((prev) => {
      if (prev === indexToRemove) return 0;
      if (prev > indexToRemove) return prev - 1;
      return prev;
    });
  };

  const validateProductForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Le nom du produit est requis.";
    if (!form.category.trim()) nextErrors.category = "La categorie est obligatoire.";
    if (!form.size.trim()) nextErrors.size = "La taille est obligatoire.";
    if (!form.color.trim()) nextErrors.color = "La couleur est obligatoire.";
    if (!form.price || Number(form.price) <= 0) nextErrors.price = "Le prix doit etre superieur a 0.";
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) nextErrors.stock = "Le stock doit etre un entier positif ou nul.";
    if (!isEditing && form.images.length === 0) nextErrors.images = "Ajoutez au moins une image.";
    if (form.images.length > 6) nextErrors.images = "Maximum 6 images par produit.";
    if (form.images.some((file) => file.size > 2 * 1024 * 1024)) nextErrors.images = "Chaque image doit faire moins de 2 Mo.";

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      size: "",
      color: "",
      featured: false,
      images: [],
    });
    setEditingProductId(null);
    setIsEditing(false);
    setImageMainIndex(0);
    setFormErrors({});
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!validateProductForm()) return;

    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("price", form.price);
    data.append("category", form.category);
    data.append("stock", form.stock);
    data.append("size", form.size);
    data.append("color", form.color);
    data.append("is_featured", form.featured ? 1 : 0);
    data.append("image_main_index", imageMainIndex);

    for (let i = 0; i < form.images.length; i++) {
      data.append("images[]", form.images[i]);
    }

    try {
      setMessage("");

      if (isEditing && editingProductId) {
        await axios.post(`${PRODUCTS_API_URL}/${editingProductId}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAdminAuthHeaders(),
          },
        });
        setMessage("Produit modifie avec succes");
      } else {
        await axios.post(PRODUCTS_API_URL, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAdminAuthHeaders(),
          },
        });
        setMessage("Produit ajoute avec succes");
      }

      resetForm();
      await fetchProducts();
      setActiveTab("products");
    } catch (error) {
      console.error("Erreur enregistrement produit :", error);
      if (!handleAdminUnauthorized(error)) {
        setMessage(
          getApiErrorMessage(
            error,
            isEditing
              ? "Erreur lors de la modification du produit"
              : "Erreur lors de l'ajout du produit"
          )
        );
      }
    }
  };

  const requestDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`${PRODUCTS_API_URL}/${productToDelete.id}`, {
        headers: getAdminAuthHeaders(),
      });
      setMessage("Produit supprime avec succes");
      setShowDeleteModal(false);
      setProductToDelete(null);
      await fetchProducts();
    } catch (error) {
      console.error("Erreur suppression :", error);
      if (!handleAdminUnauthorized(error)) {
        setMessage("Erreur lors de la suppression");
      }
    }
  };

  const handleEditClick = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      stock: product.stock || "",
      size: product.size || "",
      color: product.color || "",
      featured: !!product.is_featured,
      images: [],
    });

    setEditingProductId(product.id);
    setIsEditing(true);
    setImageMainIndex(0);
    setFormErrors({});
    setActiveTab("add");
    setMessage("");
  };

  const getImageUrl = (product, indexMap) => {
    if (!product.images || product.images.length === 0) return null;
    const currentIndex = indexMap[product.id] || 0;
    const safeIndex = Math.min(currentIndex, product.images.length - 1);
    return `${STORAGE_URL}/${product.images[safeIndex].image_path}`;
  };

  const nextImage = (productId, imagesLength) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesLength,
    }));
  };

  const prevImage = (productId, imagesLength) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  const nextOverviewImage = (productId, imagesLength) => {
    setOverviewImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesLength,
    }));
  };

  const prevOverviewImage = (productId, imagesLength) => {
    setOverviewImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setDetailImageIndex(0);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedProduct(null);
    setShowDetailsModal(false);
    setDetailImageIndex(0);
  };

  const nextDetailImage = () => {
    if (!selectedProduct?.images?.length) return;
    setDetailImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
  };

  const prevDetailImage = () => {
    if (!selectedProduct?.images?.length) return;
    setDetailImageIndex(
      (prev) =>
        (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length
    );
  };

  const updateProductQuick = async (product, updates) => {
    if (!validateProductForm()) return;

    const data = new FormData();
    data.append("name", updates.name ?? product.name);
    data.append("description", updates.description ?? product.description ?? "");
    data.append("price", updates.price ?? product.price);
    data.append("category", updates.category ?? product.category ?? "");
    data.append("stock", updates.stock ?? product.stock);
    data.append("size", updates.size ?? product.size ?? "");
    data.append("color", updates.color ?? product.color ?? "");
    data.append(
      "is_featured",
      updates.is_featured !== undefined
        ? updates.is_featured
          ? 1
          : 0
        : product.is_featured
        ? 1
        : 0
    );

    try {
      await axios.post(`${PRODUCTS_API_URL}/${product.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAdminAuthHeaders(),
        },
      });

      await fetchProducts();
      setMessage("Produit mis a jour");
    } catch (error) {
      console.error("Erreur mise a jour rapide :", error);
      if (!handleAdminUnauthorized(error)) {
        setMessage("Erreur lors de la mise a jour");
      }
    }
  };

  const increaseStock = async (product) => {
    await updateProductQuick(product, { stock: Number(product.stock) + 1 });
  };

  const decreaseStock = async (product) => {
    const newStock = Math.max(0, Number(product.stock) - 1);
    await updateProductQuick(product, { stock: newStock });
  };

  const toggleFeatured = async (product) => {
    await updateProductQuick(product, {
      is_featured: !product.is_featured,
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(
        `${ORDERS_API_URL}/${orderId}/status`,
        { status },
        { headers: getAdminAuthHeaders() }
      );
      setMessage(
        response.data.customer_mail_warning
          ? `${response.data.message || "Commande mise a jour"} ${response.data.customer_mail_warning}`
          : response.data.message || "Commande mise a jour"
      );
      await fetchOrders();
    } catch (error) {
      console.error("Erreur mise a jour commande :", error);
      if (!handleAdminUnauthorized(error)) {
        setMessage(
          error?.response?.data?.message || "Erreur lors de la mise a jour de la commande"
        );
      }
    }
  };

  const formatPrice = (value) => `${Number(value).toFixed(2)} DH`;

  const openImageManager = () => {
    resetForm();
    setActiveTab("add");
    setMessage("Ajoute un produit ou remplace ses images depuis ce formulaire.");
  };

  const openStockView = () => {
    setActiveTab("products");
    setSearch("");
    setCategory("all");
    setFeaturedFilter("all");
    setStockFilter("low_stock");
    setSortBy("stock_asc");
    setMessage("Affichage des produits avec stock faible en priorité.");
  };

  const openAdminPreview = () => {
    onGoToShop?.();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <div style={styles.logoSection}>
            <img src="/logo.png" alt="Hamza Lhamza" style={styles.logo} />
            <div>
              <h1 style={styles.title}>Hamza Lhamza Admin</h1>
              <p style={styles.subtitle}>
                Tableau de bord premium pour gérer les vêtements et le stock
              </p>
            </div>
          </div>

          <button
            style={{ ...styles.goldButton, width: "auto" }}
            type="button"
            onClick={() => onGoToShop?.()}
          >
            Voir la boutique
          </button>
          <button
            style={{ ...styles.darkButton, width: "auto", marginTop: 0 }}
            type="button"
            onClick={() => onLogout?.()}
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </motion.div>

        {message && <div style={styles.messageBox}>{message}</div>}

        <div style={styles.statsGrid}>
          <StatCard
            icon={<Package size={20} />}
            title="Produits"
            value={stats.total}
            hint="Tous les articles"
          />
          <StatCard
            icon={<LayoutDashboard size={20} />}
            title="Stock faible"
            value={stats.lowStock}
            hint="Produits à surveiller"
          />
          <StatCard
            icon={<Trash2 size={20} />}
            title="Rupture"
            value={stats.outOfStock}
            hint="Articles indisponibles"
          />
          <StatCard
            icon={<Star size={20} />}
            title="Mis en avant"
            value={stats.featured}
            hint="Produits premium"
          />
          <StatCard
            icon={<ClipboardList size={20} />}
            title="Commandes"
            value={orderStats.total}
            hint="Selon vos filtres"
          />
          <StatCard
            icon={<ShoppingBag size={20} />}
            title="CA total"
            value={`${Number(dashboardStats.revenue_total || 0).toFixed(0)} DH`}
            hint="Confirmees, en livraison et livrees"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            title="Aujourd hui"
            value={dashboardStats.orders_today || 0}
            hint="Commandes du jour"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            title="En attente"
            value={orderStats.pending}
            hint="Commandes a confirmer"
          />
          <StatCard
            icon={<Truck size={20} />}
            title="En livraison"
            value={orderStats.shipping}
            hint="Commandes en route"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            title="Livrees"
            value={orderStats.delivered}
            hint="Commandes terminees"
          />
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("products")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "products" ? styles.activeTab : {}),
            }}
            type="button"
          >
            Produits
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "orders" ? styles.activeTab : {}),
            }}
            type="button"
          >
            Commandes
          </button>
          <button
            onClick={() => setActiveTab("add")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "add" ? styles.activeTab : {}),
            }}
            type="button"
          >
            Ajouter
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "overview" ? styles.activeTab : {}),
            }}
            type="button"
          >
            Aperçu
          </button>
        </div>

        {activeTab === "products" && (
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Liste des produits</h2>
                <p style={styles.sectionText}>
                  Recherche, tri, filtres et gestion rapide du catalogue
                </p>
              </div>
            </div>

            <div style={styles.advancedFilters}>
              <div style={styles.searchBox}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "Toutes les catégories" : item}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">Tous les stocks</option>
                <option value="in_stock">Disponible</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
              </select>

              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">Tous les produits</option>
                <option value="featured">Mis en avant</option>
                <option value="not_featured">Non mis en avant</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
              >
                <option value="latest">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="stock_asc">Stock croissant</option>
                <option value="stock_desc">Stock décroissant</option>
                <option value="name_asc">Nom A → Z</option>
                <option value="name_desc">Nom Z → A</option>
              </select>
            </div>

            {loading ? (
              <p>Chargement des produits...</p>
            ) : filteredProducts.length === 0 ? (
              <p>Aucun produit trouvé.</p>
            ) : (
              <div style={styles.productsGrid}>
                {filteredProducts.map((product) => {
                  const imageUrl = getImageUrl(product, currentImageIndexes);
                  const currentIndex = currentImageIndexes[product.id] || 0;
                  const hasMultipleImages =
                    product.images && product.images.length > 1;

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -5 }}
                      style={styles.productCard}
                    >
                      <div style={styles.productImageWrapper}>
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={product.name}
                              style={styles.productImage}
                            />

                            {hasMultipleImages && (
                              <>
                                <button
                                  style={{ ...styles.arrowButton, left: "10px" }}
                                  onClick={() =>
                                    prevImage(product.id, product.images.length)
                                  }
                                  type="button"
                                >
                                  <ChevronLeft size={18} />
                                </button>

                                <button
                                  style={{ ...styles.arrowButton, right: "10px" }}
                                  onClick={() =>
                                    nextImage(product.id, product.images.length)
                                  }
                                  type="button"
                                >
                                  <ChevronRight size={18} />
                                </button>
                              </>
                            )}

                            <div style={styles.imageCounter}>
                              {currentIndex + 1}/{product.images.length}
                            </div>
                          </>
                        ) : (
                          <div style={styles.noImageBox}>Aucune image</div>
                        )}
                      </div>

                      <div style={styles.productContent}>
                        <div style={styles.productTop}>
                          <h3 style={styles.productTitle}>{product.name}</h3>

                          <button
                            type="button"
                            onClick={() => toggleFeatured(product)}
                            style={{
                              ...styles.featureToggleButton,
                              ...(product.is_featured
                                ? styles.featureToggleActive
                                : {}),
                            }}
                            title="Activer / désactiver produit mis en avant"
                          >
                            <Star size={15} />
                          </button>
                        </div>

                        <p style={styles.productCategory}>
                          {product.category || "Sans catégorie"}
                        </p>

                        <p style={styles.productPrice}>{product.price} DH</p>

                        <p style={styles.productInfo}>
                          Taille : {product.size || "-"}
                        </p>
                        <p style={styles.productInfo}>
                          Couleur : {product.color || "-"}
                        </p>

                        <div style={styles.stockLine}>
                          <span style={styles.productInfo}>
                            Stock : {product.stock}
                          </span>

                          <div style={styles.stockControls}>
                            <button
                              type="button"
                              style={styles.stockButton}
                              onClick={() => decreaseStock(product)}
                            >
                              <Minus size={14} />
                            </button>
                            <button
                              type="button"
                              style={styles.stockButton}
                              onClick={() => increaseStock(product)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: "10px" }}>
                          {product.stock === 0 ? (
                            <span style={styles.badgeRed}>Rupture</span>
                          ) : product.stock <= 3 ? (
                            <span style={styles.badgeGold}>Faible stock</span>
                          ) : (
                            <span style={styles.badgeGreen}>Disponible</span>
                          )}
                        </div>

                        <div style={styles.actionButtons}>
                          <button
                            style={styles.iconButton}
                            type="button"
                            onClick={() => openDetailsModal(product)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            style={styles.iconButton}
                            onClick={() => handleEditClick(product)}
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            style={styles.deleteButton}
                            onClick={() => requestDeleteProduct(product)}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Commandes clients</h2>
                <p style={styles.sectionText}>
                  Confirme les commandes et contacte les clients depuis leurs coordonnées.
                </p>
              </div>
            </div>

            <div style={styles.advancedFilters}>
              <div style={styles.searchBox}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Reference, client, telephone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmees</option>
                <option value="shipping">En livraison</option>
                <option value="delivered">Livrees</option>
                <option value="cancelled">Annulees</option>
              </select>

              <input type="date" value={orderDateFrom} onChange={(e) => setOrderDateFrom(e.target.value)} style={styles.input} />
              <input type="date" value={orderDateTo} onChange={(e) => setOrderDateTo(e.target.value)} style={styles.input} />
            </div>

            {dashboardStats.top_products?.length > 0 && (
              <div style={styles.topProductsBox}>
                <h3 style={styles.topProductsTitle}>Top produits vendus</h3>
                <div style={styles.topProductsList}>
                  {dashboardStats.top_products.map((item) => (
                    <div key={`${item.product_id}-${item.name}`} style={styles.topProductRow}>
                      <span>{item.name}</span>
                      <strong>{item.quantity} vente(s)</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.ordersGrid}>
              {ordersLoading ? (
                <div style={styles.emptyOrdersBox}>Chargement des commandes...</div>
              ) : ordersError ? (
                <div style={styles.emptyOrdersBox}>
                  <p style={{ marginTop: 0 }}>{ordersError}</p>
                  <button type="button" style={styles.darkButtonInline} onClick={fetchOrders}>
                    Reessayer
                  </button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={styles.emptyOrdersBox}>Aucune commande ne correspond aux filtres.</div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} style={styles.orderCard}>
                    <div style={styles.orderTop}>
                      <div>
                        <h3 style={styles.orderTitle}>{order.reference}</h3>
                        <p style={styles.orderMeta}>
                          {order.customer_name} • {order.customer_city}
                        </p>
                      </div>
                      <span
                        style={{
                          ...styles.orderStatusBadge,
                          ...(order.status === "confirmed"
                            ? styles.orderStatusConfirmed
                            : order.status === "shipping"
                            ? styles.orderStatusConfirmed
                            : order.status === "delivered"
                            ? styles.orderStatusDelivered
                            : order.status === "cancelled"
                            ? styles.orderStatusCancelled
                            : styles.orderStatusPending),
                        }}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>

                    <div style={styles.orderInfoBox}>
                      <p style={styles.orderInfoLine}>
                        <Phone size={14} /> {order.customer_phone}
                      </p>
                      <p style={styles.orderInfoLine}>
                        <MapPin size={14} /> {order.customer_address}
                      </p>
                      {order.customer_note && (
                        <p style={styles.orderNote}>Note: {order.customer_note}</p>
                      )}
                    </div>

                    <div style={styles.orderItemsBox}>
                      {order.items.map((item, index) => (
                        <div key={`${order.id}-${index}`} style={styles.orderItemRow}>
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={styles.orderSummary}>
                      <span>Total</span>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>

                    <div style={styles.orderActions}>
                      <a
                        href={`tel:${order.customer_phone}`}
                        style={styles.darkButtonLink}
                      >
                        Appeler
                      </a>
                      {order.status === "pending" && (
                        <>
                          <button
                            type="button"
                            style={styles.goldButtonFull}
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                          >
                            Confirmer
                          </button>
                          <button
                            type="button"
                            style={styles.deleteWideButton}
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <>
                          <button
                            type="button"
                            style={styles.goldButtonFull}
                            onClick={() => updateOrderStatus(order.id, "shipping")}
                          >
                            Passer en livraison
                          </button>
                          <button
                            type="button"
                            style={styles.deleteWideButton}
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {order.status === "shipping" && (
                        <>
                          <button
                            type="button"
                            style={styles.goldButtonFull}
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                          >
                            Marquer livree
                          </button>
                          <button
                            type="button"
                            style={styles.deleteWideButton}
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {(order.status === "delivered" || order.status === "cancelled") && (
                        <div style={styles.orderActionInfo}>
                          {`Commande ${getOrderStatusLabel(order.status).toLowerCase()}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              {isEditing ? "Modifier le produit" : "Ajouter un produit"}
            </h2>
            <p style={styles.sectionText}>
              {isEditing
                ? "Modifie les informations du produit sélectionné"
                : "Ajoute un nouvel article dans la vraie base Laravel"}
            </p>

            <form onSubmit={handleAddProduct} style={styles.formGrid}>
              <div style={styles.leftForm}>
                <label style={styles.label}>Nom du produit</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Jean Premium Noir"
                  style={styles.input}
                  required
                />

                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description du produit..."
                  style={styles.textarea}
                />

                <div style={styles.twoCols}>
                  <div>
                    <label style={styles.label}>Prix</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="299"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="5"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.twoCols}>
                  <div>
                    <label style={styles.label}>Catégorie</label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="Jean / Veste / Ensemble"
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Taille</label>
                    <input
                      type="text"
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder="S, M, L, XL"
                      style={styles.input}
                    />
                  </div>
                </div>

                <label style={styles.label}>Couleur</label>
                <input
                  type="text"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="Noir, Bleu, Beige..."
                  style={styles.input}
                />

                <label style={styles.checkboxLine}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                  />
                  <span>Mettre en avant sur la boutique</span>
                </label>
              </div>

              <div style={styles.rightForm}>
                <div style={styles.uploadBox}>
                  <ImagePlus size={22} color="#d4af37" />
                  <h3 style={{ margin: "10px 0 5px" }}>Images produit</h3>
                  <p style={styles.uploadText}>
                    Ajoute plusieurs photos pour le meme article
                  </p>

                  <label style={styles.uploadLabel}>
                    <Upload size={18} />
                    <span>Choisir des images</span>
                    <input
                      type="file"
                      name="images"
                      multiple
                      onChange={handleChange}
                      style={{ display: "none" }}
                      accept="image/*"
                      required={!isEditing}
                    />
                  </label>

                  {isEditing && (
                    <p style={styles.editHint}>
                      Laisse vide si tu ne veux pas changer les images.
                    </p>
                  )}

                  <div style={{ marginTop: "15px", width: "100%" }}>
                    {form.images.length === 0 ? (
                      <p style={styles.noImage}>Aucune image sélectionnée</p>
                    ) : (
                      form.images.map((file, index) => (
                        <div key={index} style={styles.fileItem}>
                          <span style={{ overflow: "hidden" }}>{file.name}</span>
                          <span style={styles.fileBadge}>
                            {index === 0 ? "Principale" : "Image"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <button type="submit" style={styles.goldButtonFull}>
                    {isEditing
                      ? "Mettre à jour le produit"
                      : "Enregistrer le produit"}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      style={styles.darkButton}
                      onClick={resetForm}
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === "overview" && (
          <div style={styles.overviewGrid}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Aperçu boutique</h2>
              <p style={styles.sectionText}>
                Les vrais produits récupérés depuis Laravel
              </p>

              <div style={styles.previewGrid}>
                {products.slice(0, 3).map((product) => {
                  const imageUrl = getImageUrl(product, overviewImageIndexes);
                  const currentIndex = overviewImageIndexes[product.id] || 0;
                  const hasMultipleImages =
                    product.images && product.images.length > 1;

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -5 }}
                      style={styles.previewCard}
                    >
                      {imageUrl ? (
                        <div style={styles.previewImageWrapper}>
                          <img
                            src={imageUrl}
                            alt={product.name}
                            style={styles.previewRealImage}
                          />

                          {hasMultipleImages && (
                            <>
                              <button
                                style={{
                                  ...styles.previewArrowButton,
                                  left: "8px",
                                }}
                                onClick={() =>
                                  prevOverviewImage(
                                    product.id,
                                    product.images.length
                                  )
                                }
                                type="button"
                              >
                                <ChevronLeft size={16} />
                              </button>

                              <button
                                style={{
                                  ...styles.previewArrowButton,
                                  right: "8px",
                                }}
                                onClick={() =>
                                  nextOverviewImage(
                                    product.id,
                                    product.images.length
                                  )
                                }
                                type="button"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </>
                          )}

                          <div style={styles.previewCounter}>
                            {currentIndex + 1}/{product.images.length}
                          </div>
                        </div>
                      ) : (
                        <div style={styles.previewImage} />
                      )}

                      <div style={styles.previewTop}>
                        <div>
                          <h3 style={{ margin: 0 }}>{product.name}</h3>
                          <p style={styles.previewCategory}>
                            {product.category || "Sans catégorie"}
                          </p>
                        </div>
                        {product.is_featured && (
                          <Star size={16} color="#d4af37" />
                        )}
                      </div>

                      <div style={styles.previewBottom}>
                        <span style={styles.previewPrice}>
                          {product.price} DH
                        </span>
                        <span style={styles.previewStock}>
                          Stock {product.stock}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Actions rapides</h2>
              <div style={styles.quickActions}>
                <button
                  style={styles.goldButtonFull}
                  onClick={() => setActiveTab("add")}
                  type="button"
                >
                  <Package size={16} /> Nouveau produit
                </button>
                <button
                  style={styles.darkButton}
                  type="button"
                  onClick={openImageManager}
                >
                  <ImagePlus size={16} /> Gérer les images
                </button>
                <button
                  style={styles.darkButton}
                  type="button"
                  onClick={openStockView}
                >
                  <LayoutDashboard size={16} /> Voir le stock
                </button>
                <button
                  style={styles.darkButton}
                  type="button"
                  onClick={openAdminPreview}
                >
                  <ShoppingBag size={16} /> Aperçu admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && selectedProduct && (
        <div style={styles.modalOverlay} onClick={closeDetailsModal}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeDetailsModal} type="button">
              <X size={20} />
            </button>

            <div style={styles.modalGrid}>
              <div>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div style={styles.detailImageWrapper}>
                    <img
                      src={`${STORAGE_URL}/${selectedProduct.images[detailImageIndex].image_path}`}
                      alt={selectedProduct.name}
                      style={styles.detailImage}
                    />

                    {selectedProduct.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          style={{ ...styles.arrowButton, left: "12px" }}
                          onClick={prevDetailImage}
                        >
                          <ChevronLeft size={18} />
                        </button>

                        <button
                          type="button"
                          style={{ ...styles.arrowButton, right: "12px" }}
                          onClick={nextDetailImage}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    <div style={styles.imageCounter}>
                      {detailImageIndex + 1}/{selectedProduct.images.length}
                    </div>
                  </div>
                ) : (
                  <div style={styles.detailNoImage}>Aucune image</div>
                )}
              </div>

              <div>
                <h2 style={styles.modalTitle}>{selectedProduct.name}</h2>
                <p style={styles.modalPrice}>{selectedProduct.price} DH</p>

                <div style={styles.modalInfoBox}>
                  <p><strong>Catégorie :</strong> {selectedProduct.category || "-"}</p>
                  <p><strong>Taille :</strong> {selectedProduct.size || "-"}</p>
                  <p><strong>Couleur :</strong> {selectedProduct.color || "-"}</p>
                  <p><strong>Stock :</strong> {selectedProduct.stock}</p>
                  <p>
                    <strong>Mis en avant :</strong>{" "}
                    {selectedProduct.is_featured ? "Oui" : "Non"}
                  </p>
                </div>

                <div style={styles.descriptionBox}>
                  <strong>Description :</strong>
                  <p style={styles.descriptionText}>
                    {selectedProduct.description || "Aucune description"}
                  </p>
                </div>

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    style={styles.goldButton}
                    onClick={() => {
                      closeDetailsModal();
                      handleEditClick(selectedProduct);
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    style={styles.deleteWideButton}
                    onClick={() => {
                      closeDetailsModal();
                      requestDeleteProduct(selectedProduct);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && productToDelete && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Confirmer la suppression</h3>
            <p style={{ color: "#bbb", lineHeight: 1.6 }}>
              Voulez-vous vraiment supprimer le produit{" "}
              <strong>{productToDelete.name}</strong> ?
            </p>

            <div style={styles.confirmButtons}>
              <button
                type="button"
                style={styles.darkButtonInline}
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                style={styles.deleteWideButton}
                onClick={confirmDeleteProduct}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, hint }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={styles.statCard}>
        <div>
          <p style={styles.statTitle}>{title}</p>
          <p style={styles.statValue}>{value}</p>
          <p style={styles.statHint}>{hint}</p>
        </div>
        <div style={styles.statIcon}>{icon}</div>
      </div>
    </motion.div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,126,95,0.18), transparent 24%), radial-gradient(circle at top right, rgba(255,210,170,0.22), transparent 30%), linear-gradient(180deg, #fff8f4 0%, #fff1eb 46%, #f8ede8 100%)",
    color: "#1d2433",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "30px 15px",
  },
  container: {
    maxWidth: "1300px",
    margin: "0 auto",
  },
  header: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(230,188,168,0.72)",
    borderRadius: "28px",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 18px 50px rgba(194,121,96,0.12)",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    width: "96px",
    height: "96px",
    objectFit: "contain",
    borderRadius: "24px",
    background: "linear-gradient(180deg, #fffefd, #fff3ec)",
    padding: "11px",
    border: "1px solid rgba(224,160,138,0.58)",
    boxShadow: "0 14px 34px rgba(220,132,105,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
    filter: "contrast(1.22) brightness(1.12) saturate(1.08)",
  },
  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "bold",
    color: "#1f2430",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6c7384",
    fontSize: "14px",
  },
  messageBox: {
    background: "rgba(255,126,95,0.1)",
    border: "1px solid rgba(255,126,95,0.2)",
    color: "#b24d37",
    padding: "14px 16px",
    borderRadius: "16px",
    marginBottom: "20px",
  },
  goldButton: {
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(255,95,109,0.2)",
  },
  goldButtonFull: {
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "none",
    padding: "14px 18px",
    borderRadius: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 16px 28px rgba(255,95,109,0.2)",
  },
  darkButton: {
    background: "rgba(255,255,255,0.95)",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.28)",
    padding: "14px 18px",
    borderRadius: "14px",
    cursor: "pointer",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "12px",
    boxShadow: "0 10px 24px rgba(194,121,96,0.08)",
  },
  darkButtonInline: {
    background: "rgba(255,255,255,0.95)",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.28)",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
  },
  deleteWideButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  editHint: {
    color: "#7c8596",
    fontSize: "13px",
    marginTop: "10px",
    marginBottom: "0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  statCard: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "22px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
  },
  statTitle: {
    color: "#7a8090",
    fontSize: "14px",
    margin: 0,
  },
  statValue: {
    fontSize: "30px",
    fontWeight: "bold",
    margin: "8px 0 4px",
  },
  statHint: {
    color: "#9a7f74",
    fontSize: "12px",
    margin: 0,
  },
  statIcon: {
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
    padding: "12px",
    borderRadius: "18px",
    border: "1px solid rgba(255,126,95,0.2)",
  },
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "18px",
    padding: "6px",
    marginBottom: "24px",
    gap: "8px",
    flexWrap: "wrap",
  },
  tabButton: {
    flex: 1,
    minWidth: "140px",
    background: "transparent",
    color: "#6b7280",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  activeTab: {
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
  },
  card: {
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 16px 32px rgba(194,121,96,0.08)",
    marginBottom: "20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "24px",
  },
  sectionText: {
    margin: "6px 0 0",
    color: "#7a8090",
    fontSize: "14px",
  },
  advancedFilters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "22px",
  },
  searchBox: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a06f61",
  },
  searchInput: {
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(230,188,168,0.75)",
    color: "#283042",
    borderRadius: "14px",
    padding: "12px 14px 12px 38px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(230,188,168,0.75)",
    color: "#283042",
    borderRadius: "14px",
    padding: "12px 14px",
    outline: "none",
  },
  ordersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
  },
  emptyOrdersBox: {
    border: "1px dashed rgba(224,160,138,0.58)",
    borderRadius: "18px",
    padding: "28px",
    color: "#7a8090",
    textAlign: "center",
  },
  orderCard: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "22px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  orderTitle: {
    margin: 0,
    fontSize: "18px",
  },
  orderMeta: {
    margin: "6px 0 0",
    color: "#7a8090",
    fontSize: "13px",
  },
  orderStatusBadge: {
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  orderStatusPending: {
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
  },
  orderStatusConfirmed: {
    background: "rgba(0,255,100,0.12)",
    color: "#7df7aa",
  },
  orderStatusDelivered: {
    background: "rgba(76,175,80,0.16)",
    color: "#1d7f42",
  },
  orderStatusCancelled: {
    background: "rgba(255,0,0,0.12)",
    color: "#ff8a8a",
  },
  orderInfoBox: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "16px",
    padding: "14px",
    color: "#4d586b",
  },
  orderInfoLine: {
    margin: "0 0 10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "13px",
  },
  orderNote: {
    margin: 0,
    color: "#6d7484",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  orderItemsBox: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  orderItemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "14px",
    color: "#4d586b",
  },
  orderSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
  },
  orderActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    alignItems: "stretch",
  },
  orderActionInfo: {
    gridColumn: "span 2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "14px",
    color: "#7a8090",
    fontWeight: "bold",
    padding: "14px 18px",
  },
  darkButtonLink: {
    background: "rgba(255,255,255,0.95)",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.28)",
    padding: "14px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  productCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,247,242,0.96))",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 16px 32px rgba(194,121,96,0.1)",
  },
  productImageWrapper: {
    width: "100%",
    height: "320px",
    background: "#f4e5dd",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImageBox: {
    width: "100%",
    height: "100%",
    minHeight: "260px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#8d7469",
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.84)",
    color: "#334156",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageCounter: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    background: "rgba(31,36,48,0.86)",
    color: "#fff",
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  productContent: {
    padding: "16px",
  },
  productTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },
  productTitle: {
    margin: 0,
    fontSize: "18px",
  },
  productCategory: {
    color: "#7a8090",
    fontSize: "13px",
    margin: "6px 0 10px",
  },
  productPrice: {
    color: "#dd5f45",
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 10px",
  },
  productInfo: {
    color: "#4d586b",
    fontSize: "13px",
    margin: "4px 0",
  },
  stockLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
    gap: "10px",
  },
  stockControls: {
    display: "flex",
    gap: "6px",
  },
  stockButton: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "1px solid rgba(255,126,95,0.22)",
    background: "#fff8f4",
    color: "#d85d49",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureToggleButton: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    border: "1px solid rgba(255,126,95,0.22)",
    background: "#fff8f4",
    color: "#a06f61",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureToggleActive: {
    color: "#dd5f45",
    border: "1px solid rgba(255,126,95,0.38)",
    background: "rgba(255,126,95,0.12)",
  },
  badgeRed: {
    background: "rgba(255,0,0,0.12)",
    color: "#ff8a8a",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  badgeGold: {
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  badgeGreen: {
    background: "rgba(0,255,100,0.12)",
    color: "#7df7aa",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "14px",
  },
  iconButton: {
    background: "#fff8f4",
    border: "1px solid rgba(255,126,95,0.22)",
    color: "#d85d49",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "rgba(100,0,0,0.2)",
    border: "1px solid rgba(255,0,0,0.25)",
    color: "#ff8a8a",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  leftForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  rightForm: {},
  label: {
    fontSize: "14px",
    color: "#4d586b",
    marginBottom: "2px",
  },
  input: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.75)",
    color: "#283042",
    borderRadius: "14px",
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.75)",
    color: "#283042",
    borderRadius: "14px",
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    minHeight: "120px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  checkboxLine: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
    color: "#4d586b",
  },
  uploadBox: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "24px",
    padding: "22px",
    textAlign: "center",
  },
  uploadText: {
    color: "#7a8090",
    fontSize: "13px",
    margin: 0,
  },
  uploadLabel: {
    marginTop: "16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    border: "1px dashed rgba(255,126,95,0.35)",
    color: "#d85d49",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
  },
  noImage: {
    color: "#8d7469",
    fontSize: "13px",
  },
  fileItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "12px",
    padding: "10px 12px",
    marginBottom: "8px",
    fontSize: "13px",
  },
  fileBadge: {
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },
  fieldError: {
    color: "#d34f4f",
    fontSize: "12px",
    marginTop: "6px",
  },
  fileBadgePrimary: {
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "11px",
    cursor: "pointer",
  },
  fileBadgeButton: {
    background: "#fff8f4",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.22)",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "11px",
    cursor: "pointer",
  },
  fileRemoveButton: {
    background: "transparent",
    border: "none",
    color: "#d34f4f",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  imagePreviewGrid: {
    display: "grid",
    gap: "12px",
    marginTop: "10px",
  },
  imagePreviewCard: {
    background: "#fff",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "16px",
    padding: "10px",
  },
  imagePreviewThumb: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "12px",
    display: "block",
    marginBottom: "10px",
  },
  imagePreviewActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  topProductsBox: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "20px",
    padding: "18px",
    marginBottom: "18px",
  },
  topProductsTitle: {
    margin: "0 0 10px",
    fontSize: "18px",
  },
  topProductsList: {
    display: "grid",
    gap: "10px",
  },
  topProductRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#4d586b",
    fontSize: "14px",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },
  previewCard: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "22px",
    padding: "14px",
  },
  previewImageWrapper: {
    position: "relative",
    marginBottom: "14px",
  },
  previewImage: {
    height: "160px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #f2d9cf, #fff8f4)",
    marginBottom: "14px",
  },
  previewRealImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "18px",
    display: "block",
  },
  previewArrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.84)",
    color: "#334156",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCounter: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "rgba(31,36,48,0.86)",
    color: "#fff",
    fontSize: "11px",
    padding: "5px 8px",
    borderRadius: "999px",
  },
  previewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },
  previewCategory: {
    color: "#7a8090",
    fontSize: "13px",
    marginTop: "4px",
  },
  previewBottom: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewPrice: {
    color: "#dd5f45",
    fontWeight: "bold",
    fontSize: "18px",
  },
  previewStock: {
    background: "#fff8f4",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    color: "#4d586b",
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "12px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modalBox: {
    width: "100%",
    maxWidth: "1050px",
    background: "rgba(255,255,255,0.98)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "24px",
    padding: "24px",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(255,126,95,0.22)",
    background: "#fff8f4",
    color: "#d85d49",
    cursor: "pointer",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
  },
  detailImageWrapper: {
    position: "relative",
    width: "100%",
    height: "520px",
    background: "#f4e5dd",
    borderRadius: "20px",
    overflow: "hidden",
  },
  detailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  detailNoImage: {
    width: "100%",
    height: "520px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4e5dd",
    borderRadius: "20px",
    color: "#8d7469",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "28px",
  },
  modalPrice: {
    color: "#dd5f45",
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: 0,
  },
  modalInfoBox: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "16px",
    padding: "16px",
    lineHeight: 1.8,
    color: "#4d586b",
    marginBottom: "16px",
  },
  descriptionBox: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
  },
  descriptionText: {
    color: "#4d586b",
    lineHeight: 1.7,
    marginBottom: 0,
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  }, 
  confirmBox: {
    width: "100%",
    maxWidth: "460px",
    background: "rgba(255,255,255,0.98)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "22px",
    padding: "24px",
  },
  confirmButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },
};














