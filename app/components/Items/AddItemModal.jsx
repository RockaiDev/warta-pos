import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CLOUDINARY_UPLOAD_PRESET = 'Warta_pos';
const CLOUDINARY_CLOUD_NAME = 'dxkau0eb3';

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
                setMode(MODES.VIEW);
                fetchItems();
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
                fetchItems();
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
            </div>
        </div>
    );

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">اسم الصنف بالعربي</label>
                <input 
                    name="titleAr" 
                    value={form.titleAr} 
                    onChange={handleChange} 
                    placeholder="اسم الصنف بالعربي" 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                    required 
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">اسم الصنف بالإنجليزي</label>
                <input 
                    name="titleEn" 
                    value={form.titleEn} 
                    onChange={handleChange} 
                    placeholder="اسم الصنف بالإنجليزي" 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                    required 
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">القسم</label>
                <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                    required
                >
                    <option value="">اختر القسم</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.title}>{cat.title}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">إظهار الإضافات؟</label>
                <select 
                    name="showExtras" 
                    value={form.showExtras} 
                    onChange={handleChange} 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
                >
                    <option value="">إظهار الإضافات؟</option>
                    <option value="نعم">نعم</option>
                    <option value="لا">لا</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">الحجم</label>
                <select 
                    name="size" 
                    value={form.size} 
                    onChange={handleChange} 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent"
                >
                    <option value="">الحجم</option>
                    <option value="كبير">كبير</option>
                    <option value="وسط">وسط</option>
                    <option value="صغير">صغير</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">السعر</label>
                <input 
                    name="price" 
                    value={form.price} 
                    onChange={handleChange} 
                    placeholder="السعر" 
                    type="number" 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                    required 
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-semibold text-mainColor text-lg">النقاط</label>
                <input 
                    name="points" 
                    value={form.points} 
                    onChange={handleChange} 
                    placeholder="النقاط" 
                    type="number" 
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-semibold text-mainColor text-lg">الوصف</label>
                <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="الوصف" 
                    rows="3"
                    className="border border-gray-300 p-3 rounded-lg text-lg focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                />
            </div>
            <div className="md:col-span-2 flex flex-col md:flex-row items-start gap-4">
                <div className="flex-1 w-full">
                    <label className="font-semibold text-mainColor text-lg">الصورة</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="border border-gray-300 p-3 rounded-lg text-lg w-full focus:ring-2 focus:ring-mainColor focus:border-transparent" 
                    />
                </div>
                <div className="flex justify-center items-center w-full md:w-auto">
                    {imageFile && (
                        <img 
                            src={URL.createObjectURL(imageFile)} 
                            alt="item-preview" 
                            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg shadow-lg border-2 border-mainColor" 
                        />
                    )}
                    {form.image && !imageFile && (
                        <img 
                            src={form.image} 
                            alt="item" 
                            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg shadow-lg border-2 border-mainColor" 
                        />
                    )}
                </div>
            </div>
            {error && <div className="text-red-500 text-sm md:col-span-2">{error}</div>}
            {success && <div className="text-green-600 text-sm md:col-span-2">{success}</div>}
            <div className="md:col-span-2 flex gap-4">
                <button 
                    type="submit" 
                    className="flex-1 bg-mainColor text-white py-4 rounded-lg text-xl font-bold shadow-lg hover:bg-opacity-90 transition-all duration-200" 
                    disabled={loading}
                >
                    {loading ? 'جاري الحفظ...' : mode === MODES.EDIT ? 'تعديل الصنف' : 'حفظ الصنف'}
                </button>
                <button 
                    type="button"
                    onClick={() => {
                        setMode(MODES.VIEW);
                        setSelectedId('');
                        setError('');
                        setSuccess('');
                    }}
                    className="px-8 py-4 bg-gray-500 text-white rounded-lg text-xl font-bold shadow-lg hover:bg-gray-600 transition-all duration-200"
                >
                    إلغاء
                </button>
            </div>
        </form>
    );

    return (
        <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-7xl min-h-[80vh] flex flex-col justify-start p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200">
                <div className="flex flex-col items-center mb-8">
                    <Image src="/wartalogo.png" alt="logo" width={100} height={100} className="mb-4" />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-mainColor mb-2 text-center">
                        إدارة منتجات الموقع
                    </h2>
                    <p className="text-gray-600 text-lg text-center">
                        إضافة، تعديل، وحذف منتجات الموقع
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                    <button 
                        onClick={() => { 
                            setMode(MODES.VIEW); 
                            setSelectedId(''); 
                            setSuccess(''); 
                            setError(''); 
                        }} 
                        className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 ${
                            mode === MODES.VIEW 
                                ? 'bg-mainColor text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        عرض الأصناف
                    </button>
                    <button 
                        onClick={() => { 
                            setMode(MODES.ADD); 
                            setSelectedId(''); 
                            setSuccess(''); 
                            setError(''); 
                        }} 
                        className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 ${
                            mode === MODES.ADD 
                                ? 'bg-mainColor text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        إضافة صنف جديد
                    </button>
                </div>

                {mode === MODES.VIEW ? renderTableView() : renderForm()}
            </div>
        </div>
    );
} 