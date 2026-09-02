class TimelineManager {
    constructor() {
        this.currentTime = 0;   
        this.maxTime = 10;       
        this.isPlaying = false;  
        this.keyframes = [];    
        this.animationFrameId = null; 
        this.initTimelineEvents(); 
    }

    initTimelineEvents() {
        const btnPlay = document.getElementById('btn-play');
        const btnKeyframe = document.getElementById('btn-keyframe');
        const track = document.getElementById('timeline-track');

        btnPlay?.addEventListener('click', () => this.togglePlay());

        btnKeyframe?.addEventListener('click', () => {
            // Sửa lỗi kết nối trực tiếp đến bộ tổng appEngine
            if (window.appEngine && window.appEngine.gizmo.selectedBone) {
                this.addKeyframe(window.appEngine.gizmo.selectedBone);
            } else {
                alert("Vui lòng click chọn 1 cục xương trên màn hình trước khi tạo Keyframe!");
            }
        });

        track?.addEventListener('click', (e) => {
            const rect = track.getBoundingClientRect();
            const clickX = e.clientX - rect.left; 
            const percentage = clickX / rect.width; 
            this.seek(percentage * this.maxTime);   
        });
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btnPlay = document.getElementById('btn-play');
        if (btnPlay) {
            btnPlay.innerText = this.isPlaying ? '⏸ Pause' : '▶ Play';
        }

        if (this.isPlaying) {
            this.lastTime = performance.now();
            this.runClock(); 
        } else {
            cancelAnimationFrame(this.animationFrameId); 
        }
    }

    runClock() {
        if (!this.isPlaying) return;
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; 
        this.lastTime = now;

        this.seek(this.currentTime + deltaTime); 

        if (this.currentTime >= this.maxTime) {
            this.seek(0);
        }
        this.animationFrameId = requestAnimationFrame(() => this.runClock());
    }

    seek(time) {
        this.currentTime = Math.max(0, Math.min(this.maxTime, time));
        const playhead = document.getElementById('playhead');
        const timeDisplay = document.getElementById('time-display');
        
        if (playhead) playhead.style.left = `${(this.currentTime / this.maxTime) * 100}%`;
        if (timeDisplay) timeDisplay.innerText = `${this.currentTime.toFixed(2)}s / ${this.maxTime.toFixed(2)}s`;

        if (window.appEngine) {
            window.appEngine.applyKeyframesAtTime(this.currentTime);
        }
    }

    addKeyframe(bone) {
        const roundedTime = parseFloat(this.currentTime.toFixed(2));
        this.keyframes = this.keyframes.filter(k => !(k.time === roundedTime && k.boneId === bone.id));

        const newKf = {
            time: roundedTime,
            boneId: bone.id,
            position: { ...bone.position },
            rotation: bone.rotation,
            scale: { ...bone.scale }
        };
        this.keyframes.push(newKf);
        this.keyframes.sort((a, b) => a.time - b.time);
        console.log(`[Timeline] Đã lưu Keyframe tại ${roundedTime}s!`, newKf);
    }
}
