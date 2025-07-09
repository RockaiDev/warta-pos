import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CLOUDINARY_UPLOAD_PRESET = 'Warta_pos'; // ضع هنا upload_preset الخاص بك
const CLOUDINARY_CLOUD_NAME = 'dxkau0eb3'; // ضع هنا cloud name الخاص بك

const MODES = {
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
    VIEW: 'view',
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
    const [mode, setMode] = useState(MODES.VIEW);
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState('');

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.categories || []));
    }, []);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/addwebItem');
            const data = await res.json();
            setItems(data.items || []);
        } catch (error) {
            setError('فشل في تحميل البيانات');
        }
    };

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
        if (mode === MODES.ADD || mode === MODES.DELETE) {
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

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [success]);

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
        // أزل الكود الذي كان يمسح الصورة تلقائياً عند التعديل
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
            let imageUrl = form.image;
            // إذا كان هناك صورة جديدة تم اختيارها، ارفعها أولاً
            if (imageFile) {
                const compressed = await compressImage(imageFile);
                const formData = new FormData();
                formData.append('file', compressed);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const dataCloud = await resCloud.json();
                if (dataCloud.secure_url) {
                    imageUrl = dataCloud.secure_url;
                } else {
                    setError('فشل رفع الصورة');
                    setLoading(false);
                    return;
                }
            }
            const payload = {
                ...form,
                price: form.price === '' ? undefined : Number(form.price),
                points: form.points === '' ? undefined : Number(form.points),
                titleEn: String(form.titleEn),
                titleAr: String(form.titleAr),
                category: String(form.category),
                showExtras: String(form.showExtras),
                image: String(imageUrl),
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

    const handleDelete = async (id) => {
        if (!id) return;
        if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
        
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`/api/addwebItem/${id}`, {
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

    const handleEdit = (id) => {
        setSelectedId(id);
        setMode(MODES.EDIT);
        setError('');
        setSuccess('');
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.titleEn?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const renderTableView = () => (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="البحث في الأصناف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
                    />
                </div>
                <div className="flex-1">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
                    >
                        <option value="">جميع الأقسام</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.title}>{cat.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-mainColor text-white">
                            <tr>
                                <th className="px-4 py-3 text-right">الصورة</th>
                                <th className="px-4 py-3 text-right">الاسم العربي</th>
                                <th className="px-4 py-3 text-right">الاسم الإنجليزي</th>
                                <th className="px-4 py-3 text-right">القسم</th>
                                <th className="px-4 py-3 text-right">السعر</th>
                                <th className="px-4 py-3 text-right">الحجم</th>
                                <th className="px-4 py-3 text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, index) => (
                                <tr key={item._id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                                    <td className="px-4 py-3">
                                        <img 
                                            src={item.image || '/placeholder-image.png'} 
                                            alt={item.titleAr}
                                            className="w-12 h-12 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.png';
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">{item.titleAr}</td>
                                    <td className="px-4 py-3 text-right">{item.titleEn}</td>
                                    <td className="px-4 py-3 text-right">{item.category}</td>
                                    <td className="px-4 py-3 text-right">{item.price} ج.م</td>
                                    <td className="px-4 py-3 text-right">{item.size}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item._id)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        لا توجد أصناف متاحة
                    </div>
                )}
                {mode !== MODES.DELETE && (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full mx-auto mb-16">
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
                        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-center gap-4 mt-2">
                            <div className="flex-1 w-full">
                                <label className="font-semibold text-mainColor">الصورة</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="border p-3 rounded text-lg w-full" />
                            </div>
                            <div className="flex justify-center items-center w-full md:w-auto">
                                {imageFile && (
                                    <img src={URL.createObjectURL(imageFile)} alt="item-preview" className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl shadow-lg border border-mainColor" />
                                )}
                                {form.image && !imageFile && (
                                    <img src={form.image} alt="item" className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl shadow-lg border border-mainColor" />
                                )}
                            </div>
                        </div>
                        {error && <div className="text-red-500 text-sm md:col-span-2 col-span-1">{error}</div>}
                        {success && <div className="text-green-600 text-sm md:col-span-2 col-span-1">{success}</div>}
                        <button type="submit" className="bg-mainColor text-bgColor py-4 rounded-full mt-4 text-xl font-bold md:col-span-2 col-span-1 shadow-md hover:bg-opacity-90 transition-all duration-200 w-full" disabled={loading}>{loading ? 'جاري الحفظ...' : mode === MODES.EDIT ? 'تعديل' : 'حفظ'}</button>
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