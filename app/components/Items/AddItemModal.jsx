import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CLOUDINARY_UPLOAD_PRESET = 'Warta_pos'; // ضع هنا upload_preset الخاص بك
const CLOUDINARY_CLOUD_NAME = 'dxkau0eb3'; // ضع هنا cloud name الخاص بك

const MODES = {
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
};

export default function AddItemModal({ onClose, isPage }) {
    const [form, setForm] = useState({
        titleEn: '',
        titleAr: '',
        category: '',
        showExtras: '',
        image: '',
        price: '',
        description: '',
        points: '',
        size: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);
    const [mode, setMode] = useState(MODES.ADD);
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState('');

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.categories || []));
    }, []);

    useEffect(() => {
        if (mode !== MODES.ADD) {
            fetch('/api/addwebItem')
                .then(res => res.json())
                .then(data => setItems(data.items || []));
        }
    }, [mode]);

    useEffect(() => {
        if (mode === MODES.EDIT && selectedId) {
            const item = items.find(i => i._id === selectedId);
            if (item) {
                setForm({
                    titleEn: item.titleEn || '',
                    titleAr: item.titleAr || '',
                    category: item.category || '',
                    showExtras: item.showExtras || '',
                    image: item.image || '',
                    price: item.price || '',
                    description: item.description || '',
                    points: item.points || '',
                    size: item.size || '',
                });
                setImageFile(null);
            }
        }
        if (mode === MODES.DELETE) {
            setForm({
                titleEn: '',
                titleAr: '',
                category: '',
                showExtras: '',
                image: '',
                price: '',
                description: '',
                points: '',
                size: '',
            });
            setImageFile(null);
        }
    }, [selectedId, mode, items]);

    function compressImage(file, quality = 0.4) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function uploadToCloudinary(file) {
        setLoading(true);
        setError('');
        try {
            const compressed = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressed);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setForm((prev) => ({ ...prev, image: data.secure_url }));
            } else {
                setError('فشل رفع الصورة');
            }
        } catch (e) {
            setError('حدث خطأ أثناء رفع الصورة');
        }
        setLoading(false);
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            uploadToCloudinary(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                ...form,
                price: form.price === '' ? undefined : Number(form.price),
                points: form.points === '' ? undefined : Number(form.points),
                titleEn: String(form.titleEn),
                titleAr: String(form.titleAr),
                category: String(form.category),
                showExtras: String(form.showExtras),
                image: String(form.image),
                description: String(form.description),
                size: String(form.size),
            };
            let res;
            if (mode === MODES.ADD) {
                res = await fetch('/api/addwebItem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else if (mode === MODES.EDIT && selectedId) {
                res = await fetch(`/api/addwebItem/${selectedId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }
            if (res && res.ok) {
                setSuccess(mode === MODES.ADD ? 'تمت إضافة الصنف بنجاح' : 'تم تعديل الصنف بنجاح');
                setForm({
                    titleEn: '',
                    titleAr: '',
                    category: '',
                    showExtras: '',
                    image: '',
                    price: '',
                    description: '',
                    points: '',
                    size: '',
                });
                setImageFile(null);
                setSelectedId('');
            } else if (res) {
                setError('فشل في العملية');
            }
        } catch (e) {
            setError('حدث خطأ أثناء العملية');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`/api/addwebItem/${selectedId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setSuccess('تم حذف الصنف بنجاح');
                setSelectedId('');
            } else {
                setError('فشل في حذف الصنف');
            }
        } catch (e) {
            setError('حدث خطأ أثناء الحذف');
        }
        setLoading(false);
    };

    return (
        <div className={isPage ? "w-full flex items-center justify-center bg-bgColor min-h-screen" : "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"}>
            <div className={isPage ? "bg-white rounded-3xl p-12 w-full min-h-[70vh] max-w-7xl my-10 relative border border-mainColor flex flex-col justify-start" : "bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"}>
                <div className="flex flex-col items-center mb-6">
                    <Image src="/wartalogo.png" alt="logo" width={120} height={120} className="mb-2" />
                    <h2 className="text-3xl font-extrabold text-mainColor mb-4">
                        {mode === MODES.ADD && 'إضافة منتج موقع'}
                        {mode === MODES.EDIT && 'تعديل منتج موقع'}
                        {mode === MODES.DELETE && 'حذف منتج موقع'}
                    </h2>
                </div>
                <div className="flex gap-4 mb-8">
                    <button onClick={() => { setMode(MODES.ADD); setSelectedId(''); setSuccess(''); setError(''); }} className={`px-8 py-3 rounded-full font-bold text-lg shadow-sm transition-all duration-200 ${mode === MODES.ADD ? 'bg-mainColor text-bgColor' : 'bg-bgColor text-mainColor border border-mainColor'}`}>إضافة</button>
                    <button onClick={() => { setMode(MODES.EDIT); setSuccess(''); setError(''); }} className={`px-8 py-3 rounded-full font-bold text-lg shadow-sm transition-all duration-200 ${mode === MODES.EDIT ? 'bg-mainColor text-bgColor' : 'bg-bgColor text-mainColor border border-mainColor'}`}>تعديل</button>
                    <button onClick={() => { setMode(MODES.DELETE); setSuccess(''); setError(''); }} className={`px-8 py-3 rounded-full font-bold text-lg shadow-sm transition-all duration-200 ${mode === MODES.DELETE ? 'bg-mainColor text-bgColor' : 'bg-bgColor text-mainColor border border-mainColor'}`}>حذف</button>
                </div>
                {mode !== MODES.ADD && (
                    <div className="mb-6">
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="border p-3 rounded text-lg w-full">
                            <option value="">اختر الصنف</option>
                            {items.map(item => (
                                <option key={item._id} value={item._id}>{item.titleAr} - {item.titleEn}</option>
                            ))}
                        </select>
                    </div>
                )}
                {mode !== MODES.DELETE && (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">اسم الصنف بالعربي</label>
                            <input name="titleAr" value={form.titleAr} onChange={handleChange} placeholder="اسم الصنف بالعربي" className="border p-3 rounded text-lg" required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">اسم الصنف بالإنجليزي</label>
                            <input name="titleEn" value={form.titleEn} onChange={handleChange} placeholder="اسم الصنف بالإنجليزي" className="border p-3 rounded text-lg" required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">القسم</label>
                            <select name="category" value={form.category} onChange={handleChange} className="border p-3 rounded text-lg" required>
                                <option value="">اختر القسم</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.title}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">إظهار الإضافات؟</label>
                            <select name="showExtras" value={form.showExtras} onChange={handleChange} className="border p-3 rounded text-lg">
                                <option value="">إظهار الإضافات؟</option>
                                <option value="نعم">نعم</option>
                                <option value="لا">لا</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">الحجم</label>
                            <select name="size" value={form.size} onChange={handleChange} className="border p-3 rounded text-lg">
                                <option value="">الحجم</option>
                                <option value="كبير">كبير</option>
                                <option value="وسط">وسط</option>
                                <option value="صغير">صغير</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">السعر</label>
                            <input name="price" value={form.price} onChange={handleChange} placeholder="السعر" type="number" className="border p-3 rounded text-lg" required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-mainColor">النقاط</label>
                            <input name="points" value={form.points} onChange={handleChange} placeholder="النقاط" type="number" className="border p-3 rounded text-lg" />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="font-semibold text-mainColor">الوصف</label>
                            <input name="description" value={form.description} onChange={handleChange} placeholder="الوصف" className="border p-3 rounded text-lg" />
                        </div>
                        <div className="col-span-2 flex flex-col items-center gap-4 mt-2">
                            <label className="font-semibold text-mainColor">الصورة</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="border p-3 rounded text-lg w-full" />
                            {imageFile && (
                                <img src={URL.createObjectURL(imageFile)} alt="item-preview" className="w-48 h-48 object-cover rounded-2xl shadow-lg border border-mainColor" />
                            )}
                            {form.image && !imageFile && (
                                <img src={form.image} alt="item" className="w-48 h-48 object-cover rounded-2xl shadow-lg border border-mainColor" />
                            )}
                        </div>
                        {error && <div className="text-red-500 text-sm col-span-2">{error}</div>}
                        {success && <div className="text-green-600 text-sm col-span-2">{success}</div>}
                        <button type="submit" className="bg-mainColor text-bgColor py-4 rounded-full mt-4 text-xl font-bold col-span-2 shadow-md hover:bg-opacity-90 transition-all duration-200" disabled={loading}>{loading ? 'جاري الحفظ...' : mode === MODES.EDIT ? 'تعديل' : 'حفظ'}</button>
                    </form>
                )}
                {mode === MODES.DELETE && (
                    <div className="flex flex-col items-center gap-4 mt-8">
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        {success && <div className="text-green-600 text-sm">{success}</div>}
                        <button onClick={handleDelete} className="bg-red-600 text-white py-3 px-8 rounded text-lg" disabled={loading || !selectedId}>{loading ? 'جاري الحذف...' : 'حذف الصنف'}</button>
                    </div>
                )}
            </div>
        </div>
    );
} 