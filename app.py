from flask import Flask, render_template, request, send_file, jsonify
import os
import tempfile
import subprocess
import shutil
import uuid
from datetime import datetime
import markdown
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Tạo thư mục uploads và downloads nếu chưa có
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

class DocumentConverter:
    @staticmethod
    def check_pandoc():
        """Kiểm tra xem pandoc có được cài đặt không"""
        try:
            result = subprocess.run(
                ["pandoc", "--version"],
                capture_output=True,
                text=True,
                check=True
            )
            version = result.stdout.split('\n')[0]
            return {"status": "success", "version": version}
        except:
            return {"status": "error", "message": "Pandoc chưa được cài đặt"}
    
    @staticmethod
    def convert_markdown_to_docx(markdown_text):
        """Chuyển đổi markdown sang docx"""
        try:
            # Tạo thư mục tạm thời
            temp_dir = tempfile.mkdtemp()
            
            # Đường dẫn files
            md_file = os.path.join(temp_dir, "input.md")
            docx_file = os.path.join(temp_dir, "output.docx")
            
            # Lưu markdown vào file
            with open(md_file, "w", encoding="utf-8") as f:
                f.write(markdown_text)
            
            # Chạy pandoc để chuyển đổi
            pandoc_command = [
                "pandoc",
                md_file,
                "-o", docx_file,
                "--from", "markdown",
                "--to", "docx",
                "--standalone"
            ]
            
            result = subprocess.run(
                pandoc_command,
                check=True,
                capture_output=True,
                text=True
            )
            
            # Đọc file Word đã tạo
            with open(docx_file, "rb") as f:
                docx_data = f.read()
            
            # Lưu file vào thư mục downloads
            filename = f"converted_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
            output_path = os.path.join(DOWNLOAD_FOLDER, filename)
            
            with open(output_path, "wb") as f:
                f.write(docx_data)
            
            # Dọn dẹp thư mục tạm
            shutil.rmtree(temp_dir)
            
            return {
                "success": True,
                "filename": filename,
                "message": "Chuyển đổi thành công!"
            }
            
        except subprocess.CalledProcessError as e:
            return {
                "success": False,
                "error": f"Lỗi pandoc: {e.stderr}",
                "message": "Chuyển đổi thất bại!"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Có lỗi xảy ra!"
            }
    
    @staticmethod
    def get_text_statistics(text):
        """Tính toán thống kê văn bản"""
        if not text.strip():
            return {"words": 0, "characters": 0, "lines": 0}
        
        words = len(text.split())
        characters = len(text)
        lines = len(text.split('\n'))
        
        return {
            "words": words,
            "characters": characters,
            "lines": lines
        }

@app.route('/')
def index():
    """Trang chủ"""
    pandoc_status = DocumentConverter.check_pandoc()
    return render_template('index.html', pandoc_status=pandoc_status)

@app.route('/api/convert', methods=['POST'])
def convert_markdown():
    """API để chuyển đổi markdown sang docx"""
    try:
        data = request.get_json()
        markdown_text = data.get('markdown', '')
        
        if not markdown_text.strip():
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập nội dung Markdown!"
            }), 400
        
        result = DocumentConverter.convert_markdown_to_docx(markdown_text)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Có lỗi xảy ra!",
            "error": str(e)
        }), 500

@app.route('/api/preview', methods=['POST'])
def preview_markdown():
    """API để xem trước markdown"""
    try:
        data = request.get_json()
        markdown_text = data.get('markdown', '')
        
        if not markdown_text.strip():
            return jsonify({"html": "", "stats": {"words": 0, "characters": 0, "lines": 0}})
        
        # Chuyển đổi markdown thành HTML
        html = markdown.markdown(markdown_text, extensions=[
            'markdown.extensions.tables',
            'markdown.extensions.fenced_code',
            'markdown.extensions.codehilite'
        ])
        
        # Tính toán thống kê
        stats = DocumentConverter.get_text_statistics(markdown_text)
        
        return jsonify({
            "html": html,
            "stats": stats
        })
        
    except Exception as e:
        return jsonify({
            "html": "",
            "stats": {"words": 0, "characters": 0, "lines": 0},
            "error": str(e)
        })

@app.route('/api/pandoc-status')
def pandoc_status():
    """API để kiểm tra trạng thái pandoc"""
    return jsonify(DocumentConverter.check_pandoc())

@app.route('/download/<filename>')
def download_file(filename):
    """Tải file đã chuyển đổi"""
    try:
        file_path = os.path.join(DOWNLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True, download_name=filename)
        else:
            return jsonify({"error": "File không tồn tại"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)