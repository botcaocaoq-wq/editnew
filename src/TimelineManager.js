// =========================================================================
// SCRIPT: TimelineManager.js
// CHỨC NĂNG: Quản lý thời gian, nút Play/Pause và hệ thống lưu Keyframe
// =========================================================================

class TimelineManager {
    constructor() {
        this.currentTime = 0;   // Thời gian hiện tại của thanh trượt (tính bằng giây)
        this.maxTime = 10;       // Tổng thời lượng tối đa của một clip (10 giây)
        this.isPlaying = false;  // Trạng thái hệ thống đang chạy hay đang dừng
        this.keyframes = [];    // Danh sách lưu keyframe: [{ time, boneId, position, rotation, scale }]
        this.animationFrameId = null; // Quản lý ID vòng lặp chạy thời gian thực
        
        this.initTimelineEvents(); // Kích hoạt lắng nghe các nút bấm trên giao diện
    }

    /**
     * Kết nối và lắng nghe sự kiện của các nút bấm Timeline trên giao diện HTML
     */
    initTimelineEvents() {
        const btnPlay = document.getElementById('btn-play');
        const btnKeyframe = document.getElementById('btn-keyframe');
        const track = document.getElementById('timeline-track');

        // Lắng nghe nút Play/Pause
        btnPlay?.addEventListener('click', () => this.togglePlay());

        // Lắng nghe nút bấm tạo điểm neo chuyển động (Keyframe)
        btnKeyframe?.addEventListener('click', () => {
            // Khi viết đến phần liên kết app, hệ thống sẽ lấy cục xương đang chọn để lưu lại vị trí
            if (window.appEngine && window.appEngine.gizmo.selectedBone) {
                this.addKeyframe(window.appEngine.appBones.selectedBone);
            } else {
                console.log("[Timeline] Chưa chọn khớp xương nào trên màn hình để gắn Keyframe!");
            }
        });

        // Click chuột vào một điểm bất kỳ trên thanh timeline để tua thời gian (Scrubbing)
        track?.addEventListener('click', (e) => {
            const rect = track.getBoundingClientRect();
            const clickX = e.clientX - rect.left; // Lấy vị trí chuột bấm trên thanh rãnh
            const percentage = clickX / rect.width; // Tính tỷ lệ phần trăm % vị trí click
            this.seek(percentage * this.maxTime);   // Tua thời gian tương ứng
        });
    }

    /**
     * Bật/Tắt trạng thái chạy thời gian (Chức năng Play/Pause)
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btnPlay = document.getElementById('btn-play');
        
        if (btnPlay) {
            btnPlay.innerText = this.isPlaying ? '⏸ Pause' : '▶ Play';
        }

        if (this.isPlaying) {
            this.lastTime = performance.now();
            this.runClock(); // Chạy đồng hồ đếm giờ
        } else {
            cancelAnimationFrame(this.animationFrameId); // Dừng đồng hồ
        }
    }

    /**
     * Vòng lặp tính toán thời gian thực trôi qua dựa trên hiệu năng máy tính (Delta Time)
     */
    runClock() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // Đổi mili-giây sang giây
        this.lastTime = now;

        this.seek(this.currentTime + deltaTime); // Cộng dồn thời gian chạy tiếp

        // Nếu chạy hết 10 giây thì tự động quay về 0 (Vòng lặp Loop)
        if (this.currentTime >= this.maxTime) {
            this.seek(0);
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.runClock());
    }

    /**
     * Hàm tua và cập nhật vị trí thanh kim thời gian hiển thị ra màn hình
     * @param {Number} time - Số giây muốn nhảy tới
     */
    seek(time) {
        // Đảm bảo thời gian không bị âm hoặc vượt quá số giây tối đa
        this.currentTime = Math.max(0, Math.min(this.maxTime, time));
        
        // Đẩy phần trăm vị trí sang CSS để dịch chuyển thanh kim màu đỏ
        const playhead = document.getElementById('playhead');
        const timeDisplay = document.getElementById('time-display');
        
        if (playhead) {
            playhead.style.left = `${(this.currentTime / this.maxTime) * 100}%`;
        }
        if (timeDisplay) {
            timeDisplay.innerText = `${this.currentTime.toFixed(2)}s / ${this.maxTime.toFixed(2)}s`;
        }

        // (Sau này code liên kết sẽ gọi hàm render cập nhật vị trí xương tại giây này)
    }

    /**
     * Ghi nhớ thông số Vị trí/Xoay/Scale của xương vào danh sách Keyframe
     * @param {Object} bone - Khớp xương cần lưu thông tin
     */
    addKeyframe(bone) {
        const roundedTime = parseFloat(this.currentTime.toFixed(2));
        
        // Nếu tại giây này, cục xương này đã có Keyframe rồi -> Xóa cái cũ đi để đè cái mới lên
        this.keyframes = this.keyframes.filter(k => !(k.time === roundedTime && k.boneId === bone.id));

        // Tiến hành lưu trữ một bản sao tọa độ hiện tại
        const newKf = {
            time: roundedTime,
            boneId: bone.id,
            position: { ...bone.position },
            rotation: bone.rotation,
            scale: { ...bone.scale }
        };
        
        this.keyframes.push(newKf);
        // Sắp xếp danh sách theo thứ tự thời gian tăng dần từ 0s -> 10s
        this.keyframes.sort((a, b) => a.time - b.time);
        
        console.log(`[Timeline] Đã chốt điểm Keyframe cho xương tại mốc ${roundedTime}s!`, newKf);
    }
}
