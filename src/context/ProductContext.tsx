'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'bundle' | 'subject' | 'chapter' | 'material' | 'test_series';
    targetIds: string[]; // IDs of content this product unlocks (e.g. 'physics', 'chapter-123')
    features: string[]; // For display in pricing cards
    isActive: boolean;
    isRecommended?: boolean;
    color?: string; // Hex code for UI styling
    image?: string;
    originalPrice?: number;
}

// Initial default products to maintain backward compatibility
const DEFAULT_PRODUCTS: Product[] = [
    {
        id: 'full-year',
        name: 'NEET 2026 Full Course',
        description: 'Complete access to Physics, Chemistry, and Biology',
        price: 9999,
        originalPrice: 24999,
        type: 'bundle',
        targetIds: ['full_bundle', 'physics', 'chemistry', 'biology'],
        features: ['All 3 Subjects', 'Live Classes', 'Physical Study Material', 'Personal Mentor', 'Doubt Support'],
        isActive: true,
        isRecommended: true,
        color: '#DC2626'
    },
    {
        id: 'crash-course',
        name: 'Physics Crash Course',
        description: 'Complete Physics in 60 Days',
        price: 2499,
        originalPrice: 4999,
        type: 'subject',
        targetIds: ['physics'],
        features: ['Complete Physics in 60 Days', 'Formula Sheets', 'Daily Practice Problems', 'Previous Year Questions'],
        isActive: true,
        color: '#FF5722'
    },
    {
        id: 'test-series',
        name: 'All India Test Series',
        description: 'Comprehensive Mock Tests for NEET',
        price: 999,
        originalPrice: 1999,
        type: 'test_series',
        targetIds: ['test_series'],
        features: ['50+ Mock Tests', 'AIR Prediction', 'Detailed Analytics', 'Video Solutions'],
        isActive: true,
        color: '#FFC107'
    }
];

interface ProductContextType {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    getProductByTarget: (targetId: string) => Product | undefined; // Find cheaper/specific product for a target
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadProducts = async () => {
            const { supabase } = await import('@/lib/supabase');
            const { data, error } = await supabase.from('products').select('*');
            if (error) {
                console.error('Error loading products:', error);
                setProducts(DEFAULT_PRODUCTS); // Fallback
            } else if (data) {
                // Map snake_case DB fields to camelCase if needed, but here we used matching names in SQL except arrays
                // Arrays in Postgres text[] come back as arrays in JS, so it should match Product interface
                // Actually, SQL uses snake_case for `target_ids`, `is_active` etc. Need mapping.
                const mapped = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    originalPrice: p.original_price, // Map from DB
                    type: p.type,
                    targetIds: p.target_ids || [],
                    features: p.features || [],
                    isActive: p.is_active,
                    isRecommended: p.is_recommended,
                    color: p.color,
                    image: p.image
                }));

                setProducts(mapped);
            }
            setIsLoaded(true);
        };
        loadProducts();
    }, []);

    const addProduct = async (product: Product) => {
        const { supabase } = await import('@/lib/supabase');
        const dbProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            type: product.type,
            target_ids: product.targetIds,
            features: product.features,
            is_active: product.isActive,
            is_recommended: product.isRecommended,
            color: product.color,
            image: product.image
        };

        const { error } = await supabase.from('products').insert(dbProduct);
        if (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        } else {
            setProducts(prev => [...prev, product]);
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        const { supabase } = await import('@/lib/supabase');

        // Map updates to DB columns
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.price) dbUpdates.price = updates.price;
        if (updates.type) dbUpdates.type = updates.type;
        if (updates.targetIds) dbUpdates.target_ids = updates.targetIds;
        if (updates.features) dbUpdates.features = updates.features;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.isRecommended !== undefined) dbUpdates.is_recommended = updates.isRecommended;
        if (updates.color) dbUpdates.color = updates.color;
        if (updates.image) dbUpdates.image = updates.image;

        const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);

        if (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        } else {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        }
    };

    const deleteProduct = async (id: string) => {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        } else {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const getProductByTarget = (targetId: string) => {
        return products.find(p => p.isActive && p.targetIds.includes(targetId));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductByTarget }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};
