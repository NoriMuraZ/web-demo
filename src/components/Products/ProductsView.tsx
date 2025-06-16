import React, { useState } from 'react';
import DataTable from '../DataTable/DataTable';
import ProductForm from '../Forms/ProductForm';
import { Product } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { mockProducts } from '../../data/mockData';

const ProductsView: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', mockProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const columns = [
    {
      key: 'name',
      label: '商品名',
      sortable: true,
    },
    {
      key: 'category',
      label: 'カテゴリ',
      sortable: true,
    },
    {
      key: 'price',
      label: '価格',
      sortable: true,
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      key: 'stock',
      label: '在庫数',
      sortable: true,
      render: (value: number) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 0 ? 'bg-red-100 text-red-800' :
          value < 10 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'active' ? '有効' : '無効'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: '最終更新日',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('ja-JP'),
    },
  ];

  const handleAdd = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`商品「${product.name}」を削除してもよろしいですか？`)) {
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleSave = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingProduct) {
      // 既存商品の更新
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...editingProduct, ...productData, updatedAt: now }
          : p
      ));
    } else {
      // 新規商品の作成
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      setProducts(prev => [...prev, newProduct]);
    }
    
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        title="商品管理"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default ProductsView;