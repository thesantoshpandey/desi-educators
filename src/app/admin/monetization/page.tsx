'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { ChevronDown, ChevronRight, Save, Plus, Trash2, Tag, Lock, IndianRupee, Check } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { useProduct } from '@/context/ProductContext';

interface Coupon {
    code: string;
    discount: number;
    type: 'percent' | 'flat';
    active: boolean;
}

interface LockSettings {
    [subject: string]: boolean; // true = Locked (Paid), false = Free
}

interface ItemPrices {
    [itemId: string]: string; // Price in INR
}

const DEFAULT_COUPONS: Coupon[] = [
    { code: 'NEET2026', discount: 10, type: 'percent', active: true },
    { code: 'EARLYBIRD', discount: 500, type: 'flat', active: true }
];

const DEFAULT_LOCKS: LockSettings = {
    physics: true,
    chemistry: true,
    biology: true
};

const SubjectLockManager = ({ subject, locks, toggleLock }: {
    subject: string,
    locks: LockSettings,
    toggleLock: (key: string) => void
}) => {
    const { getChaptersBySubject, updateMaterial } = useContent();
    const [expanded, setExpanded] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
    const chapters = getChaptersBySubject(subject);

    const toggleChapterExpand = (chapterId: string) => {
        setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
    };

    const handlePriceChange = async (subjectId: string, chapterId: string, topicId: string, materialId: string, val: string) => {
        // Update DB
        const price = parseFloat(val) || 0;
        await updateMaterial(subjectId, chapterId, topicId, materialId, { price });
    };

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Subject Header Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
            }} onClick={() => setExpanded(!expanded)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {locks[subject] ? <Lock size={18} color="#dc2626" /> : <Lock size={18} color="#B91C1C" style={{ opacity: 0.5 }} />}
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{subject}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: locks[subject] ? '#dc2626' : '#B91C1C', fontWeight: 500 }}>
                        {locks[subject] ? 'Course Locked' : 'Course Free'}
                    </span>
                    <label className="switch" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={!!locks[subject]}
                            onChange={() => toggleLock(subject)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* Expanded Chapters List */}
            {expanded && (
                <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                    {chapters.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No chapters found for {subject}.</div>
                    ) : (
                        chapters.map(chapter => {
                            const lockKey = `${subject}_${chapter.id}`;
                            const isLocked = !!locks[lockKey];
                            const isChapterExpanded = expandedChapters[chapter.id];

                            return (
                                <div key={chapter.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 16px 10px 40px',
                                        backgroundColor: '#fafafa'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleChapterExpand(chapter.id)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                {isChapterExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
                                            </button>
                                            <span style={{ fontSize: '0.9rem', color: '#334155' }}>{chapter.title}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '0.75rem', color: isLocked ? '#dc2626' : '#94a3b8' }}>
                                                {isLocked ? 'Locked' : 'Unlocked'}
                                            </span>
                                            <label className="switch" style={{ width: '34px', height: '18px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isLocked}
                                                    onChange={() => toggleLock(lockKey)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Expanded Topics & Materials (Pricing Interaction) */}
                                    {isChapterExpanded && (
                                        <div style={{ padding: '8px 16px 8px 60px', backgroundColor: 'white' }}>
                                            {chapter.topics.length === 0 ? (
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No topics available.</div>
                                            ) : (
                                                chapter.topics.map(topic => (
                                                    <div key={topic.id} style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>{topic.title}</div>
                                                        {topic.materials.length === 0 ? (
                                                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>No materials.</div>
                                                        ) : (
                                                            topic.materials.map(material => (
                                                                <div key={material.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.85rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <Tag size={12} color="#64748b" />
                                                                        <span>{material.title}</span>
                                                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({material.type})</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        {(!material.price || material.price === 0) && <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Free</span>}
                                                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                                            <IndianRupee size={12} style={{ position: 'absolute', left: '8px', color: '#64748b' }} />
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Price"
                                                                                defaultValue={(material.price || 0) > 0 ? material.price : ''}
                                                                                onBlur={(e) => handlePriceChange(subject, chapter.id, topic.id, material.id, e.target.value)}
                                                                                style={{
                                                                                    width: '70px',
                                                                                    padding: '4px 4px 4px 20px',
                                                                                    fontSize: '0.8rem',
                                                                                    border: '1px solid #e2e8f0',
                                                                                    borderRadius: '4px'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const ProductManager = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProduct();
    const { subjects, getChaptersBySubject } = useContent();
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);
    const [showContentSelector, setShowContentSelector] = useState(false);

    const initialProductState = {
        id: '',
        name: '',
        description: '',
        price: '',
        type: 'bundle',
        targetIds: '',
        features: '',
        isActive: true,
        color: '#DC2626',
        isRecommended: false
    };

    const [formData, setFormData] = useState(initialProductState);

    const toggleTargetId = (id: string) => {
        const currentIds = formData.targetIds ? formData.targetIds.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (currentIds.includes(id)) {
            setFormData({ ...formData, targetIds: currentIds.filter(cid => cid !== id).join(', ') });
        } else {
            setFormData({ ...formData, targetIds: [...currentIds, id].join(', ') });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            ...formData,
            id: formData.id || Date.now().toString(),
            price: Number(formData.price),
            targetIds: formData.targetIds.split(',').map(s => s.trim()),
            features: formData.features.split(',').map(s => s.trim())
        };

        if (isEditing && currentProduct) {
            updateProduct(currentProduct.id, productData as any);
        } else {
            addProduct(productData as any);
        }

        setFormData(initialProductState);
        setIsEditing(false);
        setCurrentProduct(null);
    };

    const handleEdit = (product: any) => {
        setFormData({
            ...product,
            price: product.price.toString(),
            targetIds: product.targetIds.join(', '),
            features: product.features.join(', '),
            isRecommended: product.isRecommended || false,
            color: product.color || '#DC2626'
        });
        setCurrentProduct(product);
        setIsEditing(true);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Card title={isEditing ? "Edit Product" : "Create New Product"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Product Name</label>
                        <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Physics Bundle" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Price (₹)</label>
                            <Input type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Type</label>
                            <select
                                value={formData.type || 'bundle'}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="bundle">Bundle</option>
                                <option value="subject">Subject</option>
                                <option value="chapter">Chapter</option>
                                <option value="test_series">Test Series</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
                        <Input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Target Content</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <Button type="button" variant="outline" onClick={() => setShowContentSelector(!showContentSelector)}>
                                {showContentSelector ? 'Hide Selection' : 'Select Content'}
                            </Button>
                            <div style={{ flex: 1, padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>
                                {formData.targetIds || 'No content selected'}
                            </div>
                        </div>

                        {showContentSelector && (
                            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>Check the items you want this product to unlock.</p>

                                {/* Standard Targets */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Subjects & Global</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {['full_bundle', 'test_series', ...subjects.map(s => s.id)].map(id => {
                                            const isSelected = formData.targetIds?.split(',').map(s => s.trim()).includes(id);
                                            return (
                                                <div
                                                    key={id}
                                                    onClick={() => toggleTargetId(id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        border: isSelected ? '1px solid #DC2626' : '1px solid #cbd5e1',
                                                        backgroundColor: isSelected ? '#ecfdf5' : 'white',
                                                        color: isSelected ? '#065f46' : '#64748b',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    {isSelected && <Check size={12} />} {id}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic Chapters */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Specific Chapters</div>
                                    {subjects.map(subject => {
                                        const chapters = getChaptersBySubject(subject.id);
                                        if (chapters.length === 0) return null;
                                        return (
                                            <div key={subject.id}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '4px', textTransform: 'capitalize' }}>{subject.title}</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                                    {chapters.map(chapter => {
                                                        const isSelected = formData.targetIds?.split(',').map(s => s.trim()).includes(chapter.id);
                                                        return (
                                                            <div
                                                                key={chapter.id}
                                                                onClick={() => toggleTargetId(chapter.id)}
                                                                style={{
                                                                    padding: '6px 10px',
                                                                    borderRadius: '6px',
                                                                    border: isSelected ? '1px solid #DC2626' : '1px solid #e2e8f0',
                                                                    backgroundColor: isSelected ? '#ecfdf5' : 'white',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                                title={chapter.title}
                                                            >
                                                                {chapter.title}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Features (comma separated)</label>
                        <Input value={formData.features || ''} onChange={e => setFormData({ ...formData, features: e.target.value })} placeholder="e.g. Live Classes, PDF Notes" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Color</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input type="color" value={formData.color || '#DC2626'} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ width: '50px', padding: '2px' }} />
                                <Input value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Active</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({ ...formData, isRecommended: e.target.checked })} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Recommended</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <Button type="submit" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> {isEditing ? 'Update Product' : 'Create Product'}
                        </Button>
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setFormData(initialProductState); setCurrentProduct(null); }}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {products.map(product => (
                    <Card key={product.id} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{product.name}</h3>
                                    {product.isRecommended && <span style={{ fontSize: '0.7rem', backgroundColor: '#DC2626', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>REC</span>}
                                    {!product.isActive && <span style={{ fontSize: '0.7rem', backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>INACTIVE</span>}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>{product.description}</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>
                                        {product.type}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', backgroundColor: '#ecfdf5', borderRadius: '4px', color: '#047857', fontWeight: 600 }}>
                                        ₹{product.price}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Edit</Button>
                                <button onClick={() => deleteProduct(product.id)} style={{ padding: '8px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default function MonetizationPage() {
    const { subjects } = useContent();
    const [activeTab, setActiveTab] = useState<'locks' | 'products' | 'coupons'>('locks');

    // ... (Keep existing state hooks for Locks/Coupons if needed, or refactor to separate components entirely)
    // For cleaner code, let's assume SubjectLockManager and Coupons logic is moved or kept here if we don't delete.
    // To save context space, I will re-implement the structure surrounding the tabs.

    // Existing State
    // Existing State
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [locks, setLocks] = useState<LockSettings>(DEFAULT_LOCKS); // Keep locks local for now as visual toggle

    // Derived or unused state removed (itemPrices handled via context now)

    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percent' as const });

    useEffect(() => {
        // Load coupons from Supabase
        const fetchCoupons = async () => {
            const { supabase } = await import('@/lib/supabase');
            const { data, error } = await supabase.from('coupons').select('*');
            if (data) setCoupons(data);
        };
        fetchCoupons();

        // Load locks (Local Preference for UI)
        const storedLocks = localStorage.getItem('contentLocks');
        if (storedLocks) setLocks(JSON.parse(storedLocks));
    }, []);

    const handleAddCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        const coupon: Coupon = {
            code: newCoupon.code.toUpperCase(),
            discount: Number(newCoupon.discount),
            type: newCoupon.type,
            active: true
        };

        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.from('coupons').insert(coupon);

        if (error) {
            console.error('Error adding coupon', error);
            alert('Failed to add coupon');
        } else {
            setCoupons([...coupons, coupon]);
            setNewCoupon({ code: '', discount: '', type: 'percent' });
        }
    };

    const handleDeleteCoupon = async (code: string) => {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.from('coupons').delete().eq('code', code);

        if (!error) {
            setCoupons(coupons.filter(c => c.code !== code));
        }
    };

    const toggleLock = (subject: string) => {
        const updated = { ...locks, [subject]: !locks[subject] };
        setLocks(updated);
        localStorage.setItem('contentLocks', JSON.stringify(updated));
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Monetization & Products</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage course access, pricing, and product bundles.</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                {['locks', 'products', 'coupons'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === tab ? '2px solid #DC2626' : '2px solid transparent',
                            color: activeTab === tab ? '#DC2626' : '#64748b',
                            fontWeight: activeTab === tab ? 600 : 500,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'locks' ? 'Content Locks' : tab === 'products' ? 'Product Builder' : 'Coupons'}
                    </button>
                ))}
            </div>

            {activeTab === 'locks' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    <Card title="Content Access Control">
                        <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '0.9rem' }}>
                            Manage default access permissions. (Use Product Builder to create sellable bundles).
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {subjects.map(subject => (
                                <SubjectLockManager
                                    key={subject.id}
                                    subject={subject.id}
                                    locks={locks}
                                    toggleLock={toggleLock}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'products' && (
                <ProductManager />
            )}

            {activeTab === 'coupons' && (
                <Card title="Manage Coupons">
                    <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        <Input
                            placeholder="Code (e.g. SALE50)"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Value"
                            style={{ width: '80px' }}
                            value={newCoupon.discount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                            required
                        />
                        <select
                            value={newCoupon.type}
                            onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="percent">%</option>
                            <option value="flat">₹</option>
                        </select>
                        <Button type="submit" size="sm" leftIcon={<Plus size={16} />}>Add</Button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {coupons.map((coupon) => (
                            <div key={coupon.code} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Tag size={16} color="#DC2626" />
                                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{coupon.code}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                        {coupon.type === 'percent' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteCoupon(coupon.code)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <style jsx>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 20px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #cbd5e1;
                    transition: .4s;
                    border-radius: 20px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 2px;
                    bottom: 2px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #DC2626;
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
}
