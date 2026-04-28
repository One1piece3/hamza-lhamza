import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Minus,
  Plus,
  X,
  ShieldCheck,
  Truck,
  BadgePercent,
  ClipboardList,
  User,
  Phone,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, getApiErrorMessage, getStorageUrl } from "./api";

const PRODUCTS_API_URL = `${API_URL}/products`;
const ORDERS_API_URL = `${API_URL}/orders`;
const CART_STORAGE_KEY = "hamza_lhamza_cart";
const CHECKOUT_STORAGE_KEY = "hamza_lhamza_checkout";
const UI_STORAGE_KEY = "hamza_lhamza_ui_state";
const INSTAGRAM_URL = "https://www.instagram.com/hamza_lhamza7?igsh=Y2p5eDNvNTB0NHhy";
const WHATSAPP_LABEL = "0776683632";
const WHATSAPP_URL = "https://wa.me/212776683632";

const INFO_PAGES = {
  livraison: {
    title: "Livraison",
    subtitle: "Des commandes suivies clairement, du panier jusqu'a la reception.",
    sections: [
      {
        title: "Delais",
        text: "Les commandes sont confirmees puis preparees avant expedition. Le client recoit un email a chaque etape importante du suivi.",
      },
      {
        title: "Suivi",
        text: "Le statut passe de En attente a Confirmee, puis En livraison et enfin Livree pour un parcours simple et rassurant.",
      },
      {
        title: "Conseil",
        text: "Renseigne une adresse complete et un telephone joignable pour accelerer la livraison.",
      },
    ],
  },
  retours: {
    title: "Retours et echanges",
    subtitle: "Une politique claire aide a rassurer avant l'achat.",
    sections: [
      {
        title: "Verification",
        text: "Le client doit verifier l article des reception et signaler rapidement tout souci de taille, couleur ou conformite.",
      },
      {
        title: "Demande d echange",
        text: "Chaque demande doit inclure la reference de commande pour permettre un traitement rapide.",
      },
      {
        title: "Etat du produit",
        text: "Le produit retourne doit rester en bon etat, non porte et complet avec ses accessoires eventuels.",
      },
    ],
  },
  contact: {
    title: "Contact",
    subtitle: "Un point de contact clair renforce immediatement la credibilite de la boutique.",
    sections: [
      {
        title: "Email",
        text: "hamzalhamza81@gmail.com",
      },
      {
        title: "WhatsApp",
        text: "Disponible pour les questions avant commande, le suivi et l assistance apres achat.",
        actionLabel: WHATSAPP_LABEL,
        actionUrl: WHATSAPP_URL,
      },
      {
        title: "Instagram",
        text: "Retrouve la boutique, les nouveautes et l univers Hamza Lhamza sur Instagram.",
        actionLabel: "@hamza_lhamza7",
        actionUrl: INSTAGRAM_URL,
      },
    ],
  },
};

export default function Shop({
  customerSession = null,
  onOpenLogin,
  onOpenRegister,
  onCustomerLogout,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [catalogError, setCatalogError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(() => {
    try {
      const savedUi = localStorage.getItem(UI_STORAGE_KEY);
      if (!savedUi) return false;
      const parsedUi = JSON.parse(savedUi);
      return Boolean(parsedUi.isCartOpen);
    } catch {
      return false;
    }
  });
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAccountPage, setShowAccountPage] = useState(() => {
    try {
      const savedUi = localStorage.getItem(UI_STORAGE_KEY);
      if (!savedUi) return false;
      const parsedUi = JSON.parse(savedUi);
      return Boolean(parsedUi.showAccountPage);
    } catch {
      return false;
    }
  });
  const [activeInfoPage, setActiveInfoPage] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({
        isCartOpen,
        showAccountPage,
      })
    );
  }, [isCartOpen, showAccountPage]);

  useEffect(() => {
    try {
      const savedCheckout = localStorage.getItem(CHECKOUT_STORAGE_KEY);

      if (!savedCheckout) {
        return;
      }

      const parsedCheckout = JSON.parse(savedCheckout);

      setCustomerInfo((prev) => ({
        ...prev,
        ...parsedCheckout,
      }));
    } catch {
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(customerInfo));
  }, [customerInfo]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!customerSession) return;

    setCustomerInfo((prev) => ({
      ...prev,
      fullName: prev.fullName || customerSession.name || "",
    }));
  }, [customerSession]);

  useEffect(() => {
    if (!customerSession?.email) {
      setCustomerOrders([]);
      return;
    }

    fetchCustomerOrders(customerSession);
  }, [customerSession]);

  useEffect(() => {
    if (customerSession) {
      return;
    }

    setShowAccountPage(false);
    setLastPlacedOrder(null);
    setCheckoutStep("cart");
    setPlacingOrder(false);
  }, [customerSession]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setMessage("");
      setCatalogError("");
      const response = await axios.get(PRODUCTS_API_URL);
      setProducts(response.data);
      setMessage("");
    } catch (error) {
      console.error("Erreur chargement produits :", error);
      const nextMessage = getApiErrorMessage(error, "Erreur lors du chargement des produits");
      setCatalogError(nextMessage);
      setMessage(nextMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "all",
    ...new Set(
      products
        .map((p) => p.category)
        .filter((value) => value && value.trim() !== "")
    ),
  ];

  const sizes = [
    "all",
    ...new Set(
      products
        .map((product) => product.size)
        .filter((value) => value && value.trim() !== "")
    ),
  ];

  const colors = [
    "all",
    ...new Set(
      products
        .map((product) => product.color)
        .filter((value) => value && value.trim() !== "")
    ),
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    result = result.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );

    if (category !== "all") {
      result = result.filter((product) => product.category === category);
    }

    if (sizeFilter !== "all") {
      result = result.filter((product) => product.size === sizeFilter);
    }

    if (colorFilter !== "all") {
      result = result.filter((product) => product.color === colorFilter);
    }

    if (priceFilter === "under_500") {
      result = result.filter((product) => Number(product.price) < 500);
    }

    if (priceFilter === "500_1000") {
      result = result.filter(
        (product) => Number(product.price) >= 500 && Number(product.price) <= 1000
      );
    }

    if (priceFilter === "above_1000") {
      result = result.filter((product) => Number(product.price) > 1000);
    }

    if (stockFilter === "in_stock") {
      result = result.filter((product) => Number(product.stock) > 0);
    }

    if (stockFilter === "low_stock") {
      result = result.filter(
        (product) => Number(product.stock) > 0 && Number(product.stock) <= 3
      );
    }

    if (stockFilter === "featured") {
      result = result.filter((product) => Boolean(product.is_featured));
    }

    if (sortBy === "featured") {
      result.sort((a, b) => {
        if (a.is_featured === b.is_featured) return b.id - a.id;
        return b.is_featured - a.is_featured;
      });
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "latest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, search, category, sizeFilter, colorFilter, priceFilter, stockFilter, sortBy]);

  const isCompactCatalog = filteredProducts.length > 0 && filteredProducts.length <= 6;
  const heroMainProduct = null;
  const activeFiltersCount = [
    category !== "all",
    sizeFilter !== "all",
    colorFilter !== "all",
    priceFilter !== "all",
    stockFilter !== "all",
    sortBy !== "featured",
    search.trim() !== "",
  ].filter(Boolean).length;

  const getImageUrl = (product, imageIndex = 0) => {
    if (!product.images || product.images.length === 0) return null;
    const safeIndex = Math.min(imageIndex, product.images.length - 1);
    return getStorageUrl(product.images[safeIndex].image_path);
  };

  const nextCardImage = (productId, imagesLength) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesLength,
    }));
  };

  const prevCardImage = (productId, imagesLength) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setDetailImageIndex(0);
    setQuantity(1);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setDetailImageIndex(0);
    setQuantity(1);
  };

  const addToCart = (product, qty = 1) => {
    if (product.stock === 0) {
      setMessage("Ce produit est actuellement en rupture de stock.");
      setTimeout(() => setMessage(""), 1800);
      return;
    }

    setCheckoutStep("cart");
    setIsCartOpen(true);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: Math.min(qty, product.stock),
          stock: product.stock,
          image: getImageUrl(product, 0),
          color: product.color || "-",
          size: product.size || "-",
        },
      ];
    });

    setMessage(`${product.name} ajoute au panier`);
    setTimeout(() => setMessage(""), 1800);
  };

  const updateCartQuantity = (productId, action) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;

          const nextQty =
            action === "increase"
              ? Math.min(item.quantity + 1, item.stock)
              : Math.max(item.quantity - 1, 1);

          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const fetchCustomerOrders = async (session = customerSession) => {
    if (!session?.email) return;

    try {
      setOrdersLoading(true);
      setOrdersError("");
      const response = await axios.get(`${ORDERS_API_URL}/customer`, {
        params: {
          email: session.email,
          name: session.name,
          user_id: session.id,
        },
      });
      setCustomerOrders(response.data);
    } catch (error) {
      console.error("Erreur chargement commandes client :", error);
      setOrdersError(getApiErrorMessage(error, "Impossible de charger vos commandes."));
    } finally {
      setOrdersLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCheckoutStep("cart");
    setIsCartOpen(false);
    setCustomerInfo({
      fullName: "",
      phone: "",
      city: "",
      address: "",
      note: "",
    });
    setCheckoutErrors({});
    setLastPlacedOrder(null);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  };

  const resetCatalogFilters = () => {
    setSearch("");
    setCategory("all");
    setSizeFilter("all");
    setColorFilter("all");
    setPriceFilter("all");
    setStockFilter("all");
    setSortBy("featured");
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;

    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    setCheckoutErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const PHONE_REGEX = /^[0-9+\s()-]{8,20}$/;
  const activeCheckoutStep = !customerSession
    ? "cart"
    : checkoutStep === "success" && !lastPlacedOrder
    ? "cart"
    : checkoutStep;

  const formatPrice = (value) => `${Number(value).toFixed(2)} DH`;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const validateCheckout = () => {
    const errors = {};

    if (!customerInfo.fullName.trim()) errors.fullName = "Entrez votre nom complet.";
    if (!customerInfo.phone.trim()) errors.phone = "Entrez un numero de telephone.";
    else if (!PHONE_REGEX.test(customerInfo.phone.trim())) errors.phone = "Entrez un numero de telephone valide.";
    if (!customerInfo.city.trim()) errors.city = "Entrez votre ville.";
    if (!customerInfo.address.trim()) errors.address = "Entrez votre adresse.";

    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildOrderMessage = (orderData = null) => {
    const source = orderData || {
      items: cartItems,
      customer_name: customerInfo.fullName,
      customer_phone: customerInfo.phone,
      customer_city: customerInfo.city,
      customer_address: customerInfo.address,
      customer_note: customerInfo.note,
      subtotal: cartSubtotal,
      delivery_fee: deliveryFee,
      total: cartTotal,
    };

    const itemsLines = source.items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} | ${item.size} | ${item.color} | ${formatPrice(
            item.price * item.quantity
          )}`
      )
      .join("\n");

    return [
      "Bonjour, je souhaite passer cette commande:",
      "",
      itemsLines,
      "",
      `Sous-total: ${formatPrice(source.subtotal)}`,
      `Livraison: ${
        Number(source.delivery_fee) === 0 ? "Offerte" : formatPrice(source.delivery_fee)
      }`,
      `Total: ${formatPrice(source.total)}`,
      "",
      `Nom: ${source.customer_name}`,
      `Telephone: ${source.customer_phone}`,
      `Ville: ${source.customer_city}`,
      `Adresse: ${source.customer_address}`,
      `Note: ${source.customer_note || "-"}`,
    ].join("\n");
  };

  const handleCheckout = () => {
    if (placingOrder) {
      return;
    }

    if (cartItems.length === 0) {
      setMessage("Ajoutez au moins un article avant de commander.");
      setTimeout(() => setMessage(""), 1800);
      return;
    }

    if (!customerSession) {
      setCheckoutStep("cart");
      setMessage("Connectez-vous pour finaliser votre commande.");
      setTimeout(() => setMessage(""), 2200);
      onOpenLogin?.();
      return;
    }

    setCheckoutStep("checkout");
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    if (!customerSession) {
      setCheckoutStep("cart");
      setPlacingOrder(false);
      setMessage("Connectez-vous pour confirmer votre commande.");
      setTimeout(() => setMessage(""), 2200);
      onOpenLogin?.();
      return;
    }

    if (!validateCheckout()) return;

    try {
      setPlacingOrder(true);
      setLastPlacedOrder(null);
      const response = await axios.post(ORDERS_API_URL, {
        customer_user_id: customerSession?.id ?? null,
        customer_email: customerSession?.email ?? null,
        customer_name: customerInfo.fullName,
        customer_phone: customerInfo.phone,
        customer_city: customerInfo.city,
        customer_address: customerInfo.address,
        customer_note: customerInfo.note,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        subtotal: cartSubtotal,
        delivery_fee: deliveryFee,
        total: cartTotal,
      });

      const orderSnapshot = response.data.order;
      setLastPlacedOrder(orderSnapshot);
      setCustomerOrders((prev) => [orderSnapshot, ...prev]);
      setCheckoutStep("success");

      const orderMessage = `${buildOrderMessage(orderSnapshot)}\nReference: ${orderSnapshot.reference}`;

      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(orderMessage).catch(() => {});
      }

      setMessage(
        response.data.mail_warning || response.data.customer_mail_warning
          ? `${response.data.mail_warning || response.data.customer_mail_warning} Reference: ${response.data.order.reference}`
          : `Commande enregistree avec succes. Reference: ${response.data.order.reference}`
      );
      localStorage.removeItem(CART_STORAGE_KEY);
      setCartItems([]);
    } catch (error) {
      console.error("Erreur creation commande :", error);
      setMessage(getApiErrorMessage(error, "Erreur lors de l'enregistrement de la commande"));
      return;
    } finally {
      setPlacingOrder(false);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth <= 1100;

  const getCustomerOrderStatusStyle = (status) => {
    if (status === "confirmed") {
      return styles.accountOrderStatusConfirmed;
    }

    if (status === "shipping") {
      return styles.accountOrderStatusConfirmed;
    }

    if (status === "delivered") {
      return styles.accountOrderStatusDelivered;
    }

    if (status === "cancelled") {
      return styles.accountOrderStatusCancelled;
    }

    return styles.accountOrderStatusPending;
  };

  const getCustomerOrderStatusLabel = (status) => {
    if (status === "confirmed") return "Confirmee";
    if (status === "shipping") return "En livraison";
    if (status === "delivered") return "Livree";
    if (status === "cancelled") return "Annulee";
    return "En attente";
  };

  const getOrderTimelineSteps = (status) => {
    const currentStepIndex = {
      pending: 0,
      confirmed: 1,
      shipping: 2,
      delivered: 3,
      cancelled: -1,
    }[status] ?? 0;

    return [
      { key: "pending", label: "En attente", done: currentStepIndex >= 0 && status !== "cancelled" },
      { key: "confirmed", label: "Confirmee", done: currentStepIndex >= 1 },
      { key: "shipping", label: "En livraison", done: currentStepIndex >= 2 },
      { key: "delivered", label: "Livree", done: currentStepIndex >= 3 },
    ];
  };

  const activeCustomerOrders = customerOrders.filter((order) =>
    ["pending", "confirmed", "shipping"].includes(order.status)
  );
  const historyCustomerOrders = customerOrders.filter((order) =>
    ["delivered", "cancelled"].includes(order.status)
  );

  const renderCustomerOrdersSection = (title, subtitle, orders) => {
    if (orders.length === 0) {
      return null;
    }

    return (
      <div style={styles.accountSectionBlock}>
        <div style={styles.accountSectionHeader}>
          <h4 style={styles.accountSectionTitle}>{title}</h4>
          <p style={styles.accountSectionText}>{subtitle}</p>
        </div>

        <div
          style={{
            ...styles.accountOrdersGrid,
            ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
          }}
        >
          {orders.map((order) => (
            <article key={order.id} style={styles.accountOrderCard}>
              <div style={styles.accountOrderTop}>
                <div>
                  <h4 style={styles.accountOrderTitle}>{order.reference}</h4>
                  <p style={styles.accountOrderMeta}>{order.customer_city}</p>
                </div>
                <span
                  style={{
                    ...styles.accountOrderStatus,
                    ...getCustomerOrderStatusStyle(order.status),
                  }}
                >
                  {getCustomerOrderStatusLabel(order.status)}
                </span>
              </div>

              <div style={styles.accountOrderInfo}>
                <p style={styles.accountOrderInfoLine}>
                  <Phone size={14} /> {order.customer_phone}
                </p>
                <p style={styles.accountOrderInfoLine}>
                  <MapPin size={14} /> {order.customer_address}
                </p>
              </div>

              {order.status !== "cancelled" ? (
                <div style={styles.timelineWrap}>
                  {getOrderTimelineSteps(order.status).map((step, index, steps) => (
                    <div key={`${order.id}-${step.key}`} style={styles.timelineStep}>
                      <div
                        style={{
                          ...styles.timelineDot,
                          ...(step.done ? styles.timelineDotActive : {}),
                        }}
                      />
                      <span
                        style={{
                          ...styles.timelineLabel,
                          ...(step.done ? styles.timelineLabelActive : {}),
                        }}
                      >
                        {step.label}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          style={{
                            ...styles.timelineLine,
                            ...(step.done ? styles.timelineLineActive : {}),
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.timelineCancelledBox}>
                  Cette commande a ete annulee.
                </div>
              )}

              <div style={styles.accountOrderItems}>
                {order.items?.map((item, index) => (
                  <div key={`${order.id}-${index}`} style={styles.accountOrderItemRow}>
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div style={styles.accountOrderFooter}>
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.header,
            ...(isMobile
              ? {
                  padding: "14px 14px 18px",
                  borderRadius: "26px",
                }
              : {}),
          }}
        >
          <div
            style={{
              ...styles.topBar,
              ...(isTablet ? { flexDirection: "column", alignItems: "stretch" } : {}),
              ...(isMobile ? { gap: "14px" } : {}),
            }}
          >
            <div
              style={{
                ...styles.brandBlock,
                ...(isMobile ? { alignItems: "flex-start", gap: "14px" } : {}),
              }}
            >
              <img
                src="/logo.png"
                alt="Hamza Lhamza"
                style={{
                  ...styles.logo,
                  ...(isMobile ? { width: "74px", height: "74px", borderRadius: "20px" } : {}),
                }}
              />
              <div>
                <h1
                  style={{
                    ...styles.brandTitle,
                    ...(isMobile
                      ? { fontSize: "22px", lineHeight: 1.08 }
                      : isTablet
                      ? { fontSize: "28px" }
                      : {}),
                  }}
                >
                  Hamza Lhamza
                </h1>
                <p
                  style={{
                    ...styles.brandSubtitle,
                    ...(isMobile ? { fontSize: "14px", lineHeight: 1.55 } : {}),
                  }}
                >
                  Denim, silhouettes essentielles et finitions pensees pour une allure sobre et premium.
                </p>
              </div>

              {customerSession && (
                <div
                  style={{
                    ...styles.userBadge,
                    ...(isMobile
                      ? {
                          width: "100%",
                          justifyContent: "flex-start",
                          padding: "12px 14px",
                          borderRadius: "20px",
                        }
                      : {}),
                  }}
                >
                  <div style={styles.userBadgeIcon}>
                    <User size={16} />
                  </div>
                  <div style={styles.userBadgeContent}>
                    <span style={styles.userBadgeLabel}>Connecte</span>
                    <span style={styles.userBadgeText}>{customerSession.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                ...styles.navLinks,
                ...(isTablet ? { justifyContent: "center" } : {}),
                ...(isMobile
                  ? {
                      justifyContent: "flex-start",
                      flexWrap: "nowrap",
                      overflowX: "auto",
                      paddingBottom: "4px",
                      gap: "8px",
                    }
                  : {}),
              }}
            >
              <button type="button" style={styles.navLink}>
                Nouveautes
              </button>
              <button type="button" style={styles.navLink} onClick={() => setActiveInfoPage("livraison")}>
                Livraison
              </button>
              <button type="button" style={styles.navLink} onClick={() => setActiveInfoPage("retours")}>
                Retours
              </button>
              <button type="button" style={styles.navLink} onClick={() => setActiveInfoPage("contact")}>
                Contact
              </button>
            </div>

            <div
              style={{
                ...styles.headerActions,
                ...(isTablet ? { width: "100%", justifyContent: "space-between" } : {}),
                ...(isMobile
                  ? {
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: "12px",
                      width: "100%",
                    }
                  : {}),
              }}
            >
              <div
                style={{
                  ...styles.searchWrap,
                  ...(isMobile ? { width: "100%" } : {}),
                }}
              >
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    ...styles.searchInput,
                    ...(isTablet ? { width: "100%" } : {}),
                    ...(isMobile
                      ? {
                          padding: "12px 14px 12px 40px",
                          borderRadius: "18px",
                        }
                      : {}),
                  }}
                />
              </div>

              {!customerSession ? (
                <div
                  style={{
                    ...styles.authButtons,
                    ...(isMobile
                      ? {
                          width: "100%",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }
                      : {}),
                  }}
                >
                  <button type="button" style={styles.navGhostButton} onClick={onOpenLogin}>
                    Login
                  </button>
                  <button type="button" style={styles.navGoldButton} onClick={onOpenRegister}>
                    Creer un compte
                  </button>
                </div>
              ) : null}

              {customerSession && (
                <button
                  type="button"
                  style={{
                    ...styles.ordersButton,
                    ...(isMobile
                      ? {
                          width: "100%",
                          justifyContent: "center",
                          minHeight: "48px",
                        }
                      : {}),
                  }}
                  onClick={() => {
                    setShowAccountPage(true);
                    fetchCustomerOrders();
                  }}
                >
                  <ClipboardList size={17} /> Mon compte
                  {customerOrders.length > 0 && (
                    <span style={styles.ordersBadge}>{customerOrders.length}</span>
                  )}
                </button>
              )}

              <button
                style={{
                  ...styles.cartButton,
                  ...(isMobile
                    ? {
                        width: "100%",
                        justifyContent: "center",
                        minHeight: "52px",
                      }
                    : {}),
                }}
                onClick={() => {
                  setCheckoutStep("cart");
                  setIsCartOpen(true);
                }}
              >
                <ShoppingCart size={18} />
                <span>Panier</span>
                {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
              </button>

              {customerSession && (
                <button
                  type="button"
                  style={{
                    ...styles.logoutButton,
                    ...(isMobile
                      ? {
                          width: "100%",
                          justifyContent: "center",
                          minHeight: "48px",
                        }
                      : {}),
                  }}
                  onClick={onCustomerLogout}
                >
                  <LogOut size={15} /> Logout
                </button>
              )}
            </div>
          </div>
        </motion.header>

        {(catalogError || message) && (
          <div style={styles.messageBox}>{catalogError || message}</div>
        )}

        {showAccountPage && customerSession && (
          <section
            style={{
              ...styles.accountSection,
              ...(isMobile ? { padding: "20px" } : {}),
            }}
          >
            <div
              style={{
                ...styles.accountHeader,
                ...(isMobile ? { flexDirection: "column", alignItems: "flex-start" } : {}),
              }}
            >
              <div>
                <p style={styles.accountBadge}>Mon compte</p>
                <h3 style={styles.accountTitle}>Mes commandes</h3>
                <p style={styles.accountText}>
                  Consulte ton historique, retrouve tes informations et suis chaque commande de
                  facon plus claire.
                </p>
              </div>

              <div style={styles.accountHeaderActions}>
                <button
                  type="button"
                  style={styles.accountRefreshButton}
                  onClick={() => fetchCustomerOrders()}
                >
                  Actualiser mes commandes
                </button>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setShowAccountPage(false)}
                >
                  Retour boutique
                </button>
              </div>
            </div>

            <div
              style={{
                ...styles.accountIdentity,
                ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
              }}
            >
              <div style={styles.accountIdentityCard}>
                <span style={styles.accountIdentityLabel}>Client</span>
                <strong style={styles.accountIdentityValue}>{customerSession.name}</strong>
              </div>
              <div style={styles.accountIdentityCard}>
                <span style={styles.accountIdentityLabel}>Email</span>
                <strong style={styles.accountIdentityValue}>{customerSession.email}</strong>
              </div>
              <div style={styles.accountIdentityCard}>
                <span style={styles.accountIdentityLabel}>Commandes</span>
                <strong style={styles.accountIdentityValue}>{customerOrders.length}</strong>
              </div>
            </div>

            {ordersLoading ? (
              <div style={styles.accountEmptyBox}>Chargement de vos commandes...</div>
            ) : ordersError ? (
              <div style={styles.accountEmptyBox}>
                <p style={{ marginTop: 0 }}>{ordersError}</p>
                <button type="button" style={styles.retryButton} onClick={() => fetchCustomerOrders()}>
                  Reessayer
                </button>
              </div>
            ) : customerOrders.length === 0 ? (
              <div style={styles.accountEmptyBox}>
                Aucune commande enregistree pour le moment.
              </div>
            ) : (
              <div style={styles.accountSectionsWrap}>
                {renderCustomerOrdersSection(
                  "En cours",
                  "Retrouve ici les commandes en attente, confirmees ou en livraison.",
                  activeCustomerOrders
                )}
                {renderCustomerOrdersSection(
                  "Historique",
                  "Les commandes livrees ou annulees restent disponibles en archive.",
                  historyCustomerOrders
                )}
              </div>
            )}
          </section>
        )}

        <section
          style={{
            ...styles.hero,
            ...(isCompactCatalog ? styles.heroCompact : {}),
            ...(isTablet ? { gridTemplateColumns: "1fr", padding: isMobile ? "22px" : "28px" } : {}),
          }}
        >
          <div style={styles.heroMain}>
            <p style={styles.heroBadge}>Edition signature</p>
            <h2
              style={{
                ...styles.heroTitle,
                ...(isMobile
                  ? { fontSize: "34px", lineHeight: 1.12 }
                  : isTablet
                  ? { fontSize: "40px", lineHeight: 1.08 }
                  : {}),
              }}
            >
              Des pieces mode au caractere net, presentees dans une boutique plus calme, plus chic et plus desirables.
            </h2>
            <p style={{ ...styles.heroText, ...(isMobile ? { fontSize: "15px" } : {}) }}>
              Parcours les articles, filtre rapidement, ajoute au panier et passe ta commande
              dans une interface plus premium et plus confortable a l&apos;oeil.
            </p>

            <div
              style={{
                ...styles.heroActionRow,
                ...(isMobile ? { justifyContent: "stretch", flexDirection: "column" } : {}),
              }}
            >
              <button
                type="button"
                style={{
                  ...styles.heroPrimaryButton,
                  ...(isMobile ? { width: "100%", minWidth: "100%" } : {}),
                }}
                onClick={() => setIsCartOpen(true)}
              >
                Voir mon panier
              </button>
              <button
                type="button"
                style={{
                  ...styles.heroSecondaryButton,
                  ...(isMobile ? { width: "100%", minWidth: "100%" } : {}),
                }}
                onClick={() => setActiveInfoPage("contact")}
              >
                Contacter la boutique
              </button>
            </div>
          </div>

          <div style={styles.heroAside}>
            <div style={styles.heroFeatureCardLarge}>
              <div style={styles.heroFeatureTitle}>Signature Hamza Lhamza</div>
              <div style={styles.heroFeatureValue}>Elegance nette</div>
              <p style={styles.heroFeatureText}>
                {heroMainProduct
                  ? `${formatPrice(heroMainProduct.price)}${heroMainProduct.category ? ` | ${heroMainProduct.category}` : ""}`
                  : "Une selection plus lisible, une ambiance plus editoriale et un parcours d achat plus rassurant."}
              </p>
            </div>

            <div style={styles.heroFeatures}>
              <div style={styles.heroFeatureCard}>
                <ShieldCheck size={18} />
                <span>Commande fluide</span>
              </div>
              <div style={styles.heroFeatureCard}>
                <Truck size={18} />
                <span>Suivi clair</span>
              </div>
              <div style={styles.heroFeatureCard}>
                <BadgePercent size={18} />
                <span>Selection premium</span>
              </div>
            </div>
          </div>
          </section>

          <section style={styles.filtersShell}>
            <div
              style={{
                ...styles.filtersBar,
                ...(isMobile ? { flexDirection: "column", alignItems: "stretch" } : {}),
              }}
            >
              <button
                type="button"
                style={{
                  ...styles.filtersToggleButton,
                  ...(isMobile ? { width: "100%" } : {}),
                }}
                onClick={() => setIsFiltersOpen((prev) => !prev)}
              >
                <span style={styles.filtersToggleContent}>
                  <SlidersHorizontal size={16} />
                  <span>Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span style={styles.filtersCountBadge}>{activeFiltersCount}</span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  style={{
                    transform: isFiltersOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              <div
                style={{
                  ...styles.filtersSummary,
                  ...(isMobile ? { width: "100%", justifyContent: "space-between" } : {}),
                }}
              >
                <span>
                  {activeFiltersCount > 0
                    ? `${activeFiltersCount} filtre(s) actif(s)`
                    : "Tous les produits sont visibles"}
                </span>
                <button type="button" style={styles.filtersResetButton} onClick={resetCatalogFilters}>
                  Reinitialiser
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isFiltersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  style={styles.filtersPanel}
                >
                  <div
                    style={{
                      ...styles.toolbar,
                      ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
                    }}
                  >
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ ...styles.select, ...(isMobile ? { width: "100%" } : {}) }}
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item === "all" ? "Toutes les categories" : item}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sizeFilter}
                      onChange={(e) => setSizeFilter(e.target.value)}
                      style={{ ...styles.select, ...(isMobile ? { width: "100%" } : {}) }}
                    >
                      {sizes.map((item) => (
                        <option key={item} value={item}>
                          {item === "all" ? "Toutes les tailles" : item}
                        </option>
                      ))}
                    </select>

                    <select
                      value={colorFilter}
                      onChange={(e) => setColorFilter(e.target.value)}
                      style={{ ...styles.select, ...(isMobile ? { width: "100%" } : {}) }}
                    >
                      {colors.map((item) => (
                        <option key={item} value={item}>
                          {item === "all" ? "Toutes les couleurs" : item}
                        </option>
                      ))}
                    </select>

                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      style={{ ...styles.select, ...(isMobile ? { width: "100%" } : {}) }}
                    >
                      <option value="all">Tous les prix</option>
                      <option value="under_500">Moins de 500 DH</option>
                      <option value="500_1000">500 a 1000 DH</option>
                      <option value="above_1000">Plus de 1000 DH</option>
                    </select>

                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      style={{ ...styles.select, ...(isMobile ? { width: "100%" } : {}) }}
                    >
                      <option value="all">Tous les stocks</option>
                      <option value="in_stock">Disponible</option>
                      <option value="low_stock">Stock faible</option>
                      <option value="featured">Mis en avant</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ ...styles.select, ...(isMobile ? { width: "100%" } : {}) }}
                    >
                      <option value="featured">Produits mis en avant</option>
                      <option value="latest">Plus recents</option>
                      <option value="price_asc">Prix croissant</option>
                      <option value="price_desc">Prix decroissant</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        <section
          style={{
            ...styles.checkoutHighlights,
            ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
          }}
        >
          <div style={styles.checkoutStatCard}>
            <span style={styles.checkoutStatValue}>{filteredProducts.length}</span>
            <span style={styles.checkoutStatLabel}>articles visibles</span>
          </div>
          <div style={styles.checkoutStatCard}>
            <span style={styles.checkoutStatValue}>{cartCount}</span>
            <span style={styles.checkoutStatLabel}>piece(s) au panier</span>
          </div>
          <div style={styles.checkoutStatCard}>
            <span style={styles.checkoutStatValue}>
              {cartItems.length === 0 ? "0.00 DH" : formatPrice(cartTotal)}
            </span>
            <span style={styles.checkoutStatLabel}>total estime</span>
          </div>
        </section>

        {loading ? (
          <div style={styles.loadingBox}>Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.loadingBox}>Aucun produit trouve.</div>
        ) : (
          <section
          style={{
            ...styles.productsGrid,
            ...(isMobile
              ? { gridTemplateColumns: "1fr", justifyItems: "center" }
              : isTablet
              ? { gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }
              : isCompactCatalog
                ? styles.productsGridCompact
                : {}),
            }}
          >
            {filteredProducts.map((product) => {
              const currentIndex = currentImageIndexes[product.id] || 0;
              const imageUrl = getImageUrl(product, currentIndex);
              const hasMultipleImages = product.images && product.images.length > 1;

              return (
                <motion.article
                  key={product.id}
                  whileHover={{ y: -6 }}
                  style={{
                    ...styles.productCard,
                    ...(isMobile ? { width: "100%", maxWidth: "420px" } : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.productImageWrap,
                      ...(isMobile ? { height: "280px" } : {}),
                    }}
                  >
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
                              type="button"
                              style={{ ...styles.arrowButton, left: "10px" }}
                              onClick={() => prevCardImage(product.id, product.images.length)}
                            >
                              <ChevronLeft size={18} />
                            </button>

                            <button
                              type="button"
                              style={{ ...styles.arrowButton, right: "10px" }}
                              onClick={() => nextCardImage(product.id, product.images.length)}
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
                      <div style={styles.noImage}>Aucune image</div>
                    )}
                  </div>

                  <div style={styles.productContent}>
                    <div style={styles.productTopRow}>
                      <div>
                        <h3 style={styles.productTitle}>{product.name}</h3>
                        <p style={styles.productCategory}>
                          {product.category || "Sans categorie"}
                        </p>
                      </div>
                      {product.is_featured && (
                        <div style={styles.featuredBadge}>
                          <Star size={14} />
                        </div>
                      )}
                    </div>

                    <p style={styles.productPrice}>{product.price} DH</p>
                    <p style={styles.metaText}>Taille : {product.size || "-"}</p>
                    <p style={styles.metaText}>Couleur : {product.color || "-"}</p>

                    <div style={{ marginTop: "10px" }}>
                      {product.stock === 0 ? (
                        <span style={styles.stockOut}>Rupture de stock</span>
                      ) : product.stock <= 3 ? (
                        <span style={styles.stockLow}>Dernieres pieces : {product.stock}</span>
                      ) : (
                        <span style={styles.stockOk}>En stock</span>
                      )}
                    </div>

                    <div
                      style={{
                        ...styles.cardButtons,
                        ...(isMobile ? { flexDirection: "column" } : {}),
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          ...styles.outlineButton,
                          ...(isMobile ? { width: "100%" } : {}),
                        }}
                        onClick={() => openProduct(product)}
                      >
                        Voir le produit
                      </button>

                      <button
                        type="button"
                        style={{
                          ...styles.goldButton,
                          ...(isMobile ? { width: "100%" } : {}),
                          ...(product.stock === 0 ? styles.disabledButton : {}),
                        }}
                        onClick={() => addToCart(product, 1)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart size={16} /> Ajouter
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}

          <section
            style={{
              ...styles.footerInfo,
              ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
            }}
          >
            {Object.entries(INFO_PAGES).map(([key, page]) => (
              <article key={key} style={styles.footerInfoCard}>
                <div style={styles.footerInfoCardBody}>
                  <h3 style={styles.footerInfoTitle}>{page.title}</h3>
                  <p style={styles.footerInfoText}>{page.subtitle}</p>
                </div>
                <button
                  type="button"
                  style={styles.footerInfoButton}
                  onClick={() => setActiveInfoPage(key)}
                >
                  Voir le detail
                </button>
              </article>
            ))}
          </section>

          <footer
            style={{
              ...styles.siteFooter,
              ...(isMobile
                ? {
                    gridTemplateColumns: "1fr",
                    padding: "30px 20px 34px",
                    minHeight: "auto",
                    gap: "26px",
                    width: "100vw",
                    marginLeft: "calc(50% - 50vw)",
                    marginBottom: "-40px",
                    borderRadius: 0,
                  }
                : {}),
            }}
          >
            <div style={styles.siteFooterBrand}>
              <span style={styles.siteFooterEyebrow}>Hamza Lhamza</span>
              <h3 style={styles.siteFooterTitle}>Une boutique plus claire, plus rassurante et plus premium.</h3>
              <p style={styles.siteFooterText}>
                Pieces soigneusement selectionnees, suivi simple et contact direct pour accompagner chaque commande.
              </p>
            </div>

            <div style={styles.siteFooterLinks}>
              <div style={styles.siteFooterColumn}>
                <span style={styles.siteFooterColumnTitle}>Navigation</span>
                <button type="button" style={styles.siteFooterLink} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  Retour en haut
                </button>
                <button type="button" style={styles.siteFooterLink} onClick={() => setActiveInfoPage("livraison")}>
                  Livraison
                </button>
                <button type="button" style={styles.siteFooterLink} onClick={() => setActiveInfoPage("retours")}>
                  Retours
                </button>
              </div>

              <div style={styles.siteFooterColumn}>
                <span style={styles.siteFooterColumnTitle}>Contact</span>
                <a href={`mailto:hamzalhamza81@gmail.com`} style={styles.siteFooterAnchor}>
                  <Mail size={15} />
                  <span>hamzalhamza81@gmail.com</span>
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={styles.siteFooterAnchor}>
                  <MessageSquare size={15} />
                  <span>{WHATSAPP_LABEL}</span>
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={styles.siteFooterAnchor}>
                  <Star size={15} />
                  <span>@hamza_lhamza7</span>
                </a>
              </div>
            </div>
          </footer>
        </div>

      <AnimatePresence>
        {activeInfoPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.infoOverlay}
            onClick={() => setActiveInfoPage(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              style={{
                ...styles.infoModal,
                ...(isMobile ? { padding: "18px", maxWidth: "calc(100vw - 16px)", maxHeight: "calc(100vh - 16px)", overflowY: "auto" } : {}),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" style={styles.closeButton} onClick={() => setActiveInfoPage(null)}>
                <X size={18} />
              </button>
              <p style={styles.accountBadge}>{INFO_PAGES[activeInfoPage].title}</p>
              <h3 style={styles.ordersPanelTitle}>{INFO_PAGES[activeInfoPage].title}</h3>
              <p style={styles.ordersPanelText}>{INFO_PAGES[activeInfoPage].subtitle}</p>
              <div style={styles.infoSections}>
                {INFO_PAGES[activeInfoPage].sections.map((section) => (
                  <article key={section.title} style={styles.infoSectionCard}>
                    <h4 style={styles.infoSectionTitle}>{section.title}</h4>
                    <p style={styles.infoSectionText}>{section.text}</p>
                    {section.actionUrl && (
                      <a
                        href={section.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.contactActionLink}
                      >
                        {section.actionLabel}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={closeProduct}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              style={{
                ...styles.modalBox,
                ...(isMobile
                  ? {
                      padding: "16px",
                      borderRadius: "18px",
                      maxWidth: "calc(100vw - 16px)",
                      maxHeight: "calc(100vh - 16px)",
                      overflowY: "auto",
                    }
                  : {}),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.closeButton} onClick={closeProduct} type="button">
                <X size={18} />
              </button>

              <div
                style={{
                  ...styles.modalGrid,
                  ...(isTablet ? { gridTemplateColumns: "1fr" } : {}),
                }}
              >
                <div>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div
                      style={{
                        ...styles.detailImageWrap,
                        ...(isMobile ? { height: "340px" } : isTablet ? { height: "420px" } : {}),
                      }}
                    >
                      <img
                        src={getStorageUrl(selectedProduct.images[detailImageIndex].image_path)}
                        alt={selectedProduct.name}
                        style={styles.detailImage}
                      />

                      {selectedProduct.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            style={{ ...styles.arrowButton, left: "12px" }}
                            onClick={() =>
                              setDetailImageIndex(
                                (prev) =>
                                  (prev - 1 + selectedProduct.images.length) %
                                  selectedProduct.images.length
                              )
                            }
                          >
                            <ChevronLeft size={18} />
                          </button>

                          <button
                            type="button"
                            style={{ ...styles.arrowButton, right: "12px" }}
                            onClick={() =>
                              setDetailImageIndex(
                                (prev) => (prev + 1) % selectedProduct.images.length
                              )
                            }
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
                    <div
                      style={{
                        ...styles.detailNoImage,
                        ...(isMobile ? { height: "340px" } : isTablet ? { height: "420px" } : {}),
                      }}
                    >
                      Aucune image
                    </div>
                  )}
                </div>

                <div>
                  <h2 style={styles.modalTitle}>{selectedProduct.name}</h2>
                  <p style={styles.modalPrice}>{selectedProduct.price} DH</p>
                  <p style={styles.modalDescription}>
                    {selectedProduct.description ||
                      "Produit mode premium disponible en commande."}
                  </p>

                  <div style={styles.infoBox}>
                    <p><strong>Categorie :</strong> {selectedProduct.category || "-"}</p>
                    <p><strong>Taille :</strong> {selectedProduct.size || "-"}</p>
                    <p><strong>Couleur :</strong> {selectedProduct.color || "-"}</p>
                    <p><strong>Stock :</strong> {selectedProduct.stock}</p>
                  </div>

                  <div
                    style={{
                      ...styles.quantityBox,
                      ...(isMobile ? { flexDirection: "column", alignItems: "stretch", gap: "12px" } : {}),
                    }}
                  >
                    <span style={styles.quantityLabel}>Quantite</span>
                    <div
                      style={{
                        ...styles.quantityControls,
                        ...(isMobile ? { justifyContent: "space-between" } : {}),
                      }}
                    >
                      <button
                        type="button"
                        style={styles.qtyButton}
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={styles.qtyValue}>{quantity}</span>
                      <button
                        type="button"
                        style={styles.qtyButton}
                        onClick={() =>
                          setQuantity((prev) =>
                            Math.min(prev + 1, selectedProduct.stock || 1)
                          )
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.modalActionButtons}>
                    <button
                      type="button"
                      style={{
                        ...styles.goldButtonLarge,
                        ...(selectedProduct.stock === 0 ? styles.disabledButton : {}),
                      }}
                        onClick={() => {
                          addToCart(selectedProduct, quantity);
                        }}
                        disabled={selectedProduct.stock === 0}
                      >
                      <ShoppingCart size={18} /> Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.cartOverlay}
            onClick={() => setIsCartOpen(false)}
          >
            <motion.aside
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{
                ...styles.cartDrawer,
                ...(isMobile
                  ? {
                      maxWidth: "100%",
                      borderLeft: "none",
                      padding: "18px 16px 16px",
                    }
                  : {}),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.cartHeader}>
                <div>
                  <h3 style={styles.cartTitle}>Votre panier</h3>
                  <p style={styles.cartHeaderText}>
                    {activeCheckoutStep === "cart" && "Verifiez vos articles avant de continuer."}
                    {activeCheckoutStep === "checkout" &&
                      "Ajoutez vos coordonnees pour preparer la commande."}
                    {activeCheckoutStep === "success" &&
                      "Votre recapitulatif est pret a etre envoye au vendeur."}
                  </p>
                </div>
                <button
                  type="button"
                  style={styles.cartCloseButton}
                  onClick={() => setIsCartOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div style={styles.emptyCartBox}>Votre panier est vide.</div>
              ) : (
                <>
                  {(activeCheckoutStep === "cart" || activeCheckoutStep === "checkout") && (
                    <div style={styles.cartItemsWrap}>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            ...styles.cartItem,
                            ...(isMobile
                              ? {
                                  gap: "10px",
                                  padding: "10px",
                                  borderRadius: "18px",
                                  alignItems: "flex-start",
                                }
                              : {}),
                          }}
                        >
                          <img
                            src={item.image || "/logo.png"}
                            alt={item.name}
                            style={{
                              ...styles.cartItemImage,
                              ...(isMobile ? { width: "84px", height: "84px", flexShrink: 0 } : {}),
                            }}
                          />

                          <div style={styles.cartItemBody}>
                            <div
                              style={{
                                ...styles.cartItemTop,
                                ...(isMobile ? { flexDirection: "column", gap: "8px" } : {}),
                              }}
                            >
                              <div>
                                <h4 style={styles.cartItemTitle}>{item.name}</h4>
                                <p style={styles.cartItemMeta}>
                                  Taille : {item.size} | Couleur : {item.color}
                                </p>
                              </div>
                              <div
                                style={{
                                  ...styles.cartItemPriceBlock,
                                  ...(isMobile ? { alignItems: "flex-start" } : {}),
                                }}
                              >
                                <p style={styles.cartItemPrice}>{formatPrice(item.price)}</p>
                                <p style={styles.cartItemUnitLabel}>par piece</p>
                              </div>
                            </div>

                            <div
                              style={{
                                ...styles.cartItemBottom,
                                ...(isMobile ? { flexDirection: "column", alignItems: "stretch" } : {}),
                              }}
                            >
                              <div style={styles.cartQuantityGroup}>
                                <button
                                  type="button"
                                  style={styles.cartQtyButton}
                                  onClick={() => updateCartQuantity(item.id, "decrease")}
                                >
                                  <Minus size={14} />
                                </button>
                                <span style={styles.cartQtyValue}>{item.quantity}</span>
                                <button
                                  type="button"
                                  style={styles.cartQtyButton}
                                  onClick={() => updateCartQuantity(item.id, "increase")}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div style={styles.cartItemSummary}>
                                <span style={styles.cartItemTotalLabel}>Total article</span>
                                <strong style={styles.cartItemTotalValue}>
                                  {formatPrice(item.price * item.quantity)}
                                </strong>
                              </div>

                              <button
                                type="button"
                                style={styles.removeButton}
                                onClick={() => removeFromCart(item.id)}
                              >
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeCheckoutStep === "checkout" && (
                    <div style={styles.checkoutForm}>
                      <div style={styles.checkoutSavedHint}>
                        Vos informations de commande sont sauvegardees automatiquement sur cet appareil.
                      </div>
                      <div
                        style={{
                          ...styles.checkoutFormRow,
                          ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
                        }}
                      >
                        <label style={styles.checkoutField}>
                          <span style={styles.checkoutLabel}>
                            <User size={14} /> Nom complet
                          </span>
                          <input
                            name="fullName"
                            value={customerInfo.fullName}
                            onChange={handleCustomerInfoChange}
                            placeholder="Votre nom"
                            style={styles.checkoutInput}
                          />
                          {checkoutErrors.fullName && (
                            <span style={styles.checkoutError}>
                              {checkoutErrors.fullName}
                            </span>
                          )}
                        </label>

                        <label style={styles.checkoutField}>
                          <span style={styles.checkoutLabel}>
                            <Phone size={14} /> Telephone
                          </span>
                          <input
                            name="phone"
                            value={customerInfo.phone}
                            onChange={handleCustomerInfoChange}
                            placeholder="06..."
                            style={styles.checkoutInput}
                          />
                          {checkoutErrors.phone && (
                            <span style={styles.checkoutError}>
                              {checkoutErrors.phone}
                            </span>
                          )}
                        </label>
                      </div>

                      <div
                        style={{
                          ...styles.checkoutFormRow,
                          ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
                        }}
                      >
                        <label style={styles.checkoutField}>
                          <span style={styles.checkoutLabel}>
                            <MapPin size={14} /> Ville
                          </span>
                          <input
                            name="city"
                            value={customerInfo.city}
                            onChange={handleCustomerInfoChange}
                            placeholder="Casablanca, Rabat..."
                            style={styles.checkoutInput}
                          />
                          {checkoutErrors.city && (
                            <span style={styles.checkoutError}>
                              {checkoutErrors.city}
                            </span>
                          )}
                        </label>

                        <label style={styles.checkoutField}>
                          <span style={styles.checkoutLabel}>
                            <MapPin size={14} /> Adresse
                          </span>
                          <input
                            name="address"
                            value={customerInfo.address}
                            onChange={handleCustomerInfoChange}
                            placeholder="Quartier, rue, numero..."
                            style={styles.checkoutInput}
                          />
                          {checkoutErrors.address && (
                            <span style={styles.checkoutError}>
                              {checkoutErrors.address}
                            </span>
                          )}
                        </label>
                      </div>

                      <label style={styles.checkoutField}>
                        <span style={styles.checkoutLabel}>
                          <MessageSquare size={14} /> Note de commande
                        </span>
                        <textarea
                          name="note"
                          value={customerInfo.note}
                          onChange={handleCustomerInfoChange}
                          placeholder="Precision sur la livraison ou la commande..."
                          style={styles.checkoutTextarea}
                        />
                      </label>
                    </div>
                  )}

                  {activeCheckoutStep === "success" && (
                    <div style={styles.successBox}>
                      <div style={styles.successBadge}>
                        <CheckCircle2 size={22} />
                      </div>
                      <h4 style={styles.successTitle}>Commande prete</h4>
                      <p style={styles.successText}>
                        Le recapitulatif a ete prepare pour etre envoye au vendeur.
                        Vous pouvez le copier ou le partager directement.
                      </p>

                      <pre style={styles.orderPreview}>
                        {lastPlacedOrder
                          ? `${buildOrderMessage(lastPlacedOrder)}\nReference: ${lastPlacedOrder.reference}`
                          : ""}
                      </pre>
                    </div>
                  )}

                  <div style={styles.cartFooter}>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryRow}>
                        <span>Sous-total</span>
                        <strong>{formatPrice(cartSubtotal)}</strong>
                      </div>
                      <div style={styles.summaryRow}>
                        <span>Livraison</span>
                        <strong>
                          {deliveryFee === 0 ? "Offerte" : formatPrice(deliveryFee)}
                        </strong>
                      </div>
                      <div style={styles.cartTotalRow}>
                        <span>Total</span>
                        <strong>{formatPrice(cartTotal)}</strong>
                      </div>
                    </div>

                    {activeCheckoutStep === "cart" && (
                      <div style={styles.cartFooterActions}>
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={clearCart}
                        >
                          Vider le panier
                        </button>
                        <button
                          type="button"
                          style={styles.goldButtonLarge}
                          onClick={handleCheckout}
                        >
                          Passer commande <ArrowRight size={16} />
                        </button>
                      </div>
                    )}

                    {activeCheckoutStep === "checkout" && (
                      <div style={styles.cartFooterActions}>
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={() => setCheckoutStep("cart")}
                        >
                          Retour panier
                        </button>
                        <button
                          type="button"
                          style={styles.goldButtonLarge}
                          onClick={handlePlaceOrder}
                          disabled={placingOrder}
                        >
                          {placingOrder ? "Confirmation..." : "Confirmer ma commande"}
                        </button>
                      </div>
                    )}

                    {activeCheckoutStep === "success" && (
                      <div style={styles.cartFooterActions}>
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={() => setCheckoutStep("checkout")}
                        >
                          Modifier mes infos
                        </button>
                        <button
                          type="button"
                          style={styles.goldButtonLarge}
                          onClick={clearCart}
                        >
                          Nouvelle commande
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,126,95,0.18), transparent 24%), radial-gradient(circle at top right, rgba(255,210,170,0.22), transparent 30%), linear-gradient(180deg, #fff8f4 0%, #fff1eb 46%, #f8ede8 100%)",
    color: "#1d2433",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "24px 16px 40px",
  },
  container: {
    maxWidth: "1520px",
    margin: "0 auto",
  },
  header: {
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(228,190,170,0.55)",
    borderRadius: "30px",
    padding: "18px 22px",
    marginBottom: "24px",
    boxShadow: "0 18px 50px rgba(194,121,96,0.12)",
    backdropFilter: "blur(18px)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  brandBlock: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  logo: {
    width: "102px",
    height: "102px",
    objectFit: "contain",
    borderRadius: "26px",
    background: "linear-gradient(180deg, #fffefd, #fff3ec)",
    padding: "11px",
    border: "1px solid rgba(224,160,138,0.58)",
    boxShadow: "0 14px 34px rgba(220,132,105,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
    filter: "contrast(1.22) brightness(1.12) saturate(1.08)",
  },
  brandTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "bold",
    letterSpacing: "0.4px",
    color: "#1f2430",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  brandSubtitle: {
    margin: "6px 0 0",
    color: "#6a6170",
    fontSize: "14px",
    maxWidth: "460px",
    lineHeight: 1.6,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  navLink: {
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(228,190,170,0.48)",
    color: "#5a5061",
    cursor: "pointer",
    fontSize: "14px",
    padding: "10px 14px",
    transition: "color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    boxShadow: "0 10px 20px rgba(194,121,96,0.05)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  authButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  navGhostButton: {
    background: "#ffffff",
    border: "1px solid rgba(230,188,168,0.75)",
    color: "#283042",
    borderRadius: "14px",
    padding: "11px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 24px rgba(194,121,96,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  navGoldButton: {
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    border: "none",
    color: "#fff",
    borderRadius: "14px",
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(255,95,109,0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(230,188,168,0.75)",
    borderRadius: "18px",
    padding: "10px 14px",
    minWidth: "170px",
    boxShadow: "0 10px 24px rgba(194,121,96,0.08)",
  },
  userBadgeIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(255,126,95,0.14), rgba(255,95,109,0.2))",
    color: "#d85d49",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userBadgeContent: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  userBadgeLabel: {
    color: "#9b7469",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  userBadgeText: {
    color: "#253043",
    fontWeight: "bold",
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutButton: {
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(255,126,95,0.28)",
    color: "#d85d49",
    borderRadius: "14px",
    padding: "11px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 24px rgba(194,121,96,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  ordersButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.95)",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.28)",
    borderRadius: "14px",
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    position: "relative",
    boxShadow: "0 10px 24px rgba(194,121,96,0.08)",
  },
  ordersBadge: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a06f61",
  },
  searchInput: {
    width: "330px",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(230,188,168,0.75)",
    color: "#283042",
    borderRadius: "14px",
    padding: "13px 14px 13px 38px",
    outline: "none",
  },
  cartButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "13px 18px",
    fontWeight: "bold",
    cursor: "pointer",
    position: "relative",
    boxShadow: "0 16px 30px rgba(255,95,109,0.22)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cartBadge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    minWidth: "22px",
    height: "22px",
    borderRadius: "999px",
    background: "#1f2430",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
  },
  messageBox: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,244,239,0.98))",
    border: "1px solid rgba(255,126,95,0.18)",
    color: "#b24d37",
    padding: "14px 16px",
    borderRadius: "18px",
    marginBottom: "20px",
    boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
  },
  hero: {
    background:
      "linear-gradient(125deg, rgba(255,126,95,0.14), rgba(255,255,255,0.82) 42%, rgba(255,194,160,0.48) 100%)",
    border: "1px solid rgba(230,188,168,0.72)",
    borderRadius: "34px",
    padding: "34px",
    marginBottom: "26px",
    display: "grid",
    gridTemplateColumns: "1.65fr 1fr",
    gap: "24px",
    boxShadow: "0 24px 60px rgba(194,121,96,0.12)",
  },
  heroCompact: {
    gridTemplateColumns: "1.2fr 0.95fr",
    gap: "18px",
    padding: "28px",
  },
  heroMain: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: 0,
  },
  heroBadge: {
    margin: 0,
    color: "#dd5f45",
    fontWeight: "bold",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    fontSize: "12px",
  },
  heroTitle: {
    margin: "12px 0 14px",
    fontSize: "48px",
    lineHeight: 1.04,
    maxWidth: "820px",
    color: "#1f2430",
    fontFamily: "Georgia, 'Times New Roman', serif",
    letterSpacing: "-0.8px",
  },
  heroText: {
    color: "#5c5b68",
    lineHeight: 1.7,
    maxWidth: "700px",
    fontSize: "16px",
  },
  heroActionRow: {
    display: "flex",
    marginTop: "24px",
    width: "100%",
    gap: "14px",
    flexWrap: "wrap",
  },
  heroPrimaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    borderRadius: "16px",
    padding: "15px 24px",
    fontWeight: "bold",
    cursor: "pointer",
    minWidth: "190px",
    boxShadow: "0 18px 34px rgba(255,95,109,0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  heroSecondaryButton: {
    border: "1px solid rgba(219,160,136,0.52)",
    background: "rgba(255,255,255,0.88)",
    color: "#3b4558",
    borderRadius: "16px",
    padding: "15px 24px",
    fontWeight: "bold",
    cursor: "pointer",
    minWidth: "210px",
    boxShadow: "0 14px 26px rgba(194,121,96,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  heroAside: {
    display: "grid",
    gap: "14px",
    alignContent: "stretch",
    minWidth: 0,
  },
  heroFeatureCardLarge: {
    display: "block",
    background:
      "radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 30%), linear-gradient(145deg, #2d2630 0%, #41303a 55%, #8b4d48 100%)",
    color: "#ffffff",
    borderRadius: "28px",
    padding: "24px",
    minHeight: "210px",
    boxShadow: "0 22px 46px rgba(103,58,54,0.24)",
  },
  heroFeatureTitle: {
    color: "rgba(255,233,224,0.72)",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    marginBottom: "8px",
  },
  heroFeatureValue: {
    fontSize: "38px",
    fontWeight: "700",
    color: "#fff7f2",
    marginBottom: "10px",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  heroFeatureText: {
    margin: 0,
    color: "rgba(255,240,235,0.84)",
    lineHeight: 1.6,
  },
  heroFeatures: {
    display: "grid",
    gap: "12px",
  },
  heroFeatureCard: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#344055",
    boxShadow: "0 12px 22px rgba(194,121,96,0.08)",
  },
  toolbar: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
      marginBottom: 0,
    },
    filtersShell: {
      marginBottom: "20px",
    },
    filtersBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginBottom: "12px",
    },
    filtersToggleButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      minWidth: "220px",
      border: "1px solid rgba(230,188,168,0.7)",
      background: "rgba(255,255,255,0.94)",
      color: "#1f2430",
      borderRadius: "16px",
      padding: "14px 16px",
      cursor: "pointer",
      fontWeight: "700",
      boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
    },
    filtersToggleContent: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
    },
    filtersCountBadge: {
      minWidth: "24px",
      height: "24px",
      borderRadius: "999px",
      padding: "0 8px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "800",
      boxShadow: "0 10px 22px rgba(255,95,109,0.18)",
    },
    filtersSummary: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#5e6677",
      fontSize: "14px",
    },
    filtersResetButton: {
      border: "1px solid rgba(255,126,95,0.28)",
      background: "#fff",
      color: "#d85d49",
      borderRadius: "12px",
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: "700",
      whiteSpace: "nowrap",
    },
    filtersPanel: {
      overflow: "hidden",
      background: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(230,188,168,0.52)",
      borderRadius: "24px",
      padding: "18px",
      boxShadow: "0 14px 30px rgba(194,121,96,0.08)",
      backdropFilter: "blur(12px)",
    },
  checkoutHighlights: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },
  checkoutStatCard: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "24px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
  },
  checkoutStatValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#dd5f45",
  },
  checkoutStatLabel: {
    color: "#6d7484",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  accountSection: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 18px 36px rgba(194,121,96,0.08)",
  },
  accountHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },
  accountHeaderActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  accountBadge: {
    margin: 0,
    color: "#dd5f45",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    fontWeight: "bold",
  },
  accountTitle: {
    margin: "8px 0 6px",
    fontSize: "28px",
    color: "#1f2430",
  },
  accountText: {
    margin: 0,
    color: "#5e6677",
    lineHeight: 1.7,
    maxWidth: "760px",
  },
  accountRefreshButton: {
    border: "1px solid rgba(255,126,95,0.28)",
    background: "#fff",
    color: "#d85d49",
    borderRadius: "14px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 24px rgba(194,121,96,0.08)",
  },
  accountIdentity: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  accountIdentityCard: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  accountIdentityLabel: {
    color: "#9b7469",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  accountIdentityValue: {
    color: "#253043",
    fontSize: "16px",
  },
  accountEmptyBox: {
    background: "#fff8f4",
    border: "1px dashed rgba(224,160,138,0.58)",
    borderRadius: "18px",
    padding: "24px",
    color: "#7a8090",
    textAlign: "center",
  },
  accountOrdersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  accountSectionsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  accountSectionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  accountSectionHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  accountSectionTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#1f2430",
  },
  accountSectionText: {
    margin: 0,
    color: "#7a8090",
    fontSize: "13px",
  },
  accountOrderCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,242,0.96))",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "24px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 14px 30px rgba(194,121,96,0.08)",
  },
  accountOrderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  accountOrderTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#1f2430",
  },
  accountOrderMeta: {
    margin: "6px 0 0",
    color: "#7a8090",
    fontSize: "13px",
  },
  accountOrderStatus: {
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  accountOrderStatusPending: {
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
  },
  accountOrderStatusConfirmed: {
    background: "rgba(0,255,100,0.12)",
    color: "#2b9d63",
  },
  accountOrderStatusDelivered: {
    background: "rgba(76,175,80,0.14)",
    color: "#237847",
  },
  accountOrderStatusCancelled: {
    background: "rgba(255,0,0,0.12)",
    color: "#d34f4f",
  },
  accountOrderInfo: {
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "16px",
    padding: "14px",
    color: "#4d586b",
  },
  timelineWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  timelineStep: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "rgba(230,188,168,0.65)",
    border: "2px solid rgba(255,255,255,0.95)",
    boxShadow: "0 0 0 1px rgba(230,188,168,0.65)",
  },
  timelineDotActive: {
    background: "#ff6a63",
    boxShadow: "0 0 0 1px rgba(255,106,99,0.26)",
  },
  timelineLine: {
    position: "absolute",
    top: "6px",
    left: "14px",
    right: "-8px",
    height: "2px",
    background: "rgba(230,188,168,0.55)",
  },
  timelineLineActive: {
    background: "linear-gradient(90deg, #ff7e5f 0%, #ff5f6d 100%)",
  },
  timelineLabel: {
    fontSize: "12px",
    color: "#8a90a1",
    fontWeight: "600",
  },
  timelineLabelActive: {
    color: "#334155",
  },
  timelineCancelledBox: {
    background: "rgba(255,0,0,0.08)",
    color: "#c24141",
    border: "1px solid rgba(255,0,0,0.12)",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: "600",
  },
  accountOrderInfoLine: {
    margin: "0 0 10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "13px",
  },
  accountOrderItems: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  accountOrderItemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "14px",
    color: "#4d586b",
  },
  accountOrderFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
    color: "#1f2430",
    paddingTop: "8px",
    borderTop: "1px solid rgba(230,188,168,0.5)",
  },
  ordersOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20, 24, 32, 0.38)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1400,
  },
  infoOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20, 24, 32, 0.42)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1450,
  },
  infoModal: {
    width: "100%",
    maxWidth: "760px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,242,0.97))",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "28px",
    padding: "24px",
    position: "relative",
    boxShadow: "0 24px 60px rgba(194,121,96,0.18)",
  },
  infoSections: {
    display: "grid",
    gap: "14px",
    marginTop: "20px",
  },
  infoSectionCard: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(230,188,168,0.56)",
    borderRadius: "18px",
    padding: "18px",
  },
  infoSectionTitle: {
    margin: "0 0 8px",
    color: "#1f2430",
    fontSize: "18px",
  },
  infoSectionText: {
    margin: 0,
    color: "#5e6677",
    lineHeight: 1.7,
  },
  contactActionLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "14px",
    padding: "11px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: "700",
    color: "#ffffff",
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    boxShadow: "0 14px 26px rgba(255,95,109,0.18)",
  },
  ordersPanelTitle: {
    margin: "8px 0 6px",
    fontSize: "28px",
    color: "#1f2430",
  },
  ordersPanelText: {
    margin: 0,
    color: "#5e6677",
    lineHeight: 1.7,
  },
  select: {
      background: "rgba(255,255,255,0.94)",
      border: "1px solid rgba(230,188,168,0.7)",
      color: "#293243",
      borderRadius: "14px",
      padding: "13px 14px",
      outline: "none",
      minWidth: 0,
      width: "100%",
    },
  retryButton: {
    marginTop: "12px",
    border: "1px solid rgba(255,126,95,0.28)",
    background: "#fff",
    color: "#d85d49",
    borderRadius: "12px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  loadingBox: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(230,188,168,0.6)",
    borderRadius: "20px",
    padding: "30px",
    textAlign: "center",
    color: "#697181",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  productsGridCompact: {
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 360px))",
    justifyContent: "center",
    gap: "20px",
  },
  productCard: {
    background:
      "radial-gradient(circle at top right, rgba(255,126,95,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,242,0.97))",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow: "0 18px 36px rgba(194,121,96,0.11)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },
  productImageWrap: {
    width: "100%",
    height: "390px",
    background: "linear-gradient(180deg, #fbefe8, #f0d9cf)",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    padding: "22px",
  },
  productTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  featuredBadge: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,126,95,0.22)",
  },
  productTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#1f2430",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  productCategory: {
    color: "#907268",
    fontSize: "12px",
    margin: "6px 0 10px",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  },
  productPrice: {
    color: "#dd5f45",
    fontSize: "26px",
    fontWeight: "bold",
    margin: "0 0 10px",
  },
  metaText: {
    color: "#4d586b",
    fontSize: "13px",
    margin: "4px 0",
  },
  stockOk: {
    background: "rgba(0,255,100,0.12)",
    color: "#7df7aa",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  stockLow: {
    background: "rgba(212,175,55,0.12)",
    color: "#f3d77c",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  stockOut: {
    background: "rgba(255,0,0,0.12)",
    color: "#ff8a8a",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  cardButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  outlineButton: {
    flex: 1,
    background: "rgba(255,255,255,0.95)",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.28)",
    borderRadius: "14px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 10px 22px rgba(194,121,96,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  },
  goldButton: {
    flex: 1,
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 14px 28px rgba(255,95,109,0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  goldButtonLarge: {
    width: "100%",
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 16px 28px rgba(255,95,109,0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
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
    maxWidth: "1100px",
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: "24px",
    padding: "24px",
    position: "relative",
  },
  closeButton: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid #333",
    background: "#181818",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  detailImageWrap: {
    width: "100%",
    height: "560px",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#0b0b0b",
    position: "relative",
  },
  detailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  detailNoImage: {
    width: "100%",
    height: "560px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    background: "#0b0b0b",
    color: "#777",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "32px",
  },
  modalPrice: {
    color: "#f3d77c",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 12px",
  },
  modalDescription: {
    color: "#ccc",
    lineHeight: 1.7,
    marginBottom: "16px",
  },
  infoBox: {
    background: "#171717",
    border: "1px solid #2a2a2a",
    borderRadius: "16px",
    padding: "16px",
    lineHeight: 1.8,
    color: "#ddd",
    marginBottom: "18px",
  },
  quantityBox: {
    background: "#171717",
    border: "1px solid #2a2a2a",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityLabel: {
    color: "#e7e7e7",
    fontWeight: "bold",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  qtyButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: "32px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "18px",
  },
  modalActionButtons: {
    display: "flex",
    gap: "12px",
  },
  cartOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(34,26,24,0.12) 0%, rgba(34,26,24,0.28) 35%, rgba(34,26,24,0.46) 100%)",
    backdropFilter: "blur(8px)",
    zIndex: 1100,
  },
  cartDrawer: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: "100%",
    maxWidth: "460px",
    background:
      "radial-gradient(circle at top right, rgba(255,126,95,0.18), transparent 30%), linear-gradient(180deg, #fffdfb 0%, #fff5ef 100%)",
    borderLeft: "1px solid rgba(230,188,168,0.62)",
    padding: "24px 20px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
    boxShadow: "-24px 0 60px rgba(194,121,96,0.16)",
  },
  cartTitle: {
    margin: 0,
    color: "#1f2430",
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-0.4px",
  },
  cartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(230,188,168,0.5)",
  },
  cartHeaderText: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
    maxWidth: "290px",
    lineHeight: 1.6,
  },
  cartCloseButton: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "1px solid rgba(230,188,168,0.72)",
    background: "rgba(255,255,255,0.92)",
    color: "#7d5e56",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(194,121,96,0.1)",
  },
  emptyCartBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7a8090",
    border: "1px dashed rgba(224,160,138,0.58)",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.7)",
  },
  cartItemsWrap: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    paddingRight: "6px",
  },
  cartItem: {
    display: "flex",
    gap: "14px",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "22px",
    padding: "14px",
    boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
  },
  cartItemImage: {
    width: "92px",
    height: "118px",
    objectFit: "cover",
    borderRadius: "16px",
    background: "linear-gradient(180deg, #fff8f4, #f7e4db)",
    border: "1px solid rgba(230,188,168,0.45)",
  },
  cartItemBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cartItemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  cartItemTitle: {
    margin: "0 0 6px",
    fontSize: "20px",
    color: "#1f2430",
    fontWeight: "700",
  },
  cartItemMeta: {
    margin: 0,
    color: "#6f7788",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  cartItemPriceBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  cartItemPrice: {
    margin: 0,
    color: "#dd5f45",
    fontSize: "20px",
    fontWeight: "bold",
  },
  cartItemUnitLabel: {
    margin: 0,
    color: "#a07e72",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cartItemBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  cartQuantityGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 8px",
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "16px",
  },
  cartQtyButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid rgba(255,126,95,0.18)",
    background: "#ffffff",
    color: "#d85d49",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(194,121,96,0.08)",
  },
  cartQtyValue: {
    minWidth: "24px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#253043",
    fontSize: "18px",
  },
  cartItemSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  cartItemTotalLabel: {
    color: "#9b7469",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.45px",
  },
  cartItemTotalValue: {
    color: "#1f2430",
    fontSize: "16px",
  },
  removeButton: {
    marginLeft: "auto",
    background: "rgba(255,126,95,0.1)",
    border: "1px solid rgba(255,126,95,0.2)",
    color: "#d85d49",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "12px",
    padding: "10px 14px",
  },
  checkoutForm: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "18px 0 6px",
  },
  checkoutFormRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  checkoutField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  checkoutLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#4d586b",
    fontWeight: "bold",
  },
  checkoutInput: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.75)",
    borderRadius: "14px",
    color: "#253043",
    padding: "12px 14px",
    outline: "none",
    boxShadow: "0 8px 18px rgba(194,121,96,0.05)",
  },
  checkoutTextarea: {
    minHeight: "88px",
    resize: "vertical",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.75)",
    borderRadius: "14px",
    color: "#253043",
    padding: "12px 14px",
    outline: "none",
    boxShadow: "0 8px 18px rgba(194,121,96,0.05)",
  },
  checkoutError: {
    color: "#d34f4f",
    fontSize: "12px",
  },
  checkoutSavedHint: {
    background: "rgba(255,126,95,0.08)",
    border: "1px solid rgba(255,126,95,0.16)",
    borderRadius: "14px",
    padding: "12px 14px",
    color: "#6a7283",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  successBox: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,247,242,0.98))",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "20px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  successBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "rgba(212,175,55,0.18)",
    color: "#f3d77c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#1f2430",
  },
  successText: {
    margin: 0,
    color: "#5e6677",
    lineHeight: 1.6,
  },
  orderPreview: {
    margin: 0,
    whiteSpace: "pre-wrap",
    background: "#fff8f4",
    border: "1px solid rgba(230,188,168,0.55)",
    borderRadius: "16px",
    padding: "14px",
    color: "#364154",
    fontFamily: "Consolas, monospace",
    fontSize: "12px",
    lineHeight: 1.6,
  },
  cartFooter: {
    borderTop: "1px solid rgba(230,188,168,0.5)",
    paddingTop: "18px",
    marginTop: "16px",
  },
  summaryCard: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "20px",
    padding: "16px",
    marginBottom: "14px",
    boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    color: "#4d586b",
    fontSize: "14px",
  },
  cartTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    fontSize: "19px",
    color: "#1f2430",
    fontWeight: "800",
    paddingTop: "10px",
    borderTop: "1px solid rgba(230,188,168,0.45)",
  },
  cartFooterActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerInfo: {
    marginTop: "32px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  footerInfoCard: {
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(230,188,168,0.62)",
      borderRadius: "24px",
      padding: "20px",
      minHeight: "188px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: "0 12px 26px rgba(194,121,96,0.08)",
    },
    footerInfoCardBody: {
      display: "grid",
      gap: "8px",
    },
    footerInfoTitle: {
      margin: "0 0 8px",
      color: "#1f2430",
      fontSize: "20px",
    },
    footerInfoText: {
      margin: 0,
      color: "#5e6677",
      lineHeight: 1.7,
    },
    footerInfoButton: {
      ...{
        background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
        border: "none",
        color: "#fff",
        borderRadius: "14px",
        padding: "11px 14px",
        cursor: "pointer",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        boxShadow: "0 14px 26px rgba(255,95,109,0.2)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      },
      marginTop: "16px",
      alignSelf: "flex-start",
    },
    siteFooter: {
      marginTop: "22px",
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: "40px",
      width: "100vw",
      marginLeft: "calc(50% - 50vw)",
      marginBottom: "-40px",
      padding: "44px 56px",
      minHeight: "320px",
      alignItems: "stretch",
      borderRadius: 0,
      background:
        "linear-gradient(135deg, rgba(39,35,47,0.96) 0%, rgba(85,56,57,0.93) 52%, rgba(205,110,90,0.88) 100%)",
      color: "#fff7f2",
      border: "none",
      boxShadow: "0 24px 60px rgba(88,54,53,0.22)",
    },
    siteFooterBrand: {
      display: "grid",
      gap: "14px",
      alignContent: "space-between",
    },
    siteFooterEyebrow: {
      fontSize: "12px",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "rgba(255,221,205,0.78)",
      fontWeight: "700",
    },
    siteFooterTitle: {
      margin: 0,
      fontSize: "42px",
      lineHeight: 1.15,
      color: "#fffaf7",
      fontFamily: "Georgia, 'Times New Roman', serif",
    },
    siteFooterText: {
      margin: 0,
      color: "rgba(255,240,232,0.84)",
      lineHeight: 1.9,
      maxWidth: "720px",
      fontSize: "18px",
    },
    siteFooterLinks: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "28px",
      alignContent: "space-between",
    },
    siteFooterColumn: {
      display: "grid",
      alignContent: "start",
      gap: "14px",
    },
    siteFooterColumnTitle: {
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "rgba(255,221,205,0.78)",
      fontWeight: "700",
      marginBottom: "4px",
    },
    siteFooterLink: {
      background: "transparent",
      border: "none",
      padding: 0,
      textAlign: "left",
      color: "#fff7f2",
      cursor: "pointer",
      fontSize: "15px",
    },
    siteFooterAnchor: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      color: "#fff7f2",
      textDecoration: "none",
      fontSize: "15px",
    },
  secondaryButton: {
    width: "100%",
    background: "rgba(255,255,255,0.95)",
    color: "#d85d49",
    border: "1px solid rgba(255,126,95,0.28)",
    borderRadius: "14px",
    padding: "13px 16px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 10px 22px rgba(194,121,96,0.08)",
  },
};















