import React, { useState, useEffect } from 'react';

const CLOUDINARY_UPLOAD_PRESET = 'Warta_pos'; // ضع هنا upload_preset الخاص بك
const CLOUDINARY_CLOUD_NAME = 'dxkau0eb3'; // ضع هنا cloud name الخاص بك

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

    useEffect(() => {
        // جلب الأقسام من API
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.categories || []));
    }, []);

    // ضغط الصورة وجودة أقل
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

    // رفع الصورة إلى Cloudinary
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
            const res = await fetch('/api/addwebItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setSuccess('تمت إضافة الصنف بنجاح');
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
            } else {
                setError('فشل في إضافة الصنف');
            }
        } catch (e) {
            setError('حدث خطأ أثناء الإضافة');
        }
        setLoading(false);
    };

    return (
        <div className={isPage ? "w-full flex items-center justify-center" : "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"}>
            <div className={isPage ? "bg-white rounded-xl p-12 w-11/12 max-w-5xl my-10 relative" : "bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"}>
                <button onClick={onClose} className="absolute left-4 top-4 text-red-500 text-xl">×</button>
                <h2 className="text-2xl font-bold mb-6 text-mainColor">إضافة صنف جديد</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="titleAr" value={form.titleAr} onChange={handleChange} placeholder="اسم الصنف بالعربي" className="border p-3 rounded text-lg" required />
                    <input name="titleEn" value={form.titleEn} onChange={handleChange} placeholder="اسم الصنف بالإنجليزي" className="border p-3 rounded text-lg" required />
                    <select name="category" value={form.category} onChange={handleChange} className="border p-3 rounded text-lg" required>
                        <option value="">اختر القسم</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.title}>{cat.title}</option>
                        ))}
                    </select>
                    <select name="showExtras" value={form.showExtras} onChange={handleChange} className="border p-3 rounded text-lg">
                        <option value="">إظهار الإضافات؟</option>
                        <option value="نعم">نعم</option>
                        <option value="لا">لا</option>
                    </select>
                    <select name="size" value={form.size} onChange={handleChange} className="border p-3 rounded text-lg">
                        <option value="">الحجم</option>
                        <option value="كبير">كبير</option>
                        <option value="وسط">وسط</option>
                        <option value="صغير">صغير</option>
                    </select>
                    <input name="price" value={form.price} onChange={handleChange} placeholder="السعر" type="number" className="border p-3 rounded text-lg" required />
                    <input name="points" value={form.points} onChange={handleChange} placeholder="النقاط" type="number" className="border p-3 rounded text-lg" />
                    <input name="description" value={form.description} onChange={handleChange} placeholder="الوصف" className="border p-3 rounded text-lg col-span-2" />
                    <div className="col-span-2 flex flex-col items-center gap-2">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="border p-3 rounded text-lg w-full" />
                        {/* عرض الصورة المختارة بحجم أكبر */}
                        {imageFile && (
                            <img src={URL.createObjectURL(imageFile)} alt="item-preview" className="w-40 h-40 object-cover rounded shadow" />
                        )}
                        {/* بعد الرفع */}
                        {form.image && !imageFile && (
                            <img src={form.image} alt="item" className="w-40 h-40 object-cover rounded shadow" />
                        )}
                    </div>
                    {error && <div className="text-red-500 text-sm col-span-2">{error}</div>}
                    {success && <div className="text-green-600 text-sm col-span-2">{success}</div>}
                    <button type="submit" className="bg-mainColor text-bgColor py-3 rounded mt-2 text-lg col-span-2" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ'}</button>
                </form>
            </div>
        </div>
    );
} 