// =========================================================================
// SCRIPT: TransformGizmo.js
// CHỨC NĂNG: Quản lý 3 công cụ tương tác chuột (Translate, Rotate, Scale)
// =========================================================================

class TransformGizmo {
    constructor() {
        this.currentMode = 'translate'; // Chế độ mặc định ban đầu: Di chuyển
        this.selectedBone = null;       // Khớp xương đang được chọn để biến đổi
        this.isDragging = false;         // Trạng thái người dùng có đang giữ và kéo chuột không
        this.startMousePos = { x: 0, y: 0 }; // Lưu vị trí chuột tại thời điểm bắt đầu nhấn giữ
        
        this.initButtonEvents();        // Khởi động trình lắng nghe các nút công cụ
    }

    /**
     * Lắng nghe sự kiện click chuột vào các nút trên giao diện HTML
     */
    initButtonEvents() {
        const modes = ['translate', 'rotate', 'scale'];
        
        modes.forEach(mode => {
            const btn = document.getElementById(`btn-${mode}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    // Xóa class 'active' ở tất cả các nút công cụ khác
                    modes.forEach(m => document.getElementById(`btn-${m}`)?.classList.remove('active'));
                    
                    // Thêm class 'active' cho nút vừa được bấm để đổi màu xanh
                    btn.classList.add('active');
                    this.currentMode = mode;
                    
                    console.log(`[Gizmo] Đã chuyển sang chế độ: ${mode.toUpperCase()}`);
                });
            }
        });
    }

    /**
     * Gọi hàm này KHI NGƯỜI DÙNG NHẤN CHUỘT XUỐNG (MouseDown) vào một khớp xương
     * @param {Object} mousePos - Tọa độ {x, y} của chuột trên Canvas
     * @param {Object} bone - Khớp xương được click trúng
     */
    handleMouseDown(mousePos, bone) {
        if (!bone) return;
        
        this.selectedBone = bone;
        this.isDragging = true;
        this.startMousePos = { ...mousePos }; // Ghi nhớ tọa độ gốc lúc bắt đầu kéo
    }

    /**
     * Gọi hàm này KHI NGƯỜI DÙNG ĐANG DI CHUỘT (MouseMove) để kéo thả
     * @param {Object} currentMousePos - Tọa độ {x, y} hiện tại của chuột trên Canvas
     */
    handleMouseMove(currentMousePos) {
        // Nếu không nhấn giữ chuột hoặc chưa chọn khớp xương nào thì bỏ qua không xử lý
        if (!this.isDragging || !this.selectedBone) return;

        // 1. Tính toán độ lệch khoảng cách di chuyển của chuột so với khung hình trước
        const deltaX = currentMousePos.x - this.startMousePos.x;
        const deltaY = currentMousePos.y - this.startMousePos.y;

        // 2. Kiểm tra xem ứng dụng đang bật công cụ nào để áp dụng toán học tương ứng
        if (this.currentMode === 'translate') {
            // CÔNG CỤ 1: DI CHUYỂN (Tịnh tiến tọa độ X, Y của xương)
            this.selectedBone.position.x += deltaX;
            this.selectedBone.position.y += deltaY;
        } 
        else if (this.currentMode === 'rotate') {
            // CÔNG CỤ 2: XOAY (Tính toán góc xoay Radian bằng hàm lượng giác Atan2 dựa trên tâm của xương)
            const angle = Math.atan2(
                currentMousePos.y - this.selectedBone.position.y, 
                currentMousePos.x - this.selectedBone.position.x
            );
            this.selectedBone.rotation = angle;
        } 
        else if (this.currentMode === 'scale') {
            // CÔNG CỤ 3: PHÓNG TO / THU NHỎ (Tính toán tỷ lệ dựa trên khoảng cách kéo chuột ngang DeltaX)
            const scaleFactor = 1 + (deltaX * 0.005);
            // Giới hạn không cho phép thu nhỏ quá mức (tối thiểu là 0.1 lần kích thước gốc)
            this.selectedBone.scale.x = Math.max(0.1, this.selectedBone.scale.x * scaleFactor);
            this.selectedBone.scale.y = Math.max(0.1, this.selectedBone.scale.y * scaleFactor);
        }

        // 3. Cập nhật lại tọa độ chuột bắt đầu để chuẩn bị tính toán cho pixel di chuyển tiếp theo
        this.startMousePos = { ...currentMousePos };
    }

    /**
     * Gọi hàm này KHI NGƯỜI DÙNG THẢ CHUỘT RA (MouseUp)
     */
    handleMouseUp() {
        this.isDragging = false;
    }
}
