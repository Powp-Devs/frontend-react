import { useState, useCallback } from 'react';

interface UseCRUDOptions<T> {
  fetchAll: (page: number, pageSize: number) => Promise<{ data: T[] }>;
  create: (item: Omit<T, 'id'>) => Promise<any>;
  update: (id: number, item: Partial<T>) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

export function useCRUD<T extends { id: number }>(options: UseCRUDOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await options.fetchAll(page, itemsPerPage);
      setItems(response.data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao buscar items', error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const handleSave = useCallback(async (data: Partial<T>) => {
    try {
      if (editingItem) {
        await options.update(editingItem.id, data);
      } else {
        await options.create(data as Omit<T, 'id'>);
      }
      
      await fetchItems(currentPage);
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({});
      return true;
    } catch (err) {
      console.error('Erro ao salvar', err);
      return false;
    }
  }, [editingItem, options, fetchItems, currentPage]);

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Deseja realmente deletar este item?')) {
      try {
        await options.delete(id);
        await fetchItems(currentPage);
      } catch (err) {
        console.error('Erro ao deletar', err);
      }
    }
  }, [options, fetchItems, currentPage]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  return {
    items,
    loading,
    isModalOpen,
    editingItem,
    formData,
    currentPage,
    setFormData,
    setIsModalOpen,
    setItems,
    fetchItems,
    handleSave,
    handleEdit,
    handleDelete,
    handleOpenNew,
    setCurrentPage
  };
}
