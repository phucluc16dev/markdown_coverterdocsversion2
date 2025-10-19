# WordExtra - Markdown to Word Converter

WordExtra là một ứng dụng web hiện đại cho phép chuyển đổi nội dung Markdown thành file Word (.docx) một cách dễ dàng và nhanh chóng.

## ✨ Tính năng

- **🔄 Chuyển đổi Markdown sang Word**: Hỗ trợ đầy đủ cú pháp Markdown
- **👁️ Xem trước thời gian thực**: Hiển thị kết quả ngay khi bạn nhập
- **📊 Thống kê văn bản**: Đếm từ, ký tự và dòng tự động
- **📁 Tải file lên**: Hỗ trợ kéo thả và chọn file .md
- **📱 Giao diện responsive**: Hoạt động tốt trên mọi thiết bị
- **⚡ Xử lý nhanh chóng**: Sử dụng Pandoc để chuyển đổi chính xác

## 🛠️ Cài đặt

### Yêu cầu hệ thống

- Python 3.8 hoặc cao hơn
- Pandoc (bắt buộc để chuyển đổi)

### Cài đặt Pandoc

1. **Windows**: Tải từ [pandoc.org](https://pandoc.org/installing.html)
2. **macOS**: `brew install pandoc`
3. **Ubuntu/Debian**: `sudo apt install pandoc`

### Cài đặt ứng dụng

1. **Tải mã nguồn** hoặc clone repository
2. **Chạy file `run.bat`** (Windows) hoặc làm theo hướng dẫn thủ công bên dưới

### Cài đặt thủ công

```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy ứng dụng
python app.py
```

## 🚀 Sử dụng

1. **Khởi động ứng dụng**: Chạy `run.bat` hoặc `python app.py`
2. **Truy cập web**: Mở trình duyệt và vào `http://localhost:5000`
3. **Nhập Markdown**: Gõ hoặc dán nội dung vào khung soạn thảo
4. **Xem trước**: Kết quả sẽ hiển thị ngay bên cạnh
5. **Chuyển đổi**: Click nút "Chuyển đổi sang Word"
6. **Tải xuống**: File .docx sẽ được tạo và có thể tải về

## 📁 Cấu trúc project

```
web_converter/
├── app.py                  # Ứng dụng Flask chính
├── requirements.txt        # Dependencies Python
├── run.bat                # Script khởi động (Windows)
├── README.md              # File hướng dẫn này
├── templates/             # Templates HTML
│   ├── base.html         # Template gốc
│   └── index.html        # Trang chính
├── static/               # Assets tĩnh
│   ├── css/
│   │   └── style.css     # CSS tùy chỉnh
│   └── js/
│       └── app.js        # JavaScript chính
├── uploads/              # Thư mục file tải lên
└── downloads/            # Thư mục file đã chuyển đổi
```

## 🎨 Giao diện

Giao diện được thiết kế hiện đại với:

- **Theme teal/xanh ngọc bích** tương tự ứng dụng desktop gốc
- **Layout responsive** hoạt động trên mobile và desktop
- **Animations mượt mà** với CSS transitions
- **Icons Font Awesome** cho trải nghiệm trực quan
- **Bootstrap 5** cho component UI nhất quán

## 🔧 API Endpoints

- `GET /` - Trang chủ
- `POST /api/convert` - Chuyển đổi Markdown sang Word
- `POST /api/preview` - Xem trước Markdown
- `GET /api/pandoc-status` - Kiểm tra trạng thái Pandoc
- `GET /download/<filename>` - Tải file đã chuyển đổi

## 🛡️ Bảo mật

- Giới hạn kích thước file tải lên (10MB)
- Validation input và file type
- Temporary file cleanup tự động
- Error handling toàn diện

## 🔍 Troubleshooting

### Lỗi "Pandoc chưa được cài đặt"
- Cài đặt Pandoc từ trang chủ
- Thêm Pandoc vào PATH môi trường

### Lỗi "Permission denied"
- Chạy với quyền administrator
- Kiểm tra quyền ghi trong thư mục

### Port 5000 đã được sử dụng
- Thay đổi port trong `app.py`: `app.run(port=8000)`
- Hoặc dừng service khác đang dùng port 5000

## 👨‍💻 Phát triển

Được phát triển bởi **Trần Phúc Lực**

- 📱 Zalo: 0985.692.879
- 📘 Facebook: nhphuclk  
- 🌐 Website: aiomtpremium.com
- 📺 YouTube: @aiomtpremium

## 📄 License

Dự án này được phát triển cho mục đích giáo dục và sử dụng cá nhân.

## 🙏 Acknowledgments

- [Pandoc](https://pandoc.org/) - Universal document converter
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting