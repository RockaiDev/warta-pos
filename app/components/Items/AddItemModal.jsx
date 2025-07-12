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
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

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
        const matchesSearch = !searchTerm || 
            item.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.titleEn?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full">
            {/* Header with Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h2 className="text-2xl font-bold text-mainColor">إدارة الأصناف</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-mainColor text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2"
                        >
                            {showForm ? 'إخفاء النموذج' : 'إضافة صنف جديد'}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 flex items-center gap-2"
                        >
                            {showFilters ? 'إخفاء الفلاتر' : 'فلاتر البحث'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">البحث في الأصناف</label>
                            <input
                                type="text"
                                placeholder="ابحث بالاسم العربي أو الإنجليزي..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">فلتر حسب القسم</label>
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
                </div>
            )}

            {/* Add/Edit Form - Fixed Overlay */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-mainColor to-blue-600 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">
                                    {mode === MODES.EDIT ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                                </h3>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* First Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">اسم الصنف بالعربي</label>
                                        <input 
                                            name="titleAr" 
                                            value={form.titleAr} 
                                            onChange={handleChange} 
                                            placeholder="اسم الصنف بالعربي" 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">اسم الصنف بالإنجليزي</label>
                                        <input 
                                            name="titleEn" 
                                            value={form.titleEn} 
                                            onChange={handleChange} 
                                            placeholder="اسم الصنف بالإنجليزي" 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200" 
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* Second Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">القسم</label>
                                        <select 
                                            name="category" 
                                            value={form.category} 
                                            onChange={handleChange} 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200" 
                                            required
                                        >
                                            <option value="">اختر القسم</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat.title}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">الحجم</label>
                                        <select 
                                            name="size" 
                                            value={form.size} 
                                            onChange={handleChange} 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="">الحجم</option>
                                            <option value="كبير">كبير</option>
                                            <option value="وسط">وسط</option>
                                            <option value="صغير">صغير</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">إظهار الإضافات؟</label>
                                        <select 
                                            name="showExtras" 
                                            value={form.showExtras} 
                                            onChange={handleChange} 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="">إظهار الإضافات؟</option>
                                            <option value="نعم">نعم</option>
                                            <option value="لا">لا</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Third Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">السعر</label>
                                        <input 
                                            name="price" 
                                            value={form.price} 
                                            onChange={handleChange} 
                                            placeholder="السعر" 
                                            type="number" 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">النقاط</label>
                                        <input 
                                            name="points" 
                                            value={form.points} 
                                            onChange={handleChange} 
                                            placeholder="النقاط" 
                                            type="number" 
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200" 
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">الوصف</label>
                                    <input 
                                        name="description" 
                                        value={form.description} 
                                        onChange={handleChange} 
                                        placeholder="الوصف" 
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent transition-all duration-200" 
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">الصورة</label>
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageChange} 
                                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-mainColor transition-all duration-200 cursor-pointer" 
                                            />
                                        </div>
                                        <div className="flex justify-center items-center">
                                            {imageFile && (
                                                <img 
                                                    src={URL.createObjectURL(imageFile)} 
                                                    alt="item-preview" 
                                                    className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-mainColor" 
                                                />
                                            )}
                                            {form.image && !imageFile && (
                                                <img 
                                                    src={form.image} 
                                                    alt="item" 
                                                    className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-mainColor" 
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Error and Success Messages */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-red-600 text-sm">{error}</span>
                                        </div>
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-600 text-sm">{success}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-gradient-to-r from-mainColor to-blue-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                جاري الحفظ...
                                            </div>
                                        ) : (
                                            mode === MODES.EDIT ? 'تعديل الصنف' : 'حفظ الصنف'
                                        )}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Items Table */}
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
            </div>
        </div>
    );
} 