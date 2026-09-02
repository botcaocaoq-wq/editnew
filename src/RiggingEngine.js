// =========================================================================
// SCRIPT: RiggingEngine.js
// CHỨC NĂNG: Quản lý nạp hình ảnh nền, tạo khớp xương và vẽ lên Canvas
// =========================================================================

class RiggingEngine {
    constructor() {
        this.canvas = document.getElementById('videoCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.bones = [];        // Danh sách lưu trữ toàn bộ các cục xương được tạo ra
        this.bgImage = null;    // Lưu trữ đối tượng hình ảnh nền sau khi người dùng upload
        
        this.initUploadEvent(); // Kích hoạt tính năng nạp ảnh từ máy tính
        this.initCanvasEvents(); // Kích hoạt tính năng click chuột tạo xương
        this.drawAll();         // Vẽ màn hình trống ban đầu
    }

    /**
     * KHU VỰC 1: XỬ LÝ TẢI ẢNH LÊN (UPLOAD IMAGE)
     */
    initUploadEvent() {
        const btnUpload = document.getElementById('btn-upload');
        const fileInput = document.getElementById('image-upload');

        // Khi bấm nút "Tải ảnh lên" giả -> Kích hoạt lệnh bấm vào nút chọn file ẩn
        btnUpload?.addEventListener('click', () => fileInput.click());

        // Lắng nghe khi người dùng chọn xong file từ máy tính
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.bgImage = img; // Lưu bức ảnh vào hệ thống để làm hình nền
                    console.log("[Rigging] Đã nạp thành công ảnh nền mới:", img.width, "x", img.height);
                    this.drawAll();     // Vẽ lại màn hình để hiển thị ảnh lên ngay lập tức
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * KHU VỰC 2: XỬ LÝ CHUỘT TRÊN CANVAS (TẠO XƯƠNG & CHỌN XƯƠNG)
     */
    initCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            // Tính toán vị trí chuột chính xác so với lề của khung Canvas
            const mousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // Bước 1: Kiểm tra xem người dùng có bấm trúng một cục xương cũ nào không
            let clickedBone = this.checkClickBone(mousePos);

            if (clickedBone) {
                // Nếu trúng xương -> Báo cho bộ TransformGizmo biết để chuẩn bị kéo thả biến đổi
                if (window.appEngine && window.appEngine.gizmo) {
                    window.appEngine.gizmo.handleMouseDown(mousePos, clickedBone);
                }
            } else {
                // Bước 2: Nếu click ra ngoài nền trống -> Tự động sinh ra 1 khớp xương mới tại đó
                const newBone = {
                    id: Date.now(), // Dùng thời gian mili-giây làm ID định danh duy nhất
                    name: `Xương_${this.bones.length + 1}`,
                    position: { x: mousePos.x, y: mousePos.y },
                    rotation: 0, // Góc xoay mặc định (Radian)
                    scale: { x: 1, y: 1 } // Tỷ lệ thu phóng mặc định
                };
                
                this.bones.push(newBone);
                
                // Tự động chọn luôn cục xương vừa tạo
                if (window.appEngine && window.appEngine.gizmo) {
                    window.appEngine.gizmo.selectedBone = newBone;
                }
                console.log("[Rigging] Đã tạo một khớp xương mới!", newBone);
            }
            this.drawAll();
        });

        // Lắng nghe khi người dùng kéo chuột di chuyển trên Canvas
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            // Chuyển tiếp tọa độ chuột liên tục cho bộ Gizmo tính toán ma trận di chuyển/xoay/scale
            if (window.appEngine && window.appEngine.gizmo && window.appEngine.gizmo.isDragging) {
                window.appEngine.gizmo.handleMouseMove(mousePos);
                this.drawAll(); // Vẽ lại liên tục khi đang kéo để thấy xương chuyển động mượt mà
            }
        });

        // Lắng nghe khi người dùng nhả chuột ra ngoài
        window.addEventListener('mouseup', () => {
            if (window.appEngine && window.appEngine.gizmo) {
                window.appEngine.gizmo.handleMouseUp();
            }
        });
    }

    /**
     * Thuật toán kiểm tra va chạm hình tròn để xem chuột có bấm trúng tâm xương không
     */
    checkClickBone(mousePos) {
        for (let bone of this.bones) {
            // Tính khoảng cách toán học Pitago giữa chuột và tâm xương
            const distance = Math.hypot(mousePos.x - bone.position.x, mousePos.y - bone.position.y);
            if (distance < 15) return bone; // Nếu khoảng cách nhỏ hơn 15 pixel thì coi như bấm trúng
        }
        return null;
    }

    /**
     * KHU VỰC 3: DỰNG HÌNH ĐỒ HỌA (RENDER GRAPHICS)
     */
    drawAll() {
        // 1. Xóa sạch dữ liệu khung hình cũ trước khi vẽ khung hình mới
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Vẽ hình ảnh nền (Nếu người dùng đã upload ảnh lên)
        if (this.bgImage) {
            // Vẽ ảnh co giãn khít với toàn bộ khung Canvas
            this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Nếu chưa có ảnh -> Tô nền màu xám tối làm hình nền mặc định
            this.ctx.fillStyle = '#18181b';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 3. Tiến hành vẽ từng cục xương lên trên bề mặt ảnh nền
        this.bones.forEach(bone => {
            this.ctx.save(); // Lưu lại trạng thái ma trận gốc
            
            // Dịch chuyển hệ tọa độ Canvas theo thông số của cục xương hiện tại
            this.ctx.translate(bone.position.x, bone.position.y);
            this.ctx.rotate(bone.rotation);
            this.ctx.scale(bone.scale.x, bone.scale.y);

            // Kiểm tra xem xương này có đang được người dùng bấm chọn chỉnh sửa hay không
            const isSelected = (window.appEngine && window.appEngine.gizmo.selectedBone?.id === bone.id);

            // A. Vẽ thân xương (Bone Body) hình thoi dài hướng về phía trước
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(12, -5);
            this.ctx.lineTo(45, 0);
            this.ctx.lineTo(12, 5);
            this.ctx.closePath();
            this.ctx.fillStyle = isSelected ? 'rgba(0, 122, 204, 0.4)' : 'rgba(239, 68, 68, 0.3)';
            this.ctx.fill();
            this.ctx.strokeStyle = isSelected ? '#007acc' : '#ef4444';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // B. Vẽ khớp tròn (Joint Pivot) tại gốc tọa độ để làm tâm xoay
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 7, 0, Math.PI * 2);
            this.ctx.fillStyle = isSelected ? '#00ebff' : '#fbbf24';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // C. Viết chữ hiển thị tên của khớp xương
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '11px sans-serif';
            this.ctx.fillText(bone.name, 12, -8);

            this.ctx.restore(); // Khôi phục lại trạng thái ma trận cũ để vẽ cục xương tiếp theo
        });
    }
}
