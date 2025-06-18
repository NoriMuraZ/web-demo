import React, { useState } from 'react';
import DataTable from '../DataTable/DataTable';
import ProductForm from '../Forms/ProductForm';
import { Product } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useApp } from '../../context/AppContext';
import { mockProducts } from '../../data/mockData';

const ProductsView: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', mockProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const { addActivity, addNotification } = useApp();

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
      
      // アクティビティ記録
      addActivity(
        'delete',
        'product',
        product.id,
        product.name,
        '商品削除',
        `商品「${product.name}」が削除されました`
      );
      
      // 通知表示
      addNotification(
        'success',
        '商品削除完了',
        `商品「${product.name}」を削除しました`
      );
    }
  };

  const handleSave = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingProduct) {
      // 既存商品の更新
      const updatedProduct = { ...editingProduct, ...productData, updatedAt: now };
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));
      
      // アクティビティ記録
      addActivity(
        'update',
        'product',
        editingProduct.id,
        productData.name,
        '商品更新',
        `商品「${productData.name}」が更新されました`
      );
      
      // 通知表示
      addNotification(
        'success',
        '商品更新完了',
        `商品「${productData.name}」を更新しました`
      );
      
      // 在庫警告チェック
      if (productData.stock < 10 && productData.stock > 0) {
        addActivity(
          'warning',
          'product',
          editingProduct.id,
          productData.name,
          '在庫警告',
          `商品「${productData.name}」の在庫が少なくなっています（残り${productData.stock}個）`
        );
        
        addNotification(
          'warning',
          '在庫警告',
          `商品「${productData.name}」の在庫が少なくなっています`
        );
      } else if (productData.stock === 0) {
        addActivity(
          'warning',
          'product',
          editingProduct.id,
          productData.name,
          '在庫切れ',
          `商品「${productData.name}」の在庫が切れました`
        );
        
        addNotification(
          'error',
          '在庫切れ',
          `商品「${productData.name}」の在庫が切れました`
        );
      }
    } else {
      // 新規商品の作成
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      setProducts(prev => [...prev, newProduct]);
      
      // アクティビティ記録
      addActivity(
        'create',
        'product',
        newProduct.id,
        productData.name,
        '商品作成',
        `新しい商品「${productData.name}」が作成されました`
      );
      
      // 通知表示
      addNotification(
        'success',
        '商品作成完了',
        `新しい商品「${productData.name}」を作成しました`
      );
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