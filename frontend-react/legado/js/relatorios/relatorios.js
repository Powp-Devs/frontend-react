// Sistema de Relatórios - JavaScript
class RelatoriosManager {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('products')) || [];
    this.employees = JSON.parse(localStorage.getItem('employees')) || [];
    this.clients = JSON.parse(localStorage.getItem('clients')) || [];
    this.sales = JSON.parse