// Sample product data
const products = [
    {
      id: 1,
      code: 'B450-M',
      name: 'Placa mãe asus B450-M',
      price: 499.27,
      stock: 50
    },
    {
      id: 2,
      code: 'I3-13900K',
      name: 'Processador Intel Core i3-13900k',
      price: 689.99,
      stock: 30
    },
    {
      id: 3,
      code: 'RTX4060',
      name: 'Placa de Vídeo RTX 4060',
      price: 2499.99,
      stock: 15
    }
  ];
  
  class ProductManager {
    constructor() {
      this.products = products;
    }
  
    getProduct(id) {
      return this.products.find(p => p.id === id);
    }
  
    getProducts() {
      return this.products;
    }
  
    searchProducts(term) {
      const searchTerm = term.toLowerCase();
      return this.products.filter(product => 
        product.code.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm)
      );
    }
  
    checkStock(productId, quantity) {
      const product = this.getProduct(productId);
      return product && product.stock >= quantity;
    }
  }
  
  const productManager = new ProductManager();